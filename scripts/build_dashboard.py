"""Build or verify Enchanted Composer' dependency-free Dashboard bundle."""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAIRS = (
    (ROOT / "dashboard" / "src" / "index.js", ROOT / "dashboard" / "dist" / "index.js"),
    (ROOT / "dashboard" / "src" / "style.css", ROOT / "dashboard" / "dist" / "style.css"),
)


def build(*, check: bool) -> bool:
    stale: list[str] = []
    for source, output in PAIRS:
        content = source.read_text(encoding="utf-8")
        if check:
            if not output.is_file() or output.read_text(encoding="utf-8") != content:
                stale.append(output.relative_to(ROOT).as_posix())
            continue
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content, encoding="utf-8", newline="\n")
    if stale:
        print("Dashboard bundle is stale: " + ", ".join(stale))
        return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    raise SystemExit(0 if build(check=args.check) else 1)


if __name__ == "__main__":
    main()
