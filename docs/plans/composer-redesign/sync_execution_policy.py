#!/usr/bin/env python3
"""Synchronize latest operational policy without recreating cards or changing product code."""
from pathlib import Path
import hashlib
import json
import re

ROOT=Path(__file__).resolve().parent
BEGIN='<!-- CURRENT_EXECUTION_RULES:BEGIN -->'
END='<!-- CURRENT_EXECUTION_RULES:END -->'
MODEL='qwen/qwen4-max:free'

def put(path,text):
    path.write_bytes(text.replace('\r\n','\n').encode('utf-8'))

def sha(data):return hashlib.sha256(data).hexdigest()

def graph_rows(manifest):
    return [{k:c[k] for k in ('key','depends_on','idempotency_key')} for c in manifest['cards']]

def strip_block(text):
    return re.sub(r'\n?'+re.escape(BEGIN)+r'.*?'+re.escape(END)+r'\n?', '\n', text, flags=re.S).strip()+'\n'

def replace_operational_clauses(text):
    changed=[]
    for line in text.splitlines():
        if line.startswith(('- All cards are initially BLOCKED.','- All imported cards start BLOCKED.')):
            line='- Fresh import starts BLOCKED; existing graphs retain their actual states. Preparation starts no workers. After chain authorization, continue eligible linked tasks until done, genuine review or a real blocker; never replay completed work.'
        elif line.startswith('- Provider/model restrictions retained from the approved planning request:'):
            line='- Current worker route: exactly qwen/qwen4-max:free for main and every permitted subagent, using the verified cloud provider. No alternate-model/provider fallback. CURRENT_EXECUTION_POLICY.md supersedes older worker restrictions; no profile reconfiguration to manufacture a match.'
        elif line.startswith('- Local commit required for each completed slice:'):
            line='- Each scoped commit MUST be pushed to the authorized non-main branch, followed by exact remote-SHA read-back and a CALLBACK FINISH receipt before advancing. No empty commits, unrelated staging, force pushes, main/release/deployment or live-system changes.'
        elif line.startswith('- Start callback BEFORE edits:'):
            line='- Required durable callbacks: CALLBACK START before edits, CALLBACK FINISH with real checks/commit/push/remote SHA, CALLBACK BLOCKED with preserved partial work, and CALLBACK REVIEW at actual owner gates. Verify delivery to the existing task and preserve receipts; no routine continuation prompt.'
        elif line.startswith('- Commit permission is not push/merge/deployment permission.'):
            line='- The owner now requires scoped commit -> push -> remote-SHA verification. Main, merge, release, deployment and protected live actions remain separately protected.'
        elif line.startswith('8. Mark only verified scope complete. Report open gates and do not start/unblock the next card on your own.'):
            line='8. Mark only verified scope complete; retain acceptance gaps. Continue the already-authorized eligible chain through callbacks, stopping at done, actual owner review or a real blocker. Push each scoped commit and verify remote SHA; no main/deployment permission.'
        replacements=[
          ('No automatic implementation pushes','Push every scoped implementation commit and verify its exact remote SHA'),
          ('Once a slice is separately authorized to run,','Once its chain/wave is authorized,'),
          ('Do not unblock/dispatch successors yourself.','Preparation starts none; after chain authorization continue only eligible existing successors until done or actual review.'),
          ('Local commits do not authorize future pushes or deployment.','Scoped branch pushes are now required; main/deployment remain protected.'),
          ('This does not authorize a push, merge or deployment.','Scoped branch pushes are now authorized and required; main/merge/deployment remain protected.'),
          ('Push, merge and deployment remain separately authorized.','Scoped branch pushes are now required; merge/deployment remain protected.'),
          ('Pushes, merges, force pushes, release creation and deployments are not authorized by it.','Scoped branch pushes are now required; merges, force pushes, release creation and deployments remain protected.'),
          ('State `committed locally; not pushed` unless a separately authorized push was performed and verified.','Record the required scoped push and exact read-back remote SHA, not merely a command banner.'),
          ('No push/merge without approval','Scoped branch push is required by the latest policy; no merge/deployment without approval'),
          ('- Restart Hermes, push commits, publish packages, or remove Prompt Studio.','- Restart Hermes, push main/tags/releases, publish packages, or remove Prompt Studio.'),
          ('Do not run a delegated reviewer','Use delegated work/review only on the exact pinned Qwen model'),
          ('delegation off','delegation permitted only on the exact pinned Qwen model'),
          ('no Codex, no delegation, no fallback','no Codex, Qwen-only delegation, no fallback'),
          ('no Codex, no delegation','no Codex, Qwen-only delegation'),
          ('`nous / tencent/hy4-flash:free`','`verified cloud provider / qwen/qwen4-max:free`'),
          ('User-approved worker route remains','Current worker route is'),
          ('Do not automatically unblock/start successors.','Once the chain is authorized, continue eligible existing successors through callbacks until done or actual owner review.'),
          ('A scoped commit does not authorize push/merge/deployment.','Scoped commit -> push -> verified remote SHA is now required; main/merge/deployment remain protected.'),
        ]
        for old,new in replacements:line=line.replace(old,new)
        changed.append(line)
    return '\n'.join(changed).strip()+'\n'

def add_block(text,block):
    plain=strip_block(text)
    first,sep,rest=plain.partition('\n')
    return first+'\n\n'+BEGIN+'\n'+block.rstrip()+'\n'+END+'\n\n'+rest.lstrip('\n')

def main():
    manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
    preserved=ROOT/'PRESERVED_TASK_GRAPH.json'
    before=graph_rows(manifest)
    if preserved.exists():
        if json.loads(preserved.read_text(encoding='utf-8'))!=before:
            raise ValueError('Existing graph identity changed; do not manufacture new tasks')
    else:put(preserved,json.dumps(before,indent=2)+'\n')
    policy=(ROOT/'CURRENT_EXECUTION_POLICY.md').read_text(encoding='utf-8')
    durability=(ROOT/'UPDATE_DURABILITY.md').read_text(encoding='utf-8')
    block=policy+'\n'+durability
    for card in manifest['cards']:
        path=ROOT/card['body_file']
        body=add_block(replace_operational_clauses(path.read_text(encoding='utf-8')),block)
        put(path,body)
        card['body_sha256']=sha(path.read_bytes())
        card.update(per_slice_commit_required=True,push_after_every_commit_required=True,verify_remote_sha_required=True,auto_continue_until_done_or_review=True,callback_events=['START','FINISH','BLOCKED','REVIEW'],update_durability_required=True)
    for filename in ('KANBAN.md','README.md','START_HERE.md','EXECUTION_POLICY.md','DURABILITY.md'):
        path=ROOT/filename
        if path.exists():
            note='## Current operating policy\n\nRead [CURRENT_EXECUTION_POLICY.md](CURRENT_EXECUTION_POLICY.md), [UPDATE_DURABILITY.md](UPDATE_DURABILITY.md), [SERVER_MIGRATION.md](SERVER_MIGRATION.md) and [TASK_TRACKING.md](TASK_TRACKING.md) FIRST. These supersede older per-slice permission/no-push/routing clauses. Subagents are allowed ONLY on `qwen/qwen4-max:free`. Work runs on the cloud; no local application builds. Existing used graphs must be resumed/restored, not re-imported. Commit -> push -> verify remote SHA, continue via START/FINISH/BLOCKED/REVIEW callbacks until done or genuine owner review; preserve all actual gates.\n'
            put(path,add_block(replace_operational_clauses(path.read_text(encoding='utf-8')),note))
    spec=ROOT/manifest['specification']
    note='## Latest execution-policy precedence\n\nCURRENT_EXECUTION_POLICY.md, UPDATE_DURABILITY.md and SERVER_MIGRATION.md supersede older operational route/delegation/no-push/per-slice-permission/test-stack advice in this historical specification. Product scope, current owner decisions and genuine review gates remain intact. Implementation is CLOUD-only; all worker/subagent models are exactly qwen/qwen4-max:free; every scoped commit is pushed and remotely verified; continue authorized linked work through callbacks until done or actual owner review. Historical receipts remain historical evidence, not new test results.\n'
    put(spec,add_block(spec.read_text(encoding='utf-8'),note))
    manifest['specification_sha256']=sha(spec.read_bytes())
    manifest.update(execution_policy_version=2,worker_model=MODEL,delegation_allowed=True,delegation_model=MODEL,resume_existing_tasks=True,local_application_builds_allowed=False,callback_policy=['START','FINISH','BLOCKED','REVIEW'],git_policy={'commit_each_slice':True,'push_each_commit':True,'verify_remote_sha':True,'continue_until_done_or_user_review':True,'main_release_push_authorized':False},durability_policy={'required':True,'preserve_data_and_task_identity':True,'no_private_hermes_dependencies':True,'restore_callback_subscriptions':True,'arbitrary_future_breaking_update_guarantee':False})
    manifest['testing_policy']={**manifest.get('testing_policy',{}),'docker_allowed':False,'heavyweight_test_stacks_allowed':False,'parallel_heavy_checks_allowed':False,'honour_existing_build_only_mode':True}
    manifest['policy_files']=[{'file':name,'sha256':sha((ROOT/name).read_bytes())} for name in ('CURRENT_EXECUTION_POLICY.md','UPDATE_DURABILITY.md','SERVER_MIGRATION.md','CALLBACK_SCHEMA.json','PRESERVED_TASK_GRAPH.json')]
    put(ROOT/'manifest.json',json.dumps(manifest,indent=2)+'\n')
    report='# Stable task tracking and resume index\n\nThis is a repository index, NOT a live task-status snapshot. Existing board task IDs, actual status/claims/runs and delivered callbacks must be read back on the cloud. Do not re-import/replay completed work. Use CURRENT_EXECUTION_POLICY.md and CALLBACK_SCHEMA.json; preserve callback subscriptions across updates by explicit re-binding after a board/server transfer.\n\n| Stable key | Existing predecessor | Available historical receipt/evidence (not fresh acceptance) |\n|---|---|---|\n'
    evidence=[]
    for directory in ('receipts','preservation','inventory','evidence'):
        parent=ROOT/directory
        if parent.exists():evidence.extend(sorted(parent.rglob('*.md')))
    for card in manifest['cards']:
        matches=[str(p.relative_to(ROOT)).replace('\\','/') for p in evidence if card['key'] in str(p.relative_to(ROOT))]
        report+='| '+card['key']+' | '+(', '.join(card['depends_on']) or 'none')+' | '+('; '.join('`'+p+'`' for p in matches) or 'Read actual board/worker receipts; no status invented')+' |\n'
    report+='\nAfter migration, append/read back the latest operational policy to existing unfinished task threads, confirm actual identity/route, and resume the actual first unfinished eligible task. Completed state and owner-review gates remain preserved. Do not use the fresh zero-run importer as a migration/recovery mechanism.\n'
    put(ROOT/'TASK_TRACKING.md',report)
    print(json.dumps({'policy_synchronized':True,'cards':len(manifest['cards']),'task_keys_links_idempotency_preserved':True,'callbacks':manifest['callback_policy'],'subagent_model':MODEL,'no_local_application_build':True},indent=2))

if __name__=='__main__':main()
