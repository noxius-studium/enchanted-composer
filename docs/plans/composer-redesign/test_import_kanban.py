"""Lean checks for the plan validator and fail-closed import read-back."""
import copy
import importlib.util
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('composer_kanban_import',HERE/'import_kanban.py')
importer=importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)

class HandoffChecks(unittest.TestCase):
    def test_manifest_payloads_and_complete_chain(self):
        manifest=importer.validate(HERE)
        self.assertEqual(len(manifest['cards']),23)
        self.assertFalse(manifest['start_workers'])
        self.assertEqual(manifest['cards'][-1]['key'],'EC-R22')
        for card in manifest['cards']:
            body=(HERE/card['body_file']).read_text(encoding='utf-8')
            self.assertIn('Hermes is the sole theme authority',body)
            self.assertIn('## Concrete acceptance scenarios',body)
            self.assertIn('## Intended source/write areas',body)
            self.assertIn('## 6. Icon redesign specification',body)
            self.assertIn('no fallback',body)

    def test_manifest_paths_cannot_escape_handoff(self):
        with self.assertRaises(ValueError):
            importer.safe_path(HERE,'../outside.md')
        self.assertEqual(importer.safe_path(HERE,'SPECIFICATION.md'),HERE/'SPECIFICATION.md')

    def test_readback_refuses_execution_and_drift(self):
        card={'key':'EC-R01'}
        expected={'task':{'id':'example-not-a-live-task','status':'blocked','assignee':'verified-cloud-profile','provider_override':'nous','model_override':'qwen/qwen4-max:free','body':'exact body','current_run_id':None,'started_at':None},'parents':[{'id':'example-parent-not-a-live-task'}],'runs':[]}
        importer.verify_task(expected,card,'verified-cloud-profile','exact body',['example-parent-not-a-live-task'])
        for field,bad_value in [('status','ready'),('body','truncated'),('provider_override','other'),('current_run_id','unexpected-run')]:
            altered=copy.deepcopy(expected)
            altered['task'][field]=bad_value
            with self.subTest(field=field),self.assertRaises(ValueError):
                importer.verify_task(altered,card,'verified-cloud-profile','exact body',['example-parent-not-a-live-task'])
        with self.assertRaises(ValueError):
            importer.verify_task(expected,card,'verified-cloud-profile','exact body',[])

if __name__=='__main__':
    unittest.main()
