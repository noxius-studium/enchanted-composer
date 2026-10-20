from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "release.yml"


def test_release_workflow_builds_sha_identified_checksums_and_tag_assets() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    assert "workflow_dispatch:" in text
    assert "tags:" in text and "v*" in text
    assert "scripts/package.py" in text
    assert "git rev-parse HEAD" in text
    assert "sha256sum" in text
    assert "SHA256SUMS" in text
    assert "RELEASE-METADATA.json" in text
    assert "actions/upload-artifact@v4" in text
    assert "gh release" in text
    assert "sha256sum --check SHA256SUMS" in text
