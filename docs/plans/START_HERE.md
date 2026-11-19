# Enchanted Composer — NEW redesign handoff

Read [`composer-redesign/KANBAN.md`](composer-redesign/KANBAN.md) first, then [`SPECIFICATION.md`](composer-redesign/SPECIFICATION.md).

- Branch: `docs/composer-redesign-handoff`.
- Source baseline: `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0` — the preserved ORIGINAL Composer, not the rejected workbench.
- Target cloud agent connection: `nonconformist-innovation`.
- The 23 self-contained proposed card bodies are in `composer-redesign/kanban/EC-R00.md` through `EC-R22.md`.
- The canonical import manifest, importer and four supplied reference screenshots are in the same handoff directory.
- Source code is already in this GitHub branch. No Windows archive transfer is required.

## Boundary

Read and prepare/import the plan only. All imported cards must remain BLOCKED. No workers, implementation, live restore/install, deletion, profile/routing changes, or external publication are authorized by importing. Preserve existing boards/cards and the rejected worktree's history.

The actual cloud profile is not automatically the Windows `nous-agent` profile. Verify its configured provider/model and the existing restrictions before importing; block and ask on mismatch. Do not change routing to make the importer pass.

## Local dry-run on the cloud checkout

```sh
python docs/plans/composer-redesign/import_kanban.py
python docs/plans/composer-redesign/test_import_kanban.py
```

These commands validate files and safety logic; they do not call a model, create cards or start workers. Read KANBAN.md before any actual import. Windows paths in historical evidence are not cloud workspace paths.
