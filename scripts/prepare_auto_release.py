from __future__ import annotations

import argparse
import re
from pathlib import Path

SEMVER = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")
VERSION_FILES = (
    Path("plugin.yaml"),
    Path("pyproject.toml"),
    Path("__init__.py"),
    Path("dashboard/manifest.json"),
    Path("uv.lock"),
    Path("README.md"),
    Path("docs/installation.md"),
)


def read_version(root: Path) -> str:
    text = (root / "plugin.yaml").read_text(encoding="utf-8")
    match = re.search(r"^version:\s*([^\s#]+)", text, flags=re.MULTILINE)
    if match is None or SEMVER.fullmatch(match.group(1)) is None:
        raise ValueError("plugin.yaml must contain a numeric semantic version")
    return match.group(1)


def bump_version(root: Path, new_version: str) -> tuple[Path, ...]:
    if SEMVER.fullmatch(new_version) is None:
        raise ValueError(f"{new_version!r} is not a numeric semantic version")

    old_version = read_version(root)
    if new_version == old_version:
        raise ValueError(f"version is already {new_version}")

    replacements: list[tuple[Path, str]] = []
    for relative in VERSION_FILES:
        path = root / relative
        text = path.read_text(encoding="utf-8")
        occurrences = text.count(old_version)
        if occurrences != 1:
            raise ValueError(
                f"expected exactly one {old_version!r} occurrence in {relative}, found {occurrences}"
            )
        replacements.append((path, text.replace(old_version, new_version)))

    for path, text in replacements:
        path.write_text(text, encoding="utf-8")
    return VERSION_FILES


def main() -> int:
    parser = argparse.ArgumentParser(description="Update every Enchanted Composer release version source.")
    parser.add_argument("version", help="Target numeric semantic version, for example 0.2.2")
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()

    changed = bump_version(args.root.resolve(), args.version)
    for relative in changed:
        print(relative.as_posix())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
