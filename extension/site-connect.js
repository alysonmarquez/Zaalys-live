// MediaFlowMZ Live 4 — ponte com o site: marca a versão instalada e conecta com a chave da conta.
(() => {
  var {
      defineProperty: c,
      getOwnPropertyNames: h,
      getOwnPropertyDescriptor: l,
    } = Object,
    y = Object.prototype.hasOwnProperty;
  function v(e) {
    return this[e];
  }
  var x = (e) => {
      var o = (u ??= new WeakMap()).get(e),
        t;
      if (o) return o;
      if (
        ((o = c({}, "__esModule", { value: !0 })),
        (e && typeof e === "object") || typeof e === "function")
      ) {
        for (var n of h(e))
          if (!y.call(o, n))
            c(o, n, {
              get: v.bind(e, n),
              enumerable: !(t = l(e, n)) || t.enumerable,
            });
      }
      return u.set(e, o), o;
    },
    u;
  var b = (e) => e;
  function f(e, o) {
    this[e] = b.bind(null, o);
  }
  var k = (e, o) => {
    for (var t in o)
      c(e, t, {
        get: o[t],
        enumerable: !0,
        configurable: !0,
        set: f.bind(o, t),
      });
  };
  var A = {};
  k(A, { EXT: () => d, SITE: () => g, bridge: () => m });
  function a({ userAgent: e, maxTouchPoints: o = 0, screen: t }) {
    let n = /Macintosh/.test(e) && o > 1,
      r = t ? Math.min(t.width, t.height) : 0,
      s = n
        ? r && r < 600
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
    return `${n ? "Orion" : /Edg\//.test(e) ? "Edge" : "Chrome"} · ${s}`;
  }
  var M = () =>
    a({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      screen: window.screen,
    });
  var g = "zaalys-site",
    d = "zaalys-live";
  function m(e, o, t) {
    (e.document.documentElement.dataset.zaalysLive = t),
      e.postMessage({ source: d, type: "here", version: t }, e.location.origin),
      e.addEventListener("message", (n) => {
        if (n.source !== e || n.origin !== e.location.origin) return;
        let r = n.data;
        if (
          r?.source !== g ||
          r.type !== "connect" ||
          typeof r.key !== "string"
        )
          return;
        let s = a({
          userAgent: e.navigator.userAgent,
          maxTouchPoints: e.navigator.maxTouchPoints,
          screen: e.screen,
        });
        o({ type: "connect", key: r.key, label: s }, (i) => {
          let p = i?.ok
            ? { ok: !0 }
            : { ok: !1, error: i?.error ?? "A extensão não respondeu." };
          e.postMessage(
            { source: d, type: "connected", ...p },
            e.location.origin,
          );
        });
      });
  }
  if (typeof chrome < "u" && chrome.runtime?.id)
    m(
      window,
      (e, o) => chrome.runtime.sendMessage(e, (t) => o(t)),
      chrome.runtime.getManifest().version,
    );
})();
