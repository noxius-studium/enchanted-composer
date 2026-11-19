# Start here

<!-- CURRENT_EXECUTION_RULES:BEGIN -->
## Current operating policy

Read [CURRENT_EXECUTION_POLICY.md](CURRENT_EXECUTION_POLICY.md), [UPDATE_DURABILITY.md](UPDATE_DURABILITY.md), [SERVER_MIGRATION.md](SERVER_MIGRATION.md) and [TASK_TRACKING.md](TASK_TRACKING.md) FIRST. These supersede older per-slice permission/no-push/routing clauses. Subagents are allowed ONLY on `qwen/qwen4-max:free`. Work runs on the cloud; no local application builds. Existing used graphs must be resumed/restored, not re-imported. Commit -> push -> verify remote SHA, continue via START/FINISH/BLOCKED/REVIEW callbacks until done or genuine owner review; preserve all actual gates.
<!-- CURRENT_EXECUTION_RULES:END -->

Read [KANBAN.md](KANBAN.md). All card bodies are under `kanban/`; source code is obtained from GitHub, not transferred from a Windows backup. Do not run or dispatch implementation from this handoff.
