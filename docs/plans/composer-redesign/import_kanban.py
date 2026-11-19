#!/usr/bin/env python3
"""Validate this GitHub handoff; optionally import BLOCKED cards on the target cloud host.

No dependencies for dry-run. Apply requires the existing Hermes CLI and PyYAML.
No agent/model invocation, dispatch, unblock, profile creation or routing changes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
TARGET='nonconformist-innovation'
PROVIDER='nous'
MODEL='tencent/hy4-flash:free'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def safe_path(root,relative):
    p=(root/relative).resolve()
    if not p.is_relative_to(root.resolve()):
        raise ValueError('Unsafe manifest path: '+relative)
    return p

def validate(root=ROOT):
    manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
    if manifest['target_connection']!=TARGET or manifest['start_workers'] is not False:
        raise ValueError('Wrong target or unsafe execution setting')
    if digest(safe_path(root,manifest['specification']).read_bytes())!=manifest['specification_sha256']:
        raise ValueError('Specification hash mismatch; regenerate the handoff deliberately')
    cards=manifest['cards']
    if [c['key'] for c in cards]!=[f'EC-R{i:02}' for i in range(23)]:
        raise ValueError('Expected the exact EC-R00 through EC-R22 sequence')
    for i,c in enumerate(cards):
        if c['depends_on']!=([cards[i-1]['key']] if i else []):
            raise ValueError('Invalid dependency chain: '+c['key'])
        if c['initial_status']!='blocked' or c['goal_mode'] is not False:
            raise ValueError('Unsafe initial status/goal loop: '+c['key'])
        if c['provider']!=PROVIDER or c['model']!=MODEL:
            raise ValueError('Wrong task route: '+c['key'])
        if digest(safe_path(root,c['body_file']).read_bytes())!=c['body_sha256']:
            raise ValueError('Card body hash mismatch: '+c['key'])
    for ref in manifest['references']:
        if digest(safe_path(root,ref['file']).read_bytes())!=ref['sha256']:
            raise ValueError('Reference hash mismatch: '+ref['file'])
    return manifest

def cli_json(cli,board,args,cwd):
    p=subprocess.run([cli,'kanban','--board',board,*args],cwd=cwd,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=120,check=False)
    if p.returncode:
        raise RuntimeError('Hermes command failed: '+str(args[:2])+'\n'+p.stdout+'\n'+p.stderr)
    decoder=json.JSONDecoder()
    for i,ch in enumerate(p.stdout):
        if ch not in '{[':
            continue
        try:
            result,end=decoder.raw_decode(p.stdout[i:])
        except json.JSONDecodeError:
            continue
        if isinstance(result,(dict,list)) and not p.stdout[i+end:].strip():
            return result
    raise ValueError('Hermes did not return parseable JSON')

def task_row(result):
    if not isinstance(result,dict):
        raise TypeError('Expected task object')
    return result.get('task',result)

def verify_task(result,card,assignee,body,parent_ids):
    row=task_row(result)
    if row.get('status')!='blocked':
        raise ValueError('Task is not blocked: '+card['key'])
    if row.get('assignee')!=assignee:
        raise ValueError('Wrong assignee: '+card['key'])
    if row.get('provider_override',row.get('provider'))!=PROVIDER or row.get('model_override',row.get('model'))!=MODEL:
        raise ValueError('Persisted route mismatch: '+card['key'])
    if row.get('body','')!=body:
        raise ValueError('Persisted body mismatch: '+card['key'])
    if row.get('current_run_id') or row.get('started_at') or result.get('runs'):
        raise ValueError('Unexpected run history; will not reset task: '+card['key'])
    parents=result.get('parents',row.get('parents'))
    if parents is None:
        raise ValueError('Read-back omitted parents: '+card['key'])
    actual=[p.get('id',p.get('parent_id')) if isinstance(p,dict) else p for p in parents]
    if sorted(actual)!=sorted(parent_ids):
        raise ValueError('Persisted parent chain mismatch: '+card['key'])
    return row

def check_profile(path):
    import yaml
    config=yaml.safe_load(path.read_text(encoding='utf-8')) or {}
    route=config.get('model',{})
    if not isinstance(route,dict) or route.get('provider')!=PROVIDER or route.get('default')!=MODEL:
        raise ValueError('Cloud profile route differs from the approved Nous route; obtain a routing decision instead of changing it')
    for obj in (config,route):
        if any(obj.get(k) for k in ('fallback','fallbacks','fallback_model','fallback_models','fallback_chain')):
            raise ValueError('A fallback route is configured; keep cards blocked and resolve explicitly')
    if config.get('moa',{}).get('enabled'):
        raise ValueError('MoA is active; delegation is forbidden')
    if 'delegation' not in config.get('agent',{}).get('disabled_toolsets',[]):
        raise ValueError('Delegation toolset is not explicitly disabled for the cloud worker')

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true',help='Create blocked cards; never starts workers')
    parser.add_argument('--board')
    parser.add_argument('--assignee',help='Actual existing cloud profile, not the connection name')
    parser.add_argument('--workspace',type=Path)
    parser.add_argument('--profile-config',type=Path)
    parser.add_argument('--confirm-target',choices=[TARGET])
    parser.add_argument('--receipt',type=Path,default=ROOT/'import-receipt.local.json')
    args=parser.parse_args(argv)
    manifest=validate()
    if not args.apply:
        print(json.dumps({'mode':'dry-run','target':TARGET,'card_count':len(manifest['cards']),'initial_status':'blocked','dependencies':[(c['key'],c['depends_on']) for c in manifest['cards']],'payload_hashes':'verified','worker_start':False,'writes':0},indent=2))
        return 0
    if not all((args.board,args.assignee,args.workspace,args.profile_config,args.confirm_target)):
        parser.error('--apply requires explicit board, actual assignee, absolute workspace, profile-config and target confirmation')
    if not args.workspace.is_absolute() or not args.workspace.is_dir():
        parser.error('Workspace must be an existing absolute path on this cloud host')
    if not args.profile_config.is_file():
        parser.error('Actual cloud profile config is required; no profile will be created')
    check_profile(args.profile_config)
    git=shutil.which('git')
    cli=shutil.which('hermes')
    if not cli or not git:
        raise ValueError('Existing git and Hermes CLI are required; no installation will be attempted')
    check=subprocess.run([git,'-C',str(args.workspace),'merge-base','--is-ancestor',manifest['baseline_commit'],'HEAD'],capture_output=True,check=False)
    if check.returncode:
        raise ValueError('Original Composer baseline is not a verified ancestor of this workspace')
    branch=subprocess.check_output([git,'-C',str(args.workspace),'branch','--show-current'],text=True).strip()
    if branch=='feature/enchanted-workbench':
        raise ValueError('Rejected workbench branch is not an approved source workspace')
    help_result=subprocess.run([cli,'kanban','create','--help'],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=90,check=False)
    if help_result.returncode or '--body-file' not in help_result.stdout or '--initial-status' not in help_result.stdout:
        raise ValueError('Target CLI lacks the required safe body-file/blocked import contract')
    receipt={'target':TARGET,'board':args.board,'assignee':args.assignee,'workspace':str(args.workspace),'provider':PROVIDER,'model':MODEL,'started_workers':False,'cards':[]}
    resolved={}
    staging=args.receipt.parent/(args.receipt.stem+'-payloads')
    staging.mkdir(parents=True,exist_ok=True)
    def save_receipt():
        args.receipt.parent.mkdir(parents=True,exist_ok=True)
        args.receipt.write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
    save_receipt()
    for card in manifest['cards']:
        parents=[resolved[key] for key in card['depends_on']]
        binding=f'\n\n## Verified import binding\nCloud connection: {TARGET}\nActual cloud assignee: {args.assignee}\nBoard: {args.board}\nAbsolute cloud workspace: {args.workspace}\nInitial state: BLOCKED; no execution authorized.\n'
        body=safe_path(ROOT,card['body_file']).read_text(encoding='utf-8')+binding
        body_path=staging/(card['key']+'.md')
        body_path.write_bytes(body.encode())
        cmd=['create',card['key']+' — '+card['title'],'--body-file',str(body_path),'--assignee',args.assignee,'--workspace','dir:'+str(args.workspace),'--tenant','enchanted-composer-redesign','--priority',str(card['priority']),'--idempotency-key',card['idempotency_key'],'--initial-status','blocked','--provider',PROVIDER,'--model',MODEL,'--completion-contract','local-only','--max-runtime',card['max_runtime'],'--max-retries',str(card['max_retries']),'--json']
        for parent in parents:
            cmd.extend(['--parent',parent])
        created=cli_json(cli,args.board,cmd,args.workspace)
        row=task_row(created)
        tid=row.get('id') or created.get('task_id')
        if not tid:
            raise ValueError('Create response omitted task ID: '+card['key'])
        # Persist every successful target immediately so an interrupted import is recoverable.
        resolved[card['key']]=tid
        entry={'key':card['key'],'id':tid,'body_sha256':digest(body.encode()),'verified':False}
        receipt['cards'].append(entry)
        save_receipt()
        shown=cli_json(cli,args.board,['show',tid,'--json'],args.workspace)
        verify_task(shown,card,args.assignee,body,parents)
        entry['verified']=True
        save_receipt()
    # Exact final read-back, not only the create banner.
    for card,entry in zip(manifest['cards'],receipt['cards']):
        body=(staging/(card['key']+'.md')).read_text(encoding='utf-8')
        shown=cli_json(cli,args.board,['show',entry['id'],'--json'],args.workspace)
        verify_task(shown,card,args.assignee,body,[resolved[k] for k in card['depends_on']])
    receipt['all_blocked_verified']=True
    receipt['zero_runs_verified']=True
    save_receipt()
    print(json.dumps(receipt,indent=2))
    return 0

if __name__=='__main__':
    try:
        raise SystemExit(main())
    except (ValueError,TypeError,RuntimeError,OSError,subprocess.SubprocessError) as error:
        print('Import stopped safely: '+str(error),file=sys.stderr)
        raise SystemExit(1)
