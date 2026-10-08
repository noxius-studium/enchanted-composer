# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub Security Advisories for this repository. Do not include credentials, OAuth tokens, session transcripts, or provider payloads in a public issue.

Include the affected commit, Hermes version, operating system, reproduction steps, and the smallest redacted diagnostic needed to demonstrate impact.

## Security boundaries

Enchanted Composer is a full-trust Hermes plugin. Its catalog release is pinned to an exact reviewed commit and it has no self-update mechanism.

- The Desktop half uses only documented Hermes plugin SDK surfaces.
- The backend does not read, refresh, back up, or write Codex OAuth files. The official Codex CLI owns its authentication.
- API keys and bridge secrets remain backend-side and are never serialized to the renderer.
- Provider, billing lane, bridge endpoint, and model are selected explicitly; there is no silent cross-provider fallback.
- Prompt libraries and settings are non-secret. Voice transcripts are temporary and are cleared when a call starts or ends.
- No telemetry is collected or transmitted.

See [Privacy and security](docs/privacy-and-security.md) and the catalog disclosures in [README.md](README.md) for the complete runtime disclosure.
