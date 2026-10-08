# Provenance

Enchanted Composer is **derived in concepts, flows, and behavior** from the two
MIT-licensed Hermes plugins below. Its implementation has been **substantially
rewritten** for Enchanted Composer's unified, owner-bound architecture. It is
not accurate to describe the project as unrelated or wholly original merely
because the current source is not a verbatim copy.

## Upstream projects

### hermes-live-voice

- Repository: https://github.com/Synero/hermes-live-voice
- Reviewed catalog revision: `c983ca8c493ee9609a846e6218f6b12705ea04e6`
- Maintainer: Synero
- License: MIT
- Concepts and flows carried forward include the Codex `app-server`
  subscription lane, WebRTC/SDP realtime negotiation, temporary live
  transcripts, `SOUL.md`-based voice identity, microphone/call controls, and
  delegation of tool-worthy voice requests into a Hermes chat.

### prompt-enhance

- Repository: https://github.com/apoapostolov/hermes-agent-awesome-plugins
- Upstream subdirectory: `public/prompt-enhance`
- Reviewed catalog revision: `953732a9fb52b6fd89e73fc96d910aab63163e07`
- Maintainer: apoapostolov (Apostol Apostolov)
- License: MIT
- Concepts and flows carried forward include SDK-based composer draft
  read/replace, one-shot enhancement outside ordinary chat history, reusable
  prompt folders and libraries, per-call model selection, and enhancement
  undo/revert behavior.

## What was rewritten

Enchanted Composer reorganizes these ideas into a unified backend and Desktop
plugin with connection/profile owner fencing, explicit provider and billing
lanes, multi-step edit history, bounded persistent state, deterministic source
builds, catalog disclosures, and stricter credential/process boundaries. The
implementation and tests were reworked around current public Hermes plugin SDK
surfaces rather than presented as an independent invention.

The preserved copyright and MIT permission notices are in [NOTICE.md](NOTICE.md).
