# Installation

1. Build `dist/enchanted-composer-0.2.0.zip` with `python scripts/package.py`.
2. Install the archive as a Hermes plugin and enable the backend plugin in Hermes configuration.
3. In Hermes Desktop, open **Settings → Plugins** and enable Enchanted Composer (the desktop half is opt-in).
4. For subscription voice, install the official Codex CLI and run `codex login` outside Hermes. Enchanted Composer intentionally does not read or manage Codex OAuth files.
5. In the web Dashboard, open **Plugins → Enchanted Composer** to check providers, choose voice defaults, and inspect local activity for the selected profile.
6. In Hermes Desktop, open the compact waveform action in the composer. Native Hermes controls remain unchanged.
7. In Desktop settings choose devices explicitly. For Composer Bridge, enter an endpoint that advertises `composerBridge:true` and the chosen provider.

Do not run native Hermes voice and Composer Live Voice concurrently; a busy device is reported and Composer releases its lease on End/disable/reload.

## Acceptance command

```sh
hermes plugins validate . --json
python scripts/build_desktop.py --check
python scripts/build_dashboard.py --check
```

Desktop acceptance requires the operator to start a real call, grant microphone permission, confirm devices, and verify the native voice/send control is unaffected.
