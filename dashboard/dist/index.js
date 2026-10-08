(function () {
  "use strict";

  const SDK = window.__HERMES_PLUGIN_SDK__;
  const registry = window.__HERMES_PLUGINS__;
  if (!SDK || !registry) return;

  const React = SDK.React;
  const h = React.createElement;
  const { useCallback, useEffect, useMemo, useRef, useState } = SDK.hooks;
  const { Button, Select, SelectOption } = SDK.components;
  const API = "/api/plugins/composer-enhancements";

  function activeProfile() {
    const fromUrl = new URLSearchParams(window.location.search).get("profile");
    const candidate = fromUrl || window.__HERMES_INITIAL_PROFILE__ || "default";
    return /^[A-Za-z0-9_-]{1,64}$/.test(candidate) ? candidate : "default";
  }

  function scopedPath(path) {
    const separator = path.includes("?") ? "&" : "?";
    return `${API}${path}${separator}profile=${encodeURIComponent(activeProfile())}`;
  }

  function ownerBinding() {
    const profile = activeProfile();
    return {
      connectionId: "local",
      profile,
      runtimeSessionId: "dashboard",
      storedSessionId: "dashboard",
    };
  }

  async function request(path, options) {
    const init = Object.assign({}, options || {});
    if (Object.prototype.hasOwnProperty.call(init, "body")) {
      init.headers = Object.assign({ "Content-Type": "application/json" }, init.headers || {});
      init.body = JSON.stringify(init.body);
    }
    return SDK.fetchJSON(scopedPath(path), init);
  }

  function errorMessage(error) {
    const raw = error && error.message ? String(error.message) : String(error || "");
    const body = raw.replace(/^\d{3}:\s*/, "");
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed.detail === "string") return parsed.detail;
      if (parsed.detail && typeof parsed.detail.message === "string") return parsed.detail.message;
    } catch (_) { /* non-JSON error */ }
    if (/405|Method Not Allowed/i.test(raw)) {
      return "Composer's backend routes are not loaded in this server yet. Restart the Hermes Dashboard or Desktop backend, then check again.";
    }
    return body || "Enchanted Composer could not reach its backend.";
  }

  function action(label, onClick, options) {
    const opts = options || {};
    return h(Button, {
      type: "button",
      variant: opts.primary ? "default" : opts.danger ? "destructive" : "secondary",
      size: "sm",
      disabled: !!opts.disabled,
      onClick,
    }, label);
  }

  function StatePill({ ready, children }) {
    return h("span", { className: `ce-state ${ready ? "ce-state--ready" : "ce-state--off"}` },
      h("i", { "aria-hidden": "true" }), children);
  }

  function Field({ label, value, onChange, disabled, children, hint }) {
    return h("label", { className: "ce-field" },
      h("span", { className: "ce-label" }, label),
      h(Select, { value: value || "", disabled: !!disabled, onChange: event => onChange(event.target.value) }, children),
      hint ? h("span", { className: "ce-hint" }, hint) : null);
  }

  function UsagePanel({ status, usage }) {
    const subscription = status && status.subscription;
    const rows = ["today", "rolling5h", "rolling24h", "week"];
    return h("section", { className: "ce-panel" },
      h("div", { className: "ce-panel-head" },
        h("div", null, h("p", { className: "ce-eyebrow" }, "LOCAL RUNTIME"), h("h2", null, "Codex & usage")),
        h(StatePill, { ready: !!(subscription && subscription.ready) }, subscription && subscription.ready ? "CLI detected" : "CLI required")),
      h("p", { className: "ce-copy" }, subscription && subscription.detail
        ? subscription.detail
        : "Codex CLI status is unavailable."),
      h("p", { className: "ce-copy" }, "Enchanted Composer never reads or writes Codex OAuth files. Run codex login outside Hermes when Codex requires authentication."),
      h("h3", { className: "ce-subhead" }, "Local voice time"),
      h("div", { className: "ce-usage-list" }, rows.map(key => {
        const value = usage && usage[key];
        const label = { today: "Today", rolling5h: "Rolling 5 hours", rolling24h: "Rolling 24 hours", week: "This week" }[key];
        return h("div", { key }, h("span", null, label), h("strong", null,
          `${Number(value && value.minutes || 0).toFixed(1)} min · ${Number(value && value.sessions || 0)} sessions`));
      })));
  }


  function ComposerDashboard() {
    const [catalog, setCatalog] = useState(null);
    const [settings, setSettings] = useState(null);
    const [status, setStatus] = useState(null);
    const [usage, setUsage] = useState(null);
    const [health, setHealth] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(true);
    const [saveState, setSaveState] = useState('saved');
    const saved = useRef('');
    const queued = useRef(null);
    const saving = useRef(false);
    const saveTimer = useRef(null);
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
      setBusy(true);
      setError("");
      const owner = ownerBinding();
      try {
        const [nextHealth, nextCatalog, nextSettings, nextStatus, nextUsage] = await Promise.all([
          request("/health"),
          request("/v1/voice/options", { method: "POST", body: { owner } }),
          request("/v1/settings/read", { method: "POST", body: { owner } }),
          request("/v1/codex/status", { method: "POST", body: { owner } }),
          request("/v1/usage/read", { method: "POST", body: { owner } }),
        ]);
        if (!mounted.current) return;
        setHealth(nextHealth);
        setCatalog(nextCatalog);
        if (!queued.current && !saving.current) {
          saved.current = JSON.stringify(nextSettings.settings);
          setSettings(nextSettings.settings);
        }
        setStatus(nextStatus);
        setUsage(nextUsage);
      } catch (reason) {
        if (mounted.current) setError(errorMessage(reason));
      } finally {
        if (mounted.current) setBusy(false);
      }
    }, []);

    useEffect(() => {
      mounted.current = true;
      refresh();
      return () => { mounted.current = false; };
    }, [refresh]);


    const selectedBackend = useMemo(() => catalog && settings
      ? (catalog.backends || []).find(item => item.backend === settings.backend) : null, [catalog, settings]);
    const providers = selectedBackend ? selectedBackend.providers || [] : [];
    const provider = settings ? providers.find(item => item.id === settings.provider) : null;
    const valid = !!(settings && provider && provider.ready
      && provider.billingLane === settings.billing_lane
      && provider.models.includes(settings.engine)
      && provider.voices.includes(settings.voice));

    function chooseBackend(value) {
      const backend = (catalog.backends || []).find(item => item.backend === value);
      const first = backend && (backend.providers || []).find(item => item.ready);
      setSettings(previous => Object.assign({}, previous, {
        backend: value,
        provider: first ? first.id : "",
        billing_lane: first ? first.billingLane : "",
        engine: first ? first.defaultModel : "",
        voice: first ? first.defaultVoice : "",
      }));
    }

    function chooseProvider(value) {
      const next = providers.find(item => item.id === value);
      if (!next) return;
      setSettings(previous => Object.assign({}, previous, {
        provider: next.id,
        billing_lane: next.billingLane,
        engine: next.defaultModel,
        voice: next.defaultVoice,
      }));
    }

    async function save() {
      if (saving.current) return;
      saving.current = true;
      while (queued.current) {
        const next = queued.current;
        queued.current = null;
        if (mounted.current) { setSaveState('saving'); setError(''); }
        try {
          const result = await request('/v1/settings', { method: 'PUT', body: { owner: ownerBinding(), settings: next } });
          if (!result.ok) throw new Error('Settings were not accepted.');
          const verified = await request('/v1/settings/read', { method: 'POST', body: { owner: ownerBinding() } });
          if (!verified.ok || Object.keys(next).some(key => verified.settings[key] !== next[key])) throw new Error('Saved settings could not be verified.');
          saved.current = JSON.stringify(next);
          if (mounted.current && !queued.current) setSaveState('saved');
        } catch (reason) {
          if (!queued.current) queued.current = next;
          if (mounted.current) { setError(errorMessage(reason)); setSaveState('error'); }
          break;
        }
      }
      saving.current = false;
    }

    useEffect(() => {
      if (!settings || JSON.stringify(settings) === saved.current) return;
      queued.current = settings;
      setSaveState('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(save, 350);
      return () => clearTimeout(saveTimer.current);
    }, [settings]);

    useEffect(() => () => { clearTimeout(saveTimer.current); if (queued.current) void save(); }, []);


    if (!settings && busy) {
      return h("main", { className: "ce-dashboard ce-dashboard--loading" }, h("span", { className: "ce-pulse" }), "Loading Enchanted Composer…");
    }

    const backendOptions = (catalog && catalog.backends || []).map(item =>
      h(SelectOption, { key: item.backend, value: item.backend }, item.backend === "enchanted-realtime" ? "Realtime voice" : "Custom voice bridge"));
    const providerOptions = providers.map(item =>
      h(SelectOption, { key: item.id, value: item.id, disabled: !item.ready },
        `${item.name}${item.ready ? "" : ` — ${item.detail || "unavailable"}`}`));
    const modelOptions = provider ? provider.models.map(value => h(SelectOption, { key: value, value }, value)) : [];
    const voiceOptions = provider ? provider.voices.map(value => h(SelectOption, { key: value, value }, value)) : [];

    return h("main", { className: "ce-dashboard" },
      h("header", { className: "ce-hero" },
        h("div", { className: "ce-hero-copy" },
          h("p", { className: "ce-eyebrow" }, "ENCHANTED COMPOSER"),
          h("h1", null, "Enchanted Composer"),
          h("p", null, "Configure provider, billing lane, model, and voice as one verified choice. Start live voice from Hermes Desktop, where Composer can bind to the focused chat.")),
        h("div", { className: "ce-hero-status" },
          h("span", null, `Profile · ${activeProfile()}`),
          h(StatePill, { ready: !!(health && health.ok) }, health && health.ok ? "Backend online" : "Backend unavailable"))),
      error ? h("div", { className: "ce-banner ce-banner--error", role: "alert" }, error) : null,
      notice ? h("div", { className: "ce-banner ce-banner--ok", role: "status" }, notice) : null,
      h("div", { className: "ce-layout" },
        h("section", { className: "ce-panel ce-panel--primary" },
          h("div", { className: "ce-panel-head" },
            h("div", null, h("p", { className: "ce-eyebrow" }, "VOICE LANE"), h("h2", null, "Voice preferences")),
            h(StatePill, { ready: valid }, valid ? "Ready" : "Selection unavailable")),
          h("p", { className: "ce-copy" }, "Provider availability is checked by the backend. Composer never switches billing lanes or providers silently."),
          settings ? h("div", { className: "ce-fields" },
            h(Field, { label: "Backend", value: settings.backend, onChange: chooseBackend, disabled: busy }, backendOptions),
            h(Field, { label: "Provider", value: settings.provider, onChange: chooseProvider, disabled: busy || !providers.length }, providerOptions),
            h(Field, { label: "Billing lane", value: settings.billing_lane, onChange: () => {}, disabled: true },
              h(SelectOption, { value: settings.billing_lane }, settings.billing_lane || "Select a provider")),
            h(Field, { label: "Live model", value: settings.engine, onChange: value => setSettings(previous => Object.assign({}, previous, { engine: value })), disabled: busy || !provider }, modelOptions),
            h(Field, { label: "Voice", value: settings.voice, onChange: value => setSettings(previous => Object.assign({}, previous, { voice: value })), disabled: busy || !provider }, voiceOptions),
            h(Field, { label: "Language", value: settings.language, onChange: value => setSettings(previous => Object.assign({}, previous, { language: value })), disabled: busy },
              h(SelectOption, { value: "en" }, "English"), h(SelectOption, { value: "es" }, "Spanish"))) : null,
          provider && !provider.ready ? h("p", { className: "ce-provider-note" }, provider.detail) : null,
          h("div", { className: "ce-actions ce-actions--footer" },
            action(busy ? "Checking…" : "Check providers", refresh, { disabled: busy }),
            saveState === "error" ? action("Retry save", save, { primary: true }) : h("span", { role: "status", className: "ce-copy" }, saveState === "saving" ? "Saving…" : "All changes saved"))),
        h(UsagePanel, { status, usage })),
      h("footer", { className: "ce-footnote" },
        h("strong", null, "What stays in Desktop"),
        h("span", null, "Microphone and speaker selection, the temporary live transcript, prompt insertion, and sending a delegated task all require a focused Hermes Desktop chat.")));
  }

  registry.register("composer-enhancements", ComposerDashboard);
})();
