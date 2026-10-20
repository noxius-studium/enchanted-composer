from __future__ import annotations

import argparse
import re
from pathlib import Path

SEMVER = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")
FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
SHA_LINE = re.compile(r"^sha:\s*([0-9a-f]{40})\s*$", re.MULTILINE)
VERSION_LINE = re.compile(r'^version:\s*"([0-9]+\.[0-9]+\.[0-9]+)"\s*$', re.MULTILINE)


def update_catalog_entry(path: Path, *, version: str, sha: str) -> None:
    if SEMVER.fullmatch(version) is None:
        raise ValueError(f"{version!r} is not a numeric semantic version")
    if FULL_SHA.fullmatch(sha) is None:
        raise ValueError("catalog pin must be a full lowercase 40-character commit SHA")

    text = path.read_text(encoding="utf-8")
    sha_match = SHA_LINE.search(text)
    version_match = VERSION_LINE.search(text)
    if sha_match is None:
        raise ValueError("catalog entry does not contain one full sha field")
    if version_match is None:
        raise ValueError("catalog entry does not contain one quoted semantic version field")

    old_sha = sha_match.group(1)
    old_version = version_match.group(1)
    if old_sha == sha and old_version == version:
        raise ValueError("catalog entry already points at this release")

    updated = text.replace(old_sha, sha).replace(old_version, version)
    if f"sha: {sha}" not in updated or f'version: "{version}"' not in updated:
        raise ValueError("catalog identity replacement was incomplete")
    path.write_text(updated, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Re-pin the official Hermes catalog entry.")
    parser.add_argument("entry", type=Path)
    parser.add_argument("--version", required=True)
    parser.add_argument("--sha", required=True)
    args = parser.parse_args()

    update_catalog_entry(args.entry, version=args.version, sha=args.sha)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
