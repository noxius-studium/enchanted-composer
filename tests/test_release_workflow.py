from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "release.yml"


def test_release_workflow_builds_sha_identified_checksums_and_main_merge_assets() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    assert "workflow_dispatch:" in text
    assert "workflow_run:" in text
    assert 'workflows: ["CI"]' in text
    assert "types: [completed]" in text
    assert "github.event.workflow_run.conclusion == 'success'" in text
    assert "APPROVED_SHA: ${{ github.event.workflow_run.head_sha }}" in text
    assert 'echo "publish=false"' in text
    assert text.count("if: steps.identity.outputs.publish == 'true'") == 5
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


def test_catalog_update_is_manual_and_keeps_nous_review_as_the_gate() -> None:
    text = (ROOT / ".github" / "workflows" / "catalog-update.yml").read_text(
        encoding="utf-8"
    )

    assert "workflow_dispatch:" in text
    assert "release_tag:" in text
    assert "HERMES_CATALOG_TOKEN" in text
    assert "scripts/update_hermes_catalog_entry.py" in text
    assert "--show-current" in text
    assert "mapfile -t CATALOG_IDENTITY" in text
    assert "NousResearch/hermes-agent" in text
    assert "git remote set-url upstream" in text
    assert "|| git remote add upstream" in text
    assert "gh pr create" in text
    assert "release:" not in text.split("permissions:", maxsplit=1)[0]
