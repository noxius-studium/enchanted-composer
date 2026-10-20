from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "release.yml"


def test_release_workflow_builds_sha_identified_checksums_and_main_merge_assets() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    assert "workflow_dispatch:" in text
    assert "branches: [main]" in text
    assert "concurrency:" in text
    assert "scripts/prepare_auto_release.py" in text
    assert "git push origin HEAD:main" in text
    assert "git push origin \"${TAG}\"" in text
    assert "scripts/package.py" in text
    assert "git rev-parse HEAD" in text
    assert "sha256sum" in text
    assert "SHA256SUMS" in text
    assert "RELEASE-METADATA.json" in text
    assert "actions/upload-artifact@v4" in text
    assert "gh release" in text
    assert "sha256sum --check SHA256SUMS" in text


def test_ci_runs_on_main_and_uses_the_manifest_version_for_package_checks() -> None:
    text = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")

    assert "branches: [main]" in text
    assert "VERSION=\"$(python" in text
    assert "enchanted-composer-${VERSION}-a.zip" in text
    assert "enchanted-composer-0.2.0-a.zip" not in text
