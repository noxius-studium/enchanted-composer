# Upgrading to Enchanted Composer 0.2

The product has a new name, not a destructive storage reset. The technical plugin ID, archive root, Python package, environment variables, and backend wire IDs remain compatible with `composer-enhancements`. Desktop navigation uses `/enchanted-composer`; `/composer-enhancements` remains an alias. Do not install a second renamed copy beside the old one.

1. Export your prompt library before upgrading.
2. Finish any active voice call and pending tool work yourself.
3. Install the unified release through Hermes Plugins. Do not replace only `desktop/plugin.js`.
4. Allow the updated Python routes to activate during a normal Hermes restart; never force-stop an active gateway just for this upgrade.
5. Confirm both plugin halves remain enabled. Open Enchanted Composer and check the owner shown in its settings header.
6. Test an audio preference change. Wait for **All changes saved**, reopen the page, and confirm the selected value. On failure, the pending edit remains and **Retry save** is available.

Existing prompt IDs and library schema v1/v2/v3 migration are preserved. Incomplete editor drafts are stored separately and are not applied until name and instructions are valid. JSON import remains an explicit preview/confirm operation with an in-page rollback option.

Legacy renderer voice defaults are adopted once, only for the first connection/profile with no backend settings. Existing backend settings win. Backend settings and local usage now live under `HERMES_HOME/plugin-data/enchanted-composer/`; the first access copies recognized `settings.json` and `usage.json` files from the former `HERMES_HOME/composer-enhancements/` owner scope when needed. New settings and pending retries use a connection/profile key; voice transcripts and audio are never placed in plugin storage.

No credential migration occurs: Codex keeps its normal login, and API keys stay server-side. Disable any separately installed predecessor voice/enhancement plugins manually after verifying this upgrade; this package does not change their enablement.
