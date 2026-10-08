"""Build the single-file desktop runtime from ordered human-maintained fragments."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENTRY = ROOT / "desktop" / "plugin.js"
SOURCE_DIR = ROOT / "desktop" / "src"
PARTS = (
    "00-runtime.js", "05-contracts.js", "10-owner-router.js", "20-live-transcript-buffer.js",
    "30-delegation-bridge.js", "40-prompt-model.js", "50-composer-draft-adapter.js",
    "60-prompt-enhancer.js", "70-audio-device-controller.js", "72-voice-backend-contract.js",
    "74-enchanted-realtime-adapter.js", "76-composer-bridge-adapter.js", "80-live-voice-session-controller.js",
    "85-settings-store.js", "90-settings-ui.js", "95-composer-actions.js", "99-register.js",
)
def source_text(source_dir: Path = SOURCE_DIR) -> str:
    discovered = tuple(path.name for path in sorted(source_dir.glob("*.js")))
    if discovered != PARTS: raise ValueError(f"desktop/src fragments do not match PARTS: declared {PARTS}, discovered {discovered}")
    return "".join((source_dir / part).read_text(encoding="utf-8") for part in PARTS)
def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__); parser.add_argument("--check",action="store_true"); args=parser.parse_args(); built=source_text()
    if args.check:
        if not ENTRY.is_file() or ENTRY.read_text(encoding="utf-8") != built: print("desktop/plugin.js is stale; run: python scripts/build_desktop.py",file=sys.stderr); return 1
        return 0
    ENTRY.write_text(built,encoding="utf-8",newline=""); return 0
if __name__ == "__main__": raise SystemExit(main())
