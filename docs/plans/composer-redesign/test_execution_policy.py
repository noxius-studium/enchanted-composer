"""Two small checks for policy coverage and immutable task identity, not app builds."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('policy_importer',ROOT/'import_kanban.py')
imp=importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)
class ExecutionPolicyTests(unittest.TestCase):
    def test_all_cards_have_current_cloud_callback_push_and_durability_contract(self):
        m=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
        imp.validate_execution_policy(m,ROOT)
        for card in m['cards']:
            body=(ROOT/card['body_file']).read_text(encoding='utf-8')
            for phrase in ['CURRENT_EXECUTION_RULES:BEGIN','qwen/qwen4-max:free','CALLBACK START','CALLBACK FINISH','CALLBACK BLOCKED','CALLBACK REVIEW','remote SHA','UPDATE_DURABILITY.md','NO Docker']:
                self.assertIn(phrase,body,card['key'])
        schema=json.loads((ROOT/'CALLBACK_SCHEMA.json').read_text(encoding='utf-8'))
        self.assertEqual(schema['properties']['event']['enum'],['START','FINISH','BLOCKED','REVIEW'])
        self.assertEqual(schema['properties']['model']['const'],'qwen/qwen4-max:free')
        self.assertEqual(schema['properties']['delegation_models']['items']['const'],'qwen/qwen4-max:free')
    def test_policy_and_graph_tampering_fail_closed(self):
        original=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
        bad=copy.deepcopy(original)
        bad['git_policy']['push_each_commit']=False
        with self.assertRaisesRegex(ValueError,'commit/push'):
            imp.validate_execution_policy(bad,ROOT)
        bad=copy.deepcopy(original)
        bad['cards'][0]['idempotency_key']='intentionally-invalid-fixture'
        with self.assertRaisesRegex(ValueError,'Stable task'):
            imp.validate_execution_policy(bad,ROOT)
if __name__=='__main__':unittest.main()
