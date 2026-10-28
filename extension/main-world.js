// MediaFlowMZ Live 4 — mundo da página: câmera e microfone virtuais (MediaFlowMZ Live vídeo/áudio) e sinais do TikTok.
(() => {
  var {
      defineProperty: M,
      getOwnPropertyNames: G,
      getOwnPropertyDescriptor: j,
    } = Object,
    q = Object.prototype.hasOwnProperty;
  function F(e) {
    return this[e];
  }
  var re = (e) => {
      var t = (_ ??= new WeakMap()).get(e),
        n;
      if (t) return t;
      if (
        ((t = M({}, "__esModule", { value: !0 })),
        (e && typeof e === "object") || typeof e === "function")
      ) {
        for (var a of G(e))
          if (!q.call(t, a))
            M(t, a, {
              get: F.bind(e, a),
              enumerable: !(n = j(e, a)) || n.enumerable,
            });
      }
      return _.set(e, t), t;
    },
    _;
  var J = (e) => e;
  function K(e, t) {
    this[e] = J.bind(null, t);
  }
  var ae = (e, t) => {
    for (var n in t)
      M(e, n, {
        get: t[n],
        enumerable: !0,
        configurable: !0,
        set: K.bind(t, n),
      });
  };
  function O(e, t) {
    if (!e || e === !0) return !1;
    let n = e.deviceId;
    return (
      typeof n === "string" || Array.isArray(n)
        ? [n].flat()
        : n
          ? [n.exact, n.ideal].flat()
          : []
    ).includes(t);
  }
  function B(e, t) {
    let n = e.enumerateDevices.bind(e),
      a = e.getUserMedia.bind(e);
    (e.enumerateDevices = async () => [
      ...(await n()),
      {
        deviceId: "zaalys-live-video",
        kind: "videoinput",
        label: "MediaFlowMZ Live (vídeo)",
        groupId: "zaalys-live",
      },
      {
        deviceId: "zaalys-live-audio",
        kind: "audioinput",
        label: "MediaFlowMZ Live (áudio)",
        groupId: "zaalys-live",
      },
    ]),
      (e.getUserMedia = async (r = {}) => {
        let i = O(r.video, "zaalys-live-video"),
          o = O(r.audio, "zaalys-live-audio");
        if (!i && !o && t.owns())
          (i = Boolean(r.video)), (o = Boolean(r.audio));
        if (!i && !o) return a(r);
        let l = t.source();
        if (!l || (i && !l.video)) {
          if (t.owns()) return a(r);
          throw new DOMException(
            "Escolha o vídeo no painel MediaFlowMZ Live antes de selecionar a câmera.",
            "NotReadableError",
          );
        }
        let s = [i && l.video, o && l.audio]
            .filter((w) => Boolean(w))
            .map((w) => w.clone()),
          u = {};
        if (r.video && !i) u.video = r.video;
        if (r.audio && !o) u.audio = r.audio;
        let h = u.video || u.audio ? t.tracksOf(await a(u)) : [];
        return t.makeStream([...s, ...h]);
      });
  }
  var d = {
      canvas: "zaalys-live-canvas",
      voice: "zaalys-live-voice",
      ambient: "zaalys-live-ambient",
      sfx: "zaalys-live-sfx",
      life: "zaalys-live-life",
      own: "zaalys-live-own",
      ui: "zaalys-live-ui",
    },
    f = [d.voice, d.ambient, d.sfx, d.life, d.own],
    S = "__zaalysLive";
  class X {
    reason = null;
    get blocked() {
      return this.reason !== null;
    }
    get rejection() {
      return this.reason;
    }
    block(e) {
      if (this.reason !== null) return !1;
      return (this.reason = e), !0;
    }
  }
  var A = (e) =>
      e.includes("webcast/eco/violation_list") ||
      e.includes("live/get_violation_detail") ||
      e.includes("live/check_risk_permission"),
    T = (e) => (e && typeof e === "object" && !Array.isArray(e) ? e : null);
  function Z(e) {
    if (!Array.isArray(e)) return "";
    let t = [];
    for (let n of e.slice(0, 3)) {
      let a = T(n);
      if (!a) continue;
      let r = [
        "policy_name",
        "violation_reason",
        "reason",
        "punish_reason",
        "title",
        "policy",
        "rule_name",
        "description",
      ]
        .map((i) => a[i])
        .find((i) => typeof i === "string" && i.trim().length > 0);
      if (r) t.push(r.trim());
    }
    return [...new Set(t)].join("; ");
  }
  function W(e, t) {
    if (!A(e)) return null;
    let n;
    try {
      n = T(JSON.parse(t));
    } catch {
      return null;
    }
    if (!n) return null;
    let a = T(n.data);
    if (e.includes("live/check_risk_permission")) {
      let s = { ...n, ...(a ?? {}) };
      if (s.allow === !1 || s.allowed === !1 || s.can_live === !1)
        return {
          kind: "blocked",
          reason: typeof s.reason === "string" ? s.reason : "sem motivo",
        };
      return null;
    }
    if (!a) return null;
    let r = a.violation_list ?? a.violations ?? a.records,
      i = typeof a.active_count === "number" ? a.active_count : null,
      o = Array.isArray(r) && r.length > 0;
    if (
      e.includes("webcast/eco/violation_list")
        ? !(i && i > 0)
        : !(o || (i && i > 0))
    )
      return null;
    return {
      kind: "violation",
      text: Z(r) || `${i ?? 1} restrição(ões) ativa(s) na conta`,
      active: e.includes("webcast/eco/violation_list") ? i : null,
    };
  }
  function N(e, t) {
    let n = (o, l) => {
        let s = W(o, l);
        if (s) t(s);
      },
      a = e.fetch.bind(e),
      r = async (...o) => {
        let l = await a(...o);
        try {
          let s = o[0],
            u = typeof s === "string" ? s : s instanceof URL ? s.href : s.url;
          if (A(u))
            l.clone()
              .text()
              .then(
                (h) => n(u, h),
                () => {},
              );
        } catch {}
        return l;
      };
    e.fetch = r;
    let i = e.XMLHttpRequest.prototype.open;
    e.XMLHttpRequest.prototype.open = function (o, l, ...s) {
      let u = String(l);
      if (A(u))
        this.addEventListener("load", () => {
          if (typeof this.responseText === "string") n(u, this.responseText);
        });
      return i.call(this, o, l, ...s);
    };
  }
  function P(e) {
    for (let t of e.querySelectorAll('button[data-tid="m4b_button"]')) {
      if (t.textContent?.trim() !== "Iniciar LIVE") continue;
      let n = t.parentElement;
      if (
        !(
          t.disabled ||
          t.classList.contains("arco-btn-disabled") ||
          t.getAttribute("aria-disabled") === "true" ||
          t.style.pointerEvents === "none"
        )
      )
        continue;
      if (t.disabled) t.disabled = !1;
      if (t.classList.contains("arco-btn-disabled"))
        t.classList.remove("arco-btn-disabled");
      if (t.getAttribute("aria-disabled") === "true")
        t.removeAttribute("aria-disabled");
      if (t.style.pointerEvents === "none")
        t.style.removeProperty("pointer-events");
      if (t.style.cursor === "not-allowed") t.style.removeProperty("cursor");
      if (n?.tagName === "SPAN" && n.style.cursor === "not-allowed")
        n.style.removeProperty("cursor");
    }
  }
  function z(e) {
    let t = e.defaultView?.MutationObserver;
    if (!t) return () => {};
    let n = new t(() => P(e));
    return (
      n.observe(e, {
        subtree: !0,
        childList: !0,
        characterData: !0,
        attributes: !0,
        attributeFilter: [
          "disabled",
          "aria-disabled",
          "class",
          "style",
          "data-tid",
        ],
      }),
      P(e),
      () => n.disconnect()
    );
  }
  z(document);
  var m = null,
    c = null,
    v = null,
    U = [],
    L = [],
    p = new Map(),
    I = new Map();
  function V(e) {
    try {
      let t = e.captureStream;
      if (!t) return [];
      return t.call(e).getAudioTracks();
    } catch {
      return [];
    }
  }
  function Q(e, t) {
    let n = document.getElementById(e);
    if (!n || !c) return;
    let a = V(n);
    if (!a.length) return;
    let r = p.get(e);
    if (!r) {
      r = c.createGain();
      let i = () => {
        let o = Number(n.dataset.gain ?? 1);
        return Number.isFinite(o) ? o : 0;
      };
      (r.gain.value = i()), r.connect(t);
      try {
        let o = c.createAnalyser();
        (o.fftSize = 256), r.connect(o), L.push({ id: e, analyser: o });
      } catch {}
      try {
        let o = new MutationObserver(() => {
          try {
            r.gain.setTargetAtTime(i(), c.currentTime, 0.05);
          } catch {}
        });
        o.observe(n, { attributes: !0, attributeFilter: ["data-gain"] }),
          U.push(o);
      } catch {}
      p.set(e, r);
    }
    C(e, n, a, r);
  }
  function C(e, t, n, a) {
    if (!c) return;
    try {
      I.get(e)?.disconnect();
    } catch {}
    try {
      let r = c.createMediaStreamSource(new MediaStream(n));
      r.connect(a), I.set(e, r), g++, b++;
    } catch {}
  }
  function k() {
    try {
      window.clearInterval(ee),
        (g = 0),
        (b = 0),
        p.clear(),
        I.clear(),
        (L.length = 0);
      for (let e of U.splice(0)) e.disconnect();
      try {
        c?.close();
      } catch {}
      (c = new AudioContext()), (v = c.createMediaStreamDestination());
      for (let e of f) Q(e, v);
      return c.resume(), (D = x()), !0;
    } catch {
      return !1;
    }
  }
  function Y() {
    return v?.stream.getAudioTracks()[0] ?? null;
  }
  var ee = 0;
  function R() {
    let e = 0;
    for (let t of f)
      try {
        let n = document.getElementById(t),
          a = n?.captureStream;
        if (n && a) e += a.call(n).getAudioTracks().length;
      } catch {}
    return e;
  }
  var D = [];
  function x() {
    return f.map((e) => {
      let t = document.getElementById(e);
      return t ? t.currentSrc || t.src || "" : "";
    });
  }
  function te() {
    if (!c || c.state === "suspended" || !v) return !1;
    let e = !1;
    for (let t of f) {
      let n = document.getElementById(t),
        a = n ? p.get(t) : void 0;
      if (!n) continue;
      // Canal que começou a tocar depois de montar o microfone (ex.: áudio próprio): conecta agora.
      if (!a) {
        if (V(n).length) Q(t, v), (e = !0);
        continue;
      }
      let r = V(n);
      if (!r.length) continue;
      C(t, n, r, a), (e = !0);
    }
    if (e) D = x();
    return e;
  }
  function E() {
    if (!c || !v) {
      if (!f.some((t) => document.getElementById(t))) return;
      if (k()) (m = null), y++;
      return;
    }
    if (c.state === "suspended") {
      c.resume();
      return;
    }
    if (g === 0) {
      if (R() === 0) return;
      if (k()) (m = null), y++;
      return;
    }
    if (x().some((t, n) => t && t !== D[n]) || R() > b) te();
  }
  if (typeof window < "u") {
    for (let e of ["pointerdown", "keydown"])
      window.addEventListener(e, () => E(), { capture: !0, passive: !0 });
    try {
      new MutationObserver((e) => {
        for (let t of e) {
          let n = t.target;
          if (n instanceof HTMLAudioElement && f.includes(n.id)) {
            E();
            break;
          }
        }
      }).observe(document, {
        subtree: !0,
        attributes: !0,
        attributeFilter: ["src"],
      });
    } catch {}
  }
  var y = 0,
    g = 0,
    b = 0;
  window.__zaalysMix = {
    state: () => ({
      ctx: c?.state ?? null,
      rebuilds: y,
      wiredChannels: g,
      wiredTracks: b,
      sticky: navigator.userActivation?.hasBeenActive ?? null,
    }),
    levels: async () => {
      let e = new Uint8Array(128),
        t = {};
      for (let { id: n, analyser: a } of L)
        try {
          await new Promise((i) => setTimeout(i, 1200)),
            a.getByteTimeDomainData(e);
          let r = 0;
          for (let i of e) r += Math.abs(i - 128);
          t[n] = Math.round((r / e.length) * 100) / 100;
        } catch {
          t[n] = -1;
        }
      return t;
    },
    rebuild: () => {
      if (k()) return (m = null), y++, !0;
      return !1;
    },
  };
  function H() {
    try {
      return (
        document
          .getElementById(d.canvas)
          ?.captureStream(30)
          .getVideoTracks()[0] ?? null
      );
    } catch {
      return null;
    }
  }
  function ne() {
    if (!document.getElementById(d.canvas)) return null;
    if ((E(), !m)) {
      let e = Y();
      if (!c || !v || !e) return null;
      m = { video: H(), audio: e };
    } else m.video = H();
    return m;
  }
  if (navigator.mediaDevices)
    B(navigator.mediaDevices, {
      source: () => {
        let e = ne();
        if (e) window.postMessage({ [S]: "camera-in-use" }, location.origin);
        return e;
      },
      owns: () => document.getElementById(d.canvas)?.dataset.own === "1",
      makeStream: (e) => new MediaStream(e),
      tracksOf: (e) => e.getTracks(),
    });
  N(window, (e) =>
    window.postMessage({ [S]: "page-signal", signal: e }, location.origin),
  );
})();
