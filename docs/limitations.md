# Limitations

The public desktop SDK lacks owner-routed event subscriptions. Delegation to an active gateway captures normal completion events; delegation to another owner route uses bounded final-result polling and is visibly marked `final-poll`. It never claims token streaming there.

Enchanted Composer cannot enter, hide, intercept, or change the native Hermes voice engine picker or dynamic voice/send control. It supplies a separate compact waveform action and a workspace settings page.

The settings page can request the model catalog only for an exact captured focused owner route. If that route is unavailable, ambiguous, unauthenticated, or its `model.options` request fails, the page reports that state and does not invent a model list.

Codex subscription authentication and plan usage remain outside the plugin. The user signs in with the official Codex CLI; Enchanted Composer neither reads its OAuth file nor reports plan quota. This is not a paid OpenAI API fallback. Real Codex/OpenAI/Gemini/local bridge availability, microphone permission/device behavior, browser sink support, and installed Desktop acceptance depend on the operator's authorized environment. A stock Composer Bridge protocol-v6 gateway is intentionally incompatible unless it advertises the Composer bridge contract.
