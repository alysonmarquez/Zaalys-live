// MediaFlowMZ Live 4 — service worker: chave, aparelho e chamadas à API do MediaFlowMZ (/api/live-ext).
(() => {
  var {
      defineProperty: l,
      getOwnPropertyNames: _,
      getOwnPropertyDescriptor: A,
    } = Object,
    x = Object.prototype.hasOwnProperty;
  function P(e) {
    return this[e];
  }
  var C = (e) => {
      var t = (g ??= new WeakMap()).get(e),
        n;
      if (t) return t;
      if (
        ((t = l({}, "__esModule", { value: !0 })),
        (e && typeof e === "object") || typeof e === "function")
      ) {
        for (var o of _(e))
          if (!x.call(t, o))
            l(t, o, {
              get: P.bind(e, o),
              enumerable: !(n = A(e, o)) || n.enumerable,
            });
      }
      return g.set(e, t), t;
    },
    g;
  var S = (e) => e;
  function I(e, t) {
    this[e] = S.bind(null, t);
  }
  var V = (e, t) => {
    for (var n in t)
      l(e, n, {
        get: t[n],
        enumerable: !0,
        configurable: !0,
        set: I.bind(t, n),
      });
  };
  var E =
    "";
  var Y = 1800000,
    p = 25000,
    W = (e) => "update_url" in e,
    y = (e) => e.split(".").map((t) => Number.parseInt(t, 10) || 0);
  function T(e, t) {
    let n = y(e),
      o = y(t);
    for (let a = 0; a < Math.max(n.length, o.length); a++) {
      let s = (n[a] ?? 0) - (o[a] ?? 0);
      if (s) return s > 0;
    }
    return !1;
  }
  var O = {
    minVersion: "0.0.0",
    off: { relay: !1, comments: !1, replies: !1, life: !1 },
    violationPhrases: [],
    notice: null,
  };
  function X(e) {
    let t = e && typeof e === "object" ? e : {},
      n = t.off && typeof t.off === "object" ? t.off : {},
      o = (s) => n[s] === !0,
      a = Array.isArray(t.violationPhrases)
        ? t.violationPhrases
            .filter(
              (s) => typeof s === "string" && s.length > 0 && s.length <= 200,
            )
            .slice(0, 30)
        : [];
    return {
      minVersion:
        typeof t.minVersion === "string" && /^\d+(\.\d+)*$/.test(t.minVersion)
          ? t.minVersion
          : O.minVersion,
      off: {
        relay: o("relay"),
        comments: o("comments"),
        replies: o("replies"),
        life: o("life"),
      },
      violationPhrases: a,
      notice:
        typeof t.notice === "string" && t.notice.trim()
          ? t.notice.trim().slice(0, 240)
          : null,
    };
  }
  function F(e, t) {
    return !T(t.minVersion, e);
  }
  function G(e, t) {
    return {
      ...e,
      relayAfter: t.off.relay ? 0 : e.relayAfter,
      comments: t.off.comments ? !1 : e.comments,
      answer: t.off.replies ? !1 : e.answer,
    };
  }
  function u({ userAgent: e, maxTouchPoints: t = 0, screen: n }) {
    let o = /Macintosh/.test(e) && t > 1,
      a = n ? Math.min(n.width, n.height) : 0,
      s = o
        ? a && a < 600
          ? "iPhone"
          : "iPad"
        : /Android/.test(e)
          ? "Android"
          : /Windows/.test(e)
            ? "Windows"
            : /Mac OS/.test(e)
              ? "macOS"
              : /Linux/.test(e)
                ? "Linux"
                : "computador";
    return `${o ? "Orion" : /Edg\//.test(e) ? "Edge" : "Chrome"} · ${s}`;
  }
  var H = () =>
    u({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      screen: window.screen,
    });
  var f = "http://localhost:3000",
    i = {
      async get(e) {
        try {
          return (await chrome.storage.sync.get(e)) ?? {};
        } catch {
          return {};
        }
      },
      async set(e) {
        try {
          await chrome.storage.sync.set(e);
        } catch {}
      },
      async remove(e) {
        try {
          await chrome.storage.sync.remove(e);
        } catch {}
      },
    };
  async function h() {
    let { deviceId: e } = await chrome.storage.local.get("deviceId");
    if (e) return e;
    let t = (await i.get(["deviceId"])).deviceId,
      n = typeof t === "string" && t ? t : crypto.randomUUID();
    return (
      await chrome.storage.local.set({ deviceId: n }),
      await i.set({ deviceId: n }),
      n
    );
  }
  async function w(e) {
    if (typeof e !== "string" || !e) return;
    await chrome.storage.local.set({ release: e });
    let t = `${f}/api/live-ext/released?d=${encodeURIComponent(await h())}&t=${e}`;
    try {
      await chrome.runtime.setUninstallURL(t);
    } catch {}
  }
  chrome.storage.local.get("release").then(({ release: e }) => w(e));
  var L = 20000;
  async function d(e, t) {
    let n =
        t ||
        (await chrome.storage.local.get("deviceLabel")).deviceLabel ||
        u({ userAgent: navigator.userAgent }),
      o = await m("activate", { deviceLabel: n }, e, L);
    if (o.ok)
      await chrome.storage.local.set({
        licenseKey: e,
        account: o.data.name,
        deviceLabel: n,
      }),
        await i.set({ licenseKey: e, account: o.data.name }),
        await w(o.data.release);
    return o;
  }
  async function N() {
    let e = await chrome.storage.local.get(["licenseKey", "account"]);
    if (e.licenseKey) return e;
    let t = await i.get(["licenseKey", "account"]);
    if (typeof t.licenseKey !== "string" || !t.licenseKey) return {};
    return (
      await chrome.storage.local.set({
        licenseKey: t.licenseKey,
        account: t.account ?? null,
      }),
      t
    );
  }
  async function m(e, t, n, o = 0) {
    let a = await fetch(`${f}/api/live-ext/${e}`, {
        method: "POST",
        signal: o ? AbortSignal.timeout(o) : void 0,
        headers: {
          "content-type": "application/json",
          "x-csrf-token": "orpc",
          "x-mf-key": n,
          "x-mf-device": await h(),
          "x-mf-version": chrome.runtime.getManifest().version,
        },
        body: JSON.stringify({ json: t ?? null }),
      }),
      s = await a.json().catch(() => null);
    if (!a.ok) return { ok: !1, status: a.status, error: K(a.status, s?.json) };
    return { ok: !0, data: s?.json };
  }
  var R =
      /[ãõçáéíóúâêôà]|\b(n[aã]o|voc[eê]|seu|sua|este|esta|esse|essa|informe|tente|confira|cole|conta|acesso|agora|para|uma)\b/i,
    v =
      "Não conseguimos falar com o MediaFlowMZ. Confira sua internet e tente de novo.",
    j = {
      400: "O MediaFlowMZ não aceitou esse pedido. Atualize a extensão e tente de novo.",
      401: "Este computador foi desconectado. Ative a extensão de novo com sua chave.",
      403: "Seu acesso ao MediaFlowMZ não está ativo. Confira sua assinatura no site.",
      404: "Não encontramos isso no MediaFlowMZ. Atualize a extensão e tente de novo.",
      429: "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
    };
  function K(e, t) {
    let n = [
      ...(t?.data?.issues ?? []).map((o) => o?.message),
      t?.message,
    ].find((o) => o && R.test(o));
    if (n) return n;
    return (
      j[e] ??
      "O MediaFlowMZ não respondeu agora. Tente de novo em instantes; se continuar, fale com o suporte."
    );
  }
  var r = new Map(),
    b = !1;
  function U() {
    let e = Date.now();
    for (let [t, n] of r) if (n < e) r.delete(t);
    return r.size > 0;
  }
  function k() {
    if (b && !U()) chrome.runtime.reload();
  }
  chrome.runtime.onUpdateAvailable.addListener(() => {
    (b = !0), k();
  });
  async function M(e, t) {
    if (e.type === "onair") {
      if (e.on) r.set(t, Date.now() + 3 * p);
      else r.delete(t);
      return k(), { ok: !0, data: null };
    }
    if (e.type === "updateCheck") {
      if (!("update_url" in chrome.runtime.getManifest()))
        return { ok: !0, data: { status: "no_update" } };
      let { status: a } = await chrome.runtime.requestUpdateCheck();
      return { ok: !0, data: { status: a } };
    }
    let { licenseKey: n, account: o } = await N();
    switch (e.type) {
      case "status":
        return {
          ok: !0,
          data: { active: Boolean(n), account: o ?? null, key: n ?? null },
        };
      case "activate": {
        let a = (e.key ?? n ?? "").trim();
        if (!a)
          return {
            ok: !1,
            status: 401,
            error: "Cole a chave do MediaFlowMZ para ativar.",
          };
        return d(a, e.label);
      }
      case "connect":
        return d(e.key.trim(), e.label);
      case "logout":
        await chrome.storage.local.remove(["licenseKey", "account", "release"]),
          await i.remove(["licenseKey", "account"]);
        try {
          await chrome.runtime.setUninstallURL("");
        } catch {}
        return { ok: !0, data: null };
      case "latest": {
        let a = await fetch(`${f}/api/live-ext/latest`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-csrf-token": "orpc",
            },
            body: JSON.stringify({ json: null }),
          }),
          c = (await a.json().catch(() => null))?.json;
        if (!a.ok || typeof c?.version !== "string")
          return { ok: !1, status: a.status, error: v };
        return { ok: !0, data: c };
      }
      case "call": {
        if (!n)
          return {
            ok: !1,
            status: 401,
            error: "Ative a extensão com sua chave.",
          };
        let a = await m(e.path, e.input, n);
        if (a.ok || a.status !== 401) return a;
        let s = await d(n);
        return s.ok ? m(e.path, e.input, n) : s;
      }
    }
  }
  chrome.runtime.onMessage.addListener(
    (e, t, n) => (
      M(e, t.tab?.id ?? -1).then(n, () => n({ ok: !1, status: 0, error: v })),
      !0
    ),
  );
})();
