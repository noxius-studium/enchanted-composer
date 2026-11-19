# Stable task tracking and resume index

This is a repository index, NOT a live task-status snapshot. Existing board task IDs, actual status/claims/runs and delivered callbacks must be read back on the cloud. Do not re-import/replay completed work. Use CURRENT_EXECUTION_POLICY.md and CALLBACK_SCHEMA.json; preserve callback subscriptions across updates by explicit re-binding after a board/server transfer.

| Stable key | Existing predecessor | Available historical receipt/evidence (not fresh acceptance) |
|---|---|---|
| EC-R00 | none | `preservation/EC-R00-preservation-report.md` |
| EC-R01 | EC-R00 | `inventory/EC-R01-interaction-inventory.md` |
| EC-R02 | EC-R01 | Read actual board/worker receipts; no status invented |
| EC-R03 | EC-R02 | Read actual board/worker receipts; no status invented |
| EC-R04 | EC-R03 | Read actual board/worker receipts; no status invented |
| EC-R05 | EC-R04 | `evidence/EC-R05/W1-review-packet.md` |
| EC-R06 | EC-R05 | Read actual board/worker receipts; no status invented |
| EC-R07 | EC-R06 | Read actual board/worker receipts; no status invented |
| EC-R08 | EC-R07 | Read actual board/worker receipts; no status invented |
| EC-R09 | EC-R08 | Read actual board/worker receipts; no status invented |
| EC-R10 | EC-R09 | Read actual board/worker receipts; no status invented |
| EC-R11 | EC-R10 | Read actual board/worker receipts; no status invented |
| EC-R12 | EC-R11 | Read actual board/worker receipts; no status invented |
| EC-R13 | EC-R12 | Read actual board/worker receipts; no status invented |
| EC-R14 | EC-R13 | Read actual board/worker receipts; no status invented |
| EC-R15 | EC-R14 | Read actual board/worker receipts; no status invented |
| EC-R16 | EC-R15 | Read actual board/worker receipts; no status invented |
| EC-R17 | EC-R16 | Read actual board/worker receipts; no status invented |
| EC-R18 | EC-R17 | Read actual board/worker receipts; no status invented |
| EC-R19 | EC-R18 | Read actual board/worker receipts; no status invented |
| EC-R20 | EC-R19 | Read actual board/worker receipts; no status invented |
| EC-R21 | EC-R20 | Read actual board/worker receipts; no status invented |
| EC-R22 | EC-R21 | Read actual board/worker receipts; no status invented |

After migration, append/read back the latest operational policy to existing unfinished task threads, confirm actual identity/route, and resume the actual first unfinished eligible task. Completed state and owner-review gates remain preserved. Do not use the fresh zero-run importer as a migration/recovery mechanism.
