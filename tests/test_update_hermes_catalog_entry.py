from __future__ import annotations

from pathlib import Path

import pytest

from scripts.update_hermes_catalog_entry import update_catalog_entry

ENTRY = """name: enchanted-composer
repo: https://github.com/noxius-studium/enchanted-composer
sha: 1111111111111111111111111111111111111111
docs_url: https://github.com/noxius-studium/enchanted-composer/blob/1111111111111111111111111111111111111111/README.md
version: "0.2.0"
image: https://raw.githubusercontent.com/noxius-studium/enchanted-composer/1111111111111111111111111111111111111111/docs/media/banner.png
known_issues:
  - A limitation remains in version 0.2.0.
"""


def test_update_catalog_entry_repins_every_sha_and_version_reference(tmp_path: Path) -> None:
    entry = tmp_path / "enchanted-composer.yaml"
    entry.write_text(ENTRY, encoding="utf-8")
    new_sha = "2" * 40

    update_catalog_entry(entry, version="0.2.3", sha=new_sha)

    text = entry.read_text(encoding="utf-8")
    assert "1" * 40 not in text
    assert text.count(new_sha) == 3
    assert "0.2.0" not in text
    assert text.count("0.2.3") == 2


@pytest.mark.parametrize(
    ("version", "sha"),
    [("v0.2.3", "2" * 40), ("0.2", "2" * 40), ("0.2.3", "short")],
)
def test_update_catalog_entry_rejects_invalid_identity(
    tmp_path: Path, version: str, sha: str
) -> None:
    entry = tmp_path / "enchanted-composer.yaml"
    entry.write_text(ENTRY, encoding="utf-8")

    with pytest.raises(ValueError):
        update_catalog_entry(entry, version=version, sha=sha)
