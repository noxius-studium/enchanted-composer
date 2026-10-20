from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest

from scripts.prepare_auto_release import bump_version, read_version

VERSION_FILES = {
    "plugin.yaml": "version: 0.2.1\n",
    "pyproject.toml": 'version = "0.2.1"\n',
    "__init__.py": '__version__ = "0.2.1"\n',
    "dashboard/manifest.json": json.dumps({"version": "0.2.1"}) + "\n",
    "uv.lock": 'name = "enchanted-composer"\nversion = "0.2.1"\n',
    "README.md": "Push `v0.2.1` to release.\n",
    "docs/installation.md": "Install enchanted-composer-0.2.1.zip.\n",
}


def make_release_tree(root: Path) -> None:
    for relative, content in VERSION_FILES.items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def test_bump_version_updates_every_release_source(tmp_path: Path) -> None:
    make_release_tree(tmp_path)

    assert read_version(tmp_path) == "0.2.1"
    changed = bump_version(tmp_path, "0.2.2")

    assert changed == tuple(Path(name) for name in VERSION_FILES)
    assert read_version(tmp_path) == "0.2.2"
    for relative in VERSION_FILES:
        text = (tmp_path / relative).read_text(encoding="utf-8")
        assert "0.2.1" not in text
        assert "0.2.2" in text


def test_bump_version_rejects_invalid_or_noop_versions(tmp_path: Path) -> None:
    make_release_tree(tmp_path)

    with pytest.raises(ValueError, match="semantic version"):
        bump_version(tmp_path, "banana")
    with pytest.raises(ValueError, match="already"):
        bump_version(tmp_path, "0.2.1")


def test_repository_release_sources_are_ready_for_the_next_automatic_patch(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    for relative in VERSION_FILES:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(root / relative, target)

    current = read_version(tmp_path)
    major, minor, patch = map(int, current.split("."))
    next_version = f"{major}.{minor}.{patch + 1}"

    bump_version(tmp_path, next_version)

    assert read_version(tmp_path) == next_version
