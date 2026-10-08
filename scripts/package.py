"""Create a deterministic clean-profile Enchanted Composer ZIP."""
from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path

from build_desktop import PARTS, source_text

ROOT=Path(__file__).resolve().parents[1]
ARCHIVE_ROOT="composer-enhancements"
FIXED_ZIP_TIMESTAMP=(1980,1,1,0,0,0)
REQUIRED_PATHS=(
    Path("__init__.py"),Path("plugin.yaml"),Path("pyproject.toml"),Path("README.md"),Path("SECURITY.md"),Path("LICENSE"),Path("NOTICE.md"),Path("PROVENANCE.md"),
    Path("dashboard/__init__.py"),Path("dashboard/manifest.json"),Path("dashboard/plugin_api.py"),
    Path("dashboard/src/index.js"),Path("dashboard/src/style.css"),Path("dashboard/dist/index.js"),Path("dashboard/dist/style.css"),
    *(Path("dashboard/composer_enhancements")/name for name in ("__init__.py","errors.py","contracts.py","capabilities.py","engine_resolver.py","paths.py","settings.py","identity.py","runtime_env.py","credential_relay.py","bridge_proof.py","codex_binary.py","codex_app_server.py","codex_live.py","hermes_runs.py","usage.py","voice_options.py","enhancement.py","realtime_adapter.py","bridge_adapter.py","router.py")),
    Path("desktop/plugin.js"),*(Path("desktop/src")/part for part in PARTS),
    Path("scripts/build_desktop.py"),Path("scripts/build_dashboard.py"),Path("scripts/package.py"),Path("scripts/verify_desktop.mjs"),
    Path("docs/architecture.md"),Path("docs/installation.md"),Path("docs/migration.md"),Path("docs/privacy-and-security.md"),Path("docs/limitations.md"),
)
def plugin_version(path:Path)->str:
    for line in path.read_text(encoding="utf-8").splitlines():
        match=re.fullmatch(r"version:\s*['\"]?([^'\"\s#]+)['\"]?\s*(?:#.*)?",line)
        if match:return match.group(1)
    raise ValueError(f"No version found in {path}")
def release_files(root:Path)->list[Path]:
    if (root/"desktop/plugin.js").read_text(encoding="utf-8") != source_text(root/"desktop/src"):
        raise RuntimeError("Desktop runtime is stale; build it before packaging.")
    missing=[path for path in REQUIRED_PATHS if not (root/path).is_file()]
    if missing:raise FileNotFoundError("Required release file(s) missing: "+", ".join(path.as_posix() for path in missing))
    for name in ("index.js","style.css"):
        if (root/"dashboard"/"src"/name).read_text(encoding="utf-8") != (root/"dashboard"/"dist"/name).read_text(encoding="utf-8"):
            raise RuntimeError(f"Dashboard bundle is stale: dashboard/dist/{name}")
    return sorted(REQUIRED_PATHS,key=lambda path:path.as_posix())
def write_archive(root:Path,output:Path)->Path:
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,"w",compression=zipfile.ZIP_STORED) as archive:
        for path in release_files(root):
            info=zipfile.ZipInfo(f"{ARCHIVE_ROOT}/{path.as_posix()}",FIXED_ZIP_TIMESTAMP);info.compress_type=zipfile.ZIP_STORED;info.create_system=3;info.external_attr=0o100644<<16
            archive.writestr(info,(root/path).read_bytes())
    return output
def main()->None:
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("--output",type=Path);args=parser.parse_args()
    output=args.output or ROOT/"dist"/f"enchanted-composer-{plugin_version(ROOT/'plugin.yaml')}.zip";print(write_archive(ROOT,output).resolve())
if __name__=="__main__":main()
