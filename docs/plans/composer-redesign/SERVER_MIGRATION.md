# Hermes Cloud migration and existing-task resume

The owner is moving execution to a larger CLOUD server. Do not build applications, start workers or install runtimes on the owner's local PC. This move does not waive no-Docker/heavy-test or current build-only rules and does not approve any pending owner review.

## 1. Inventory and checkpoint on the old cloud host

- Discover actual profile, HERMES_HOME, versions, boards and workspace paths. Record repo/branch/HEAD/status, stable key -> actual board/task/run ID, links, counts by status, active claims, owner decisions and precise review gates. A receipt alone does not establish live done status.
- Quiesce new claims using installed supported controls and preserve in-flight work at a safe checkpoint. Do not interrupt the owner's Desktop or the current agent before its handoff is durable. Never run both old and new dispatchers against the same active tasks.
- Commit safe scoped source/receipts, push their authorized non-main branch and verify the remote SHA. Preserve unrelated/uncommitted work privately if it can't safely be committed. No reset/clean/stash scheme that discards partial work; Git clone does not transfer uncommitted files.

## 2. Consistent private transfer

- Check installed help for `hermes kanban boards export` / `hermes kanban boards import`. The inspected implementation uses SQLite online backup rather than an unsafe copy of a live DB/WAL.
- Typical supported export: `hermes kanban boards export <actual-board-slug>`. Discover real names/options and use the reported archive, not literal placeholders. Transfer actual required board archives, attachments and private logs as appropriate through an authorized secure channel, NEVER GitHub.
- IMPORTANT observed semantics: export/import strips machine-local claims, PIDs, session/project bindings AND notification subscriptions. Running tasks are normalized and running run records released. Workspaces are NOT included. Task identity/history can be preserved, but a running process does not migrate. Inventory/reconcile expected transitions rather than asserting identical live state.
- Securely transfer approved profile settings, auth/secrets/key material, needed skills/plugins and other durable storage with correct scope/permissions. Do not print credentials or blindly copy the Windows runtime. Board archive and Git repo are not the whole profile.
- Record/verify transfer hashes and counts; retain rollback copies. Larger RAM doesn't authorize heavy downloads or a new service stack.

## 3. Restore with dispatch held

- Verify actual versions/tool schemas on the new server and hold dispatch BEFORE import; normalized ready tasks must not start prematurely. Use supported controls; no guessed profile edits.
- Check destination boards first. Supported import: `hermes kanban boards import <verified-archive>`. It may rename a colliding slug: inspect the actual returned identity; don't assume the old slug or create duplicate graphs. Don't overwrite an existing new-host board blindly.
- Clone/fetch repositories, check out the correct work branches and pull without losing work. Restore safe partial work, verify pushed checkpoint/baseline ancestry and reconstruct actual absolute CLOUD workspaces. Rebind old workspace/project/profile references through supported tools and read back exact targets.
- DO NOT run fresh `import_kanban.py --apply` against a used graph. It deliberately requires blocked/zero-run tasks; stable idempotency keys don't reconstruct completion/runs/review state. Missing original board/backup is a real recovery blocker: reconcile actual receipts/IDs with the owner rather than inventing every card as new or done.
- Verify IDs, links, comments, run history, attachments and status counts against the old inventory, accounting for released claims/ready transitions. Preserve completed/review/blocked states. Inspect an interrupted task's partial workspace before resuming the same task.

## 4. Rebind callbacks and resume

- Restore task-event notification subscriptions to the correct new-host conversation/channel through the supported API/UI. The inspected transfer removes them. Verify an actual harmless callback arrives; a subscription write or receipt file alone is not delivery evidence. Keep channels/secrets out of public artifacts.
- Add and read back a CURRENT_EXECUTION_POLICY.md / UPDATE_DURABILITY.md operational-policy comment on EXISTING unfinished tasks. Preserve task body history/runs/IDs; do not recreate the graph or overwrite completed evidence to refresh policy. Reconfirm exact main and delegated `qwen/qwen4-max:free` and actual provider.
- Emit CALLBACK START for the actual resumed task. Resume one eligible authorized task and route the existing chain on callbacks: scoped commit -> PUSH -> exact remote-SHA verification -> CALLBACK FINISH -> next eligible existing task. No routine continuation questions, polling loops or duplicate dispatch.
- Stop only at done, actual owner review or concrete blocker. Composer EC-R05 remains its existing W1 review gate; this policy is not EC-R06 approval. Grove continues its actual first unfinished card with recorded owner decisions/build-only policy intact. FluidMusic has its own complete-provider scope/final review; don't mix the three products.

## Migration acceptance receipt

Report old/new host identity without secrets; actual profile/provider/main/child routes; real board/task mapping; before/after counts and documented state transitions; source branch/commit/remote verification; preserved partial work; restored links/attachments/history; notification re-subscription AND delivered callback; first resumed existing task or precise pending review; unverified product runtime acceptance; rollback readiness. Do not claim migration succeeded merely because Git pull or board import returned success.
