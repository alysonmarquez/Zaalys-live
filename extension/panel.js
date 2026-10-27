// MediaFlowMZ Live 4 — painel na página de LIVE do TikTok Shop (Início, Áudio e Log).
(() => {
  var {
      defineProperty: Rt,
      getOwnPropertyNames: Pr,
      getOwnPropertyDescriptor: Rr,
    } = Object,
    Or = Object.prototype.hasOwnProperty;
  function Ir(e) {
    return this[e];
  }
  var pl = (e) => {
      var t = (oo ??= new WeakMap()).get(e),
        n;
      if (t) return t;
      if (
        ((t = Rt({}, "__esModule", { value: !0 })),
        (e && typeof e === "object") || typeof e === "function")
      ) {
        for (var o of Pr(e))
          if (!Or.call(t, o))
            Rt(t, o, {
              get: Ir.bind(e, o),
              enumerable: !(n = Rr(e, o)) || n.enumerable,
            });
      }
      return oo.set(e, t), t;
    },
    oo;
  var _r = (e) => e;
  function Nr(e, t) {
    this[e] = _r.bind(null, t);
  }
  var hl = (e, t) => {
    for (var n in t)
      Rt(e, n, {
        get: t[n],
        enumerable: !0,
        configurable: !0,
        set: Nr.bind(t, n),
      });
  };
  function $r({ userAgent: e, maxTouchPoints: t = 0, screen: n }) {
    let o = /Macintosh/.test(e) && t > 1,
      i = n ? Math.min(n.width, n.height) : 0,
      r = o
        ? i && i < 600
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
    return `${o ? "Orion" : /Edg\//.test(e) ? "Edge" : "Chrome"} · ${r}`;
  }
  var io = () =>
    $r({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      screen: window.screen,
    });
  var A = (e, t = 0) =>
    new Promise((n) => {
      let o = {
          ok: !1,
          status: 0,
          error:
            "Não conseguimos falar com a extensão. Aperte F5 nesta página.",
        },
        i = t
          ? setTimeout(
              () =>
                n({
                  ok: !1,
                  status: 0,
                  error: "O MediaFlowMZ demorou para responder. Tente de novo.",
                }),
              t,
            )
          : 0;
      try {
        chrome.runtime.sendMessage(e, (r) => {
          clearTimeout(i), n(r ?? o);
        });
      } catch {
        clearTimeout(i), n(o);
      }
    });
  var b = {
    direct: (e) => A({ type: "call", path: "direct", input: e }),
    status: () => A({ type: "status" }, 30000),
    activate: (e) => A({ type: "activate", key: e, label: io() }, 30000),
    logout: () => A({ type: "logout" }),
    latest: () => A({ type: "latest" }),
    onAir: (e) => A({ type: "onair", on: e }),
    updateCheck: () => A({ type: "updateCheck" }),
    ping: () => A({ type: "call", path: "ping" }),
    plans: () => A({ type: "call", path: "plans" }),
    plan: (e) => A({ type: "call", path: "plan", input: { id: e } }),
    chatToken: (e) =>
      A({ type: "call", path: "chatToken", input: { handle: e } }),
    voiceLines: (e) =>
      A({ type: "call", path: "voiceLines", input: { planId: e } }),
    liveBoard: (e = 5) =>
      A({ type: "call", path: "liveBoard", input: { limit: e } }),
    answer: (e, t, n, o = []) =>
      A({
        type: "call",
        path: "answer",
        input: { planId: e, question: t, productId: n ?? void 0, history: o },
      }),
    violationStatus: () => A({ type: "call", path: "violationStatus" }),
    startSession: (e) =>
      A({ type: "call", path: "startSession", input: { planId: e } }),
    event: (e, t) =>
      A({ type: "call", path: "event", input: { sessionId: e, event: t } }),
    endSession: (e, t, n) =>
      A({
        type: "call",
        path: "endSession",
        input: { sessionId: e, reason: t, stats: n },
      }),
  };
  var ro = (e) => `R$ ${(e / 100).toFixed(2).replace(".", ",")}`,
    Xe = (e) =>
      new Date(e).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
  class Ot {
    hooks;
    timer = null;
    sale = null;
    constructor(e) {
      this.hooks = e;
    }
    get running() {
      return (
        this.sale !== null &&
        (this.sale.endsAt === void 0 || this.sale.endsAt > this.hooks.now())
      );
    }
    get current() {
      return this.running ? this.sale : null;
    }
    get closesAt() {
      return this.running ? (this.sale.endsAt ?? 0) : 0;
    }
    open(e) {
      if (this.sale && !this.running) this.close("time");
      if (this.sale) return !1;
      if (e.endsAt !== void 0) {
        let t = e.endsAt - this.hooks.now();
        if (t <= 0) return !1;
        return (
          (this.sale = e),
          this.hooks.onStart(e),
          (this.timer = this.hooks.setTimer(() => this.close("time"), t)),
          !0
        );
      }
      return (this.sale = e), this.hooks.onStart(e), !0;
    }
    close(e = "manual") {
      if (!this.sale) return;
      if (this.timer !== null) this.hooks.clearTimer(this.timer);
      (this.timer = null), (this.sale = null), this.hooks.onEnd(e);
    }
    stop() {
      this.close("stopped");
    }
  }
  var ao = "(pointer: coarse) and (max-width: 1100px)",
    so = "(max-width: 600px)";
  var Dr = ["Produtos", "Vídeo", "Dados e chat"];
  function lo({ doc: e, media: t }) {
    let n = e.documentElement,
      o = e.createElement("style");
    (o.id = "zaalys-compact-console"),
      (o.textContent = `
html.zaalys-compact #content-container {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
html.zaalys-compact #content-container > aside {
  transform: translateX(-100%);
  transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 220ms ease-out !important;
  z-index: 1001 !important;
}
html.zaalys-compact.zaalys-menu-open #content-container > aside {
  transform: none;
  /* Dims the console behind the open menu; a tap on it closes the menu. */
  box-shadow: 0 0 0 100vmax rgb(0 0 0 / 0.35) !important;
}
html.zaalys-compact #content-container > main {
  min-width: 0 !important;
  width: 100% !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
html.zaalys-compact #content-container > main > * {
  margin-left: 0 !important;
  width: auto !important;
  max-width: 100% !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}
/* TikTok fixes the width of everything between the page and the workbench's
   row at 1012px, so the row could only scroll a third of the way (the last
   column was out of reach). Everything on the way down fits the screen. */
html.zaalys-compact #content-container > main *:has(#dashboard-guide-chat) {
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
/* The workbench is three 324px columns in a row (products, preview, guide and
   chat): 1012px on a 402px phone. Each column becomes a full-width page and
   the row swipes between them; the pager below jumps straight to one. */
html.zaalys-compact .liveWorkbenchProviderWrapper div:has(> #dashboard-guide-chat) {
  display: flex !important;
  flex-wrap: nowrap !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  gap: 8px;
}
html.zaalys-compact .liveWorkbenchProviderWrapper div:has(> #dashboard-guide-chat)::-webkit-scrollbar { display: none; }
html.zaalys-compact .liveWorkbenchProviderWrapper div:has(> #dashboard-guide-chat) > * {
  flex: 0 0 100% !important;
  width: 100% !important;
  max-width: 100% !important;
  scroll-snap-align: start;
}
html.zaalys-compact.zaalys-paged #content-container > main > * { padding-top: 48px !important; }

/* TikTok's dialogs (adding products, settings) are desktop-sized and taller
   than a phone: the confirm button ended up out of reach. They fit the screen
   here and scroll inside, with the title and the buttons always in view. */
html.zaalys-compact .arco-modal-wrapper { padding: 0 !important; }
html.zaalys-compact .arco-modal {
  width: calc(100vw - 16px) !important;
  max-width: calc(100vw - 16px) !important;
  top: max(8px, env(safe-area-inset-top, 0px)) !important;
  margin: 0 auto !important;
  max-height: calc(100dvh - 16px) !important;
  display: flex !important;
  flex-direction: column;
}
html.zaalys-compact .arco-modal-header, html.zaalys-compact .arco-modal-footer { flex: 0 0 auto; }
html.zaalys-compact .arco-modal-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto !important;
  -webkit-overflow-scrolling: touch;
  padding: 12px !important;
}
html.zaalys-compact .arco-drawer { width: 100vw !important; max-width: 100vw !important; }
html.zaalys-compact .arco-drawer-content { overflow: auto !important; -webkit-overflow-scrolling: touch; }
/* A table squeezed to the drawer's 354px kept its fixed columns and crushed
   the product name to a letter per line. Tables keep a readable width and
   scroll sideways inside the dialog, the tick box column pinned; the filter
   row above them wraps instead of running off the right edge. */
html.zaalys-compact .arco-drawer table, html.zaalys-compact .arco-modal table { min-width: 680px; }
html.zaalys-compact .arco-drawer .arco-form, html.zaalys-compact .arco-drawer .arco-space, html.zaalys-compact .arco-drawer .arco-tabs-content .flex:not(table *) {
  flex-wrap: wrap !important;
}
html.zaalys-compact .arco-table-container, html.zaalys-compact .arco-table-content-scroll, html.zaalys-compact .arco-table-body {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}
html.zaalys-compact .arco-table-th:first-child, html.zaalys-compact .arco-table-td:first-child {
  position: sticky !important;
  left: 0;
  z-index: 2;
  background: #fff;
}
html.zaalys-compact .arco-checkbox { padding: 6px; margin: -6px; }
html.zaalys-compact .arco-checkbox-mask { width: 20px !important; height: 20px !important; }
html.zaalys-compact .arco-select-popup, html.zaalys-compact .arco-trigger-popup { max-width: calc(100vw - 16px); }
#zaalys-console-menu {
  all: initial;
  position: fixed;
  top: max(10px, env(safe-area-inset-top, 0px));
  left: max(8px, env(safe-area-inset-left, 0px));
  z-index: 1002;
  display: none;
  place-items: center;
  width: 44px;
  height: 40px;
  border-radius: 12px;
  /* MediaFlowMZ' own surface, so it reads as ours on TikTok's white header. */
  background: oklch(0.255 0.007 75);
  box-shadow: 0 2px 8px -2px rgb(20 16 10 / 0.35);
  color: oklch(0.96 0.004 75);
  font: 600 20px/1 ui-sans-serif, system-ui, -apple-system, sans-serif;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
html.zaalys-compact #zaalys-console-menu { display: grid; }
#zaalys-console-menu:active { transform: scale(0.97); }
#zaalys-console-menu:focus-visible { outline: 2px solid oklch(0.86 0.19 128); outline-offset: 2px; }
#zaalys-workbench-pager {
  all: initial;
  position: fixed;
  top: 64px;
  left: 8px;
  right: 8px;
  z-index: 1000;
  display: none;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: oklch(0.255 0.007 75);
  box-shadow: 0 2px 8px -2px rgb(20 16 10 / 0.35);
  font: 600 13px/1 ui-sans-serif, system-ui, -apple-system, sans-serif;
}
html.zaalys-paged #zaalys-workbench-pager { display: grid; }
#zaalys-workbench-pager button {
  all: initial;
  display: grid;
  place-items: center;
  height: 34px;
  border-radius: 9px;
  color: oklch(0.72 0.008 75);
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color 160ms ease-out, color 160ms ease-out;
}
#zaalys-workbench-pager button[aria-current="true"] { background: oklch(0.86 0.19 128); color: oklch(0.2 0.05 128); }
#zaalys-workbench-pager button:active { transform: scale(0.97); }
#zaalys-workbench-pager button:focus-visible { outline: 2px solid oklch(0.86 0.19 128); outline-offset: 1px; }
@media (prefers-reduced-motion: reduce) {
  #zaalys-workbench-pager button { transition: none; }
  html.zaalys-compact #content-container > aside { transition: none !important; }
}
`),
      (e.head ?? n).append(o);
    let i = e.createElement("button");
    (i.id = "zaalys-console-menu"),
      (i.type = "button"),
      (i.textContent = "☰"),
      i.setAttribute("aria-label", "Menu do TikTok"),
      i.setAttribute("aria-expanded", "false"),
      n.append(i);
    let r = (T) => {
      n.classList.toggle("zaalys-menu-open", T),
        i.setAttribute("aria-expanded", String(T));
    };
    i.addEventListener("click", () =>
      r(!n.classList.contains("zaalys-menu-open")),
    );
    let l = (T) => {
      if (!n.classList.contains("zaalys-menu-open")) return;
      let S = T.target;
      if (S === i || (S && i.contains(S))) return;
      let q = e.querySelector("#content-container > aside"),
        U = Boolean(q && S && q.contains(S)),
        we = U && S.closest?.(".arco-menu-item");
      if (!U || we) r(!1);
    };
    e.addEventListener("click", l, !0);
    let s = e.createElement("nav");
    (s.id = "zaalys-workbench-pager"),
      s.setAttribute("aria-label", "Colunas do console");
    let c = Dr.map((T, S) => {
      let q = e.createElement("button");
      return (
        (q.type = "button"),
        (q.textContent = T),
        q.addEventListener("click", () => {
          let U = e.querySelector(
              ".liveWorkbenchProviderWrapper div:has(> #dashboard-guide-chat)",
            ),
            we = U?.children[S];
          if (!U || !we) return;
          let Qe =
            U.scrollLeft +
            we.getBoundingClientRect().left -
            U.getBoundingClientRect().left;
          U.scrollTo({ left: Qe, behavior: "smooth" }), (p = S), h();
        }),
        s.append(q),
        q
      );
    });
    n.append(s);
    let d = null,
      p = 0,
      h = () =>
        c.forEach((T, S) => T.setAttribute("aria-current", String(S === p))),
      g = () => {
        if (!d) return h();
        let T = d.getBoundingClientRect().left,
          S = 0,
          q = 1 / 0;
        [...d.children].slice(0, c.length).forEach((U, we) => {
          let Qe = Math.abs(U.getBoundingClientRect().left - T);
          if (Qe < q) [S, q] = [we, Qe];
        }),
          (p = S),
          h();
      },
      y = () => {
        let T = t.matches
          ? e.querySelector(
              ".liveWorkbenchProviderWrapper div:has(> #dashboard-guide-chat)",
            )
          : null;
        if (T !== d)
          d?.removeEventListener("scroll", g),
            (d = T),
            d?.addEventListener("scroll", g, { passive: !0 });
        let S = Boolean(d && d.scrollWidth > d.clientWidth + 4);
        if (n.classList.contains("zaalys-paged") !== S)
          n.classList.toggle("zaalys-paged", S);
        g();
      },
      P = 0,
      L = new e.defaultView.MutationObserver(() => {
        if (P) return;
        P = e.defaultView.setTimeout(() => {
          (P = 0), y();
        }, 250);
      });
    L.observe(e.body ?? n, { childList: !0, subtree: !0 });
    let X = () => {
      if ((n.classList.toggle("zaalys-compact", t.matches), !t.matches)) r(!1);
      y();
    };
    return (
      X(),
      t.addEventListener("change", X),
      () => {
        t.removeEventListener("change", X),
          e.removeEventListener("click", l, !0),
          L.disconnect(),
          d?.removeEventListener("scroll", g),
          n.classList.remove(
            "zaalys-compact",
            "zaalys-menu-open",
            "zaalys-paged",
          ),
          o.remove(),
          i.remove(),
          s.remove();
      }
    );
  }
  class It {
    env;
    lock = null;
    wanted = !1;
    constructor(e) {
      this.env = e;
    }
    onVisible = () => {
      if (this.wanted && this.env.doc.visibilityState === "visible")
        this.take();
    };
    async take() {
      if (!this.env.wakeLock || (this.lock && !this.lock.released)) return;
      try {
        (this.lock = await this.env.wakeLock.request("screen")),
          this.lock.addEventListener?.("release", () => (this.lock = null));
      } catch {
        this.lock = null;
      }
    }
    hold() {
      if (this.wanted) return;
      (this.wanted = !0),
        this.env.doc.addEventListener("visibilitychange", this.onVisible),
        this.take();
    }
    release() {
      if (!this.wanted) return;
      (this.wanted = !1),
        this.env.doc.removeEventListener("visibilitychange", this.onVisible);
      let e = this.lock;
      (this.lock = null), e?.release().catch(() => {});
    }
    get held() {
      return Boolean(this.lock && !this.lock.released);
    }
  }
  class _t {
    comments;
    random;
    deck = [];
    last = null;
    constructor(e, t = Math.random) {
      this.comments = e;
      this.random = t;
    }
    next() {
      if (!this.comments.length) return null;
      if (!this.deck.length) this.deck = this.shuffle();
      if (
        this.deck.length > 1 &&
        this.deck[this.deck.length - 1] === this.last
      ) {
        let e = this.deck.length - 1;
        [this.deck[0], this.deck[e]] = [this.deck[e], this.deck[0]];
      }
      return (this.last = this.deck.pop()), this.last;
    }
    shuffle() {
      let e = [...this.comments];
      for (let t = e.length - 1; t > 0; t--) {
        let n = Math.floor(this.random() * (t + 1));
        [e[t], e[n]] = [e[n], e[t]];
      }
      return e;
    }
  }
  function co(e, t = Math.random) {
    return Math.floor((e.min + (e.max - e.min) * t()) * 1000);
  }
  var uo = "Não encontrei a caixa de comentário da live.",
    po = "O produto não está na lista da live. Adicione-o no TikTok.";
  class Nt {
    deps;
    pinTimer = null;
    commentTimer = null;
    rotation;
    state = {
      running: !1,
      commentsSent: 0,
      pins: 0,
      nextCommentIn: null,
      lastProblem: null,
    };
    nextCommentAt = null;
    pack;
    constructor(e, t) {
      this.deps = t;
      (this.pack = e), (this.rotation = new _t(e.comments, t.random));
    }
    start(e) {
      this.stop(), (this.state.running = !0), this.configure(e);
    }
    configure(e) {
      if (!this.state.running) return;
      let t = e.commentEvery,
        n =
          t &&
          (t.min !== this.pack.commentEvery.min ||
            t.max !== this.pack.commentEvery.max);
      if (t) this.pack = { ...this.pack, commentEvery: t };
      if (e.pin && this.pinTimer === null) this.pinLoop();
      if (!e.pin) this.clear("pinTimer");
      let o = this.commentTimer !== null;
      if (!e.comments || !this.pack.comments.length)
        this.clear("commentTimer"), (this.nextCommentAt = null);
      else if (!o || n) this.clear("commentTimer"), this.scheduleComment();
    }
    stop() {
      this.clear("pinTimer"),
        this.clear("commentTimer"),
        (this.state.running = !1),
        (this.nextCommentAt = null);
    }
    status() {
      return {
        ...this.state,
        nextCommentIn:
          this.nextCommentAt === null
            ? null
            : Math.max(0, this.nextCommentAt - this.deps.now()),
      };
    }
    clear(e) {
      let t = this[e];
      if (t !== null) this.deps.clearTimer(t);
      this[e] = null;
    }
    pinLoop() {
      let e = this.deps.pinProduct();
      if (e === "not_found") this.state.lastProblem = po;
      else {
        if (e === "pinned") this.state.pins++;
        if (this.state.lastProblem === po) this.state.lastProblem = null;
      }
      this.pinTimer = this.deps.setTimer(
        () => this.pinLoop(),
        this.pack.pinEvery * 1000,
      );
    }
    scheduleComment() {
      let e = co(this.pack.commentEvery, this.deps.random);
      (this.nextCommentAt = this.deps.now() + e),
        (this.commentTimer = this.deps.setTimer(() => {
          let t = this.rotation.next(),
            n = t ? this.deps.postComment(t) : null;
          if (n && !n.ok && n.reason === "blocked")
            (t = this.rotation.next()),
              (n = t ? this.deps.postComment(t) : null);
          if (t && n) {
            if (n.ok) {
              if ((this.state.commentsSent++, this.state.lastProblem === uo))
                this.state.lastProblem = null;
            } else if (n.reason !== "blocked") this.state.lastProblem = uo;
          }
          this.scheduleComment();
        }, e));
    }
  }
  var qr = (e) =>
      e
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim(),
    Z = (...e) =>
      new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${e.join("|")})(?![\\p{L}\\p{N}])`,
        "u",
      );
  var zr = Z(
      "https?:\\/\\/\\S+",
      "www\\.\\S+",
      "whats ?app|whats|wpp|zap ?zap|zap",
      "(?:segue|siga|sigam|seguir|me segue|me acha|me encontra|me procura|procura|procure|chama|me chama|fala comigo|la no|la na|no meu|no nosso|na minha|no perfil|meu perfil|nosso perfil|perfil)(?: (?:a gente|la|a loja|a marca))? (?:no|na|do|da|pelo|pela|de)? ?(?:insta|instagram|facebook|face|youtube|canal|telegram|kwai|twitter|threads|pinterest)",
      "link ?tree",
      "shopee|mercado ?livre|aliexpress|amazon|magalu|shein",
      "link (?:na|no|da|do) (?:bio|perfil|descricao|comentario)",
      "na bio|da bio",
      "clica(?:r)? no link|link (?:abaixo|externo)",
      "(?:me )?(?:chama|chame|chamar|chamem|manda|mande|mandar|fala|fale|falar|escreve|escreva)(?: (?:uma |um )?(?:mensagem|msg|oi))? (?:no|na|pelo|pela|por|via|pro|pra|no meu|no nosso) (?:direct|dm|inbox|privado|pv)",
      "direct|directs|dm|inbox",
      "qr ?code|qr|codigo qr",
      "(?:meu|nosso) (?:numero|telefone|celular|contato|whats|zap)",
      "e-?mail",
      "(?:nosso|meu|no|pelo|do) site|site oficial|loja fisica",
      "fora do (?:tiktok|app|aplicativo)",
    ),
    Fr = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i,
    Hr = /(?<![\p{L}\p{N}])@[\p{L}\p{N}_.]{2,}/u,
    Ur =
      /(?<![\p{L}\p{N}@.])[A-Za-z0-9][\w-]*(?:\.[\w-]+)*\.(?:com|net|org|br|io|me|ly|app|shop|store|site|online|link|info|biz|xyz|ee|gl|gg)(?![\p{L}\p{N}])/u;
  function Br(e) {
    for (let t of e.match(/\+?\(?\d[\d\s().-]{6,}\d/g) ?? []) {
      if (/^\d{1,3}(?:\.\d{3})+$/.test(t)) continue;
      if (!/\d{4}/.test(t)) continue;
      let n = t.replace(/\D/g, "").length;
      if (n >= 10 && n <= 13) return !0;
      if (n >= 8 && /\d{4,5}[-\s]\d{4}(?!\d)/.test(t)) return !0;
    }
    return !1;
  }
  var Vr = [
    [zr, "leva para fora do TikTok (link, contato ou outra rede)"],
    [
      Z(
        "(?<!nao (?:e |eh |sou |somos )?)(?:o|a|os|as) mais barat[oa]s?",
        "mais barat[oa]s? (?:do|da|de|no|na) (?:brasil|mercado|tiktok|internet|mundo)",
        "preco mais baixo|menor preco|melhor preco",
        "mais em conta do (?:brasil|mercado|tiktok|mundo)",
        "n[°º]\\.? ?(?:1|um)",
        "(?:e|o|a|marca|produto) numero (?:1|um)",
        "numero (?:1|um) (?:em|do|da|de|no|na)",
        "top ?1",
        "lider (?:de|do|em) (?:mercado|vendas)",
        "(?:o|a) melhor (?:do|da) (?:brasil|mercado|mundo|tiktok|internet)",
        "mais vendid[oa]s? do (?:brasil|mundo|tiktok)",
      ),
      "diz que é o mais barato ou o número um",
    ],
    [
      Z(
        "(?:100 ?%|cem por cento) (?:natural|organic[oa]s?|pur[oa]s?|vegan[oa]s?)",
        "totalmente natural",
        "(?:aprovad|recomendad|indicad|endossad)[oa]s? (?:por|pel[oa]s?) (?:medic|dermatolog|especialista|dentista|nutricionista|cientista|anvisa|famos)\\p{L}*",
        "(?:os )?(?:medicos|dermatologistas|especialistas|dentistas) (?:recomendam|aprovam|indicam)",
        "premiad[oa]s?|ganhou (?:o |um )?premio|vencedor d[oe] premio",
        "(?:cientifica|clinica)mente comprovad[oa]s?|comprovad[oa]s? (?:cientifica|clinica)mente",
      ),
      "alegação sem prova (natural, aprovado por especialista, prêmio)",
    ],
    [
      Z(
        "(?:cura|curar|curam|curou|cure|(?<!se )trata(?!-se)|tratar|tratam|elimina|eliminar|eliminam|acaba com|combate|combater|previne|prevenir|resolve) (?:a |o |as |os |de |da |do |das |dos |sua |seu |suas |seus )?(?:doenc\\p{L}*|dor(?:es)?|infecc\\p{L}*|inflamac\\p{L}*|acne|espinhas?|cravos?|celulite|estrias?|rugas?|linhas de expressao|flacidez|fungos?|micose|frieira|caspa|queda (?:de|do) cabelo|calvicie|diabetes|pressao alta|hipertensao|colesterol|ansiedade|depressao|insonia|varizes|psoriase|dermatite|eczema|gastrite|refluxo|enxaqueca|cancer|tumor|verrugas?|melasma|herpes|hemorroidas?|artrite|artrose|osteoporose|obesidade|gordura localizada|inchaco|retencao de liquido|cicatriz(?:es)?|manchas? (?:na|da|de) pele|olheiras?)",
        "detox|desintoxica",
        "previne doenc\\p{L}*",
      ),
      "promete cura ou tratamento",
    ],
    [
      Z(
        "emagrec\\p{L}*",
        "perde(?:r)? peso|perca peso|perda de peso|perder (?:uns )?quilos",
        "ozempic|mounjaro|wegovy|saxenda|glp-? ?1|semaglutida|tirzepatida",
        "queima(?:r)? gordura|seca(?:r)? (?:a )?barriga|barriga chapada",
        "inibe o apetite|inibidor de apetite|tira a fome",
      ),
      "promete emagrecimento",
    ],
    [
      Z(
        "(?:resultado|efeito|sucesso|satisfacao|beneficio)s? garantid[oa]s?",
        "garant(?:e|o|imos) (?:o |os |um |uns )?resultados?|(?:eu |te |lhe )?garanto que|funciona(?:mento)? garantido",
        "antes e depois|antes x depois|antes\\/depois",
        "resultados? (?:visive(?:l|is) )?(?:em|na|no) (?:ate )?(?:\\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta|poucos|poucas) (?:dias?|semanas?|mes|meses|horas?|minutos?|aplicac\\p{L}*|usos?|lavage\\p{L}*)",
        "(?:resultado|efeito)s? imediat[oa]s?",
        "(?:resultado|efeito|diferenca)s? (?:ja )?(?:na|no|desde a|desde o) primeir[oa] (?:aplicacao|uso|semana|dia|lavagem)",
      ),
      "garante resultado ou promete antes e depois",
    ],
    [
      Z(
        "ultim[oa]s? (?:unidades?|pecas?|estoques?)|ultima chance|ultima oportunidade",
        "enquanto (?:durar|durarem|tiver|houver|tem) (?:o |no )?estoque",
        "estoque (?:limitado|acabando|no fim)",
        "so hoje|somente hoje|apenas hoje|so ate hoje|hoje e o ultimo dia",
        "(?<!nao )(?:vai acabar|ta acabando|esta acabando|vai esgotar|ta esgotando|esta esgotando|esgotando|quase esgotad[oa]s?)",
        "poucas unidades|restam (?:poucas|poucos|\\d+)",
        "corr(?:e|em|a|am)(?= (?:que|la|pra|para|aproveitar|garantir|comprar)|\\s*[!,.]|$)",
        "agora ou nunca",
        "nao (?:perca|percam)|nao deixe (?:pra|para) depois|imperdivel",
        "menor preco que (?:voce|vc) (?:vai|ja) ver",
        "nunca mais (?:vai )?(?:ver|ter|achar) (?:esse|este) preco",
      ),
      "urgência ou escassez inventada",
    ],
    [
      Z(
        "inspirad[oa]s? (?:em|no|na|nos|nas)",
        "similar(?:es)? (?:a|ao|aos|as)",
        "igual(?:zinh[oa])?s? (?:ao|a|o|aos|as) (?:original|d[oa]s? (?!foto|video|imagem|pagina|anuncio|sacolinha|descricao|produto|loja)\\p{L}+)",
        "mesm[oa] (?:formula|fragrancia|cheiro) (?:do|da|de)",
        "(?<!nao (?:e |eh |tem |vende |vendemos )?(?:uma? |nenhuma? )?)(?:replicas?|dupes?|contratipos?|clones?|falsificad[oa]s?|imitac(?:ao|oes)|pirata)",
        "1 ?: ?1",
        "primeira linha(?! d[aoe])",
        "uma copia|copia (?:fiel|perfeita|identica)",
        "versao (?:barata|generica|similar) (?:do|da|de)",
      ),
      "compara com outra marca ou sugere réplica",
    ],
  ];
  function Ze(e) {
    if (!e.trim()) return null;
    let t = qr(e),
      n = e.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (Fr.test(e) || Hr.test(e) || Ur.test(n) || Br(e))
      return "leva para fora do TikTok (link, contato ou outra rede)";
    for (let [o, i] of Vr) if (o.test(t)) return i;
    return null;
  }
  function ho(e, t) {
    let n = t ? `@${t}` : null,
      o = n && e.startsWith(n) ? e.slice(n.length) : e;
    return Ze(o);
  }
  var R = (e) =>
      e
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim(),
    Gr =
      /diga algo|say something|comente|comment|adicionar comentario|add a comment/,
    Wr = new Set(["enviar", "send", "publicar", "post"]),
    mo = new Set(["fixar", "pin", "destacar"]),
    fo = new Set(["fixado", "desfixar", "desafixar", "pinned", "unpin"]),
    go = 100,
    vo = (e) => {
      if (e.length <= go) return e;
      let t = e.slice(0, go),
        n = t.lastIndexOf(" ");
      return (n > 40 ? t.slice(0, n) : t).trim();
    };
  function Je(e) {
    let t = e.querySelector('[data-tid="m4b_input_textarea"]');
    if (t)
      return t.matches("textarea, input")
        ? t
        : t.querySelector("textarea, input");
    for (let n of e.querySelectorAll(
      "textarea, input[type=text], input:not([type])",
    ))
      if (Gr.test(R(n.placeholder ?? ""))) return n;
    return null;
  }
  var ae = (e) => R(e.textContent || e.getAttribute("aria-label") || ""),
    Oe = (e, t) =>
      `\uD83D\uDEE1️ Mensagem bloqueada: ${e} (“${t.slice(0, 80)}”)`;
  function Ie(e, t, n = {}) {
    let o = ho(vo(t), n.mention);
    if (o) return { ok: !1, reason: "blocked", why: o };
    let i = Je(e);
    if (!i) return { ok: !1, reason: "no_box" };
    let r = e.defaultView;
    i.focus(),
      Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(i),
        "value",
      )?.set?.call(i, vo(t)),
      i.dispatchEvent(new r.Event("input", { bubbles: !0 }));
    let l = i;
    for (let s = 0; l && s < 5; s++, l = l.parentElement) {
      let c = [...l.querySelectorAll("button")].find((d) => Wr.has(ae(d)));
      if (c) return c.click(), { ok: !0 };
    }
    return (
      i.dispatchEvent(
        new r.KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          bubbles: !0,
        }),
      ),
      { ok: !0 }
    );
  }
  var jr = new Set([
    "de",
    "da",
    "do",
    "com",
    "sem",
    "para",
    "pra",
    "por",
    "em",
    "no",
    "na",
    "dos",
    "das",
  ]);
  function Kr(e) {
    return Dt(e).join(" ");
  }
  function bo(e) {
    return R(e)
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !jr.has(t));
  }
  function Qr(e, t) {
    let n = [...new Set(bo(t))];
    if (!n.length) return 0;
    let o = new Set(bo(e));
    return n.filter((i) => o.has(i)).length / n.length;
  }
  var Xr = 0.6;
  function xo(e, t) {
    let n = t,
      o = null;
    for (let i of e.querySelectorAll("button")) {
      let r = ae(i),
        l = fo.has(r);
      if (!l && !mo.has(r)) continue;
      let s = i.parentElement;
      for (let c = 0; s && c < 6; c++, s = s.parentElement) {
        if (
          [...s.querySelectorAll("button")].filter(
            (h) => mo.has(ae(h)) || fo.has(ae(h)),
          ).length > 1
        )
          break;
        let p = Qr(Kr(s), n);
        if (p >= Xr) {
          if (!o || p > o.score) o = { button: i, pinned: l, score: p };
          break;
        }
      }
    }
    return o;
  }
  function ko(e, t) {
    let n = xo(e, t);
    return !n ? "not_found" : n.pinned ? "pinned" : "unpinned";
  }
  function ye(e, t) {
    let n = xo(e, t);
    if (!n) return "not_found";
    if (n.pinned) return "already";
    return n.button.click(), "pinned";
  }
  var Zr = new Set([
    "live",
    "console",
    "shop",
    "tiktok",
    "seller",
    "home",
    "inicio",
    "perfil",
  ]);
  function $t(e) {
    let t = [...e.querySelectorAll("span, a, div, p")].filter(
        (o) => o.children.length === 0,
      ),
      n = null;
    for (let o of t.slice(0, 120)) {
      let i = (o.textContent ?? "").trim(),
        r = i.startsWith("@") ? i.slice(1) : i;
      if (!/^[a-z0-9._]{2,24}$/.test(r) || Zr.has(r)) continue;
      if (i.startsWith("@")) return r;
      if (n === null && /[0-9._]/.test(r)) n = r;
    }
    return n;
  }
  var Yr =
    /acabou de entrar|entrou na|just joined|joined the|curtiu|enviou|liked|seguiu|começou a seguir|started following|compartilhou|shared|boas-vindas ao tiktok|welcome to tiktok|diretrizes da comunidade|community guidelines/;
  function Dt(e) {
    let t = [];
    for (let n of e.querySelectorAll("*")) {
      if (n.children.length) continue;
      let o = (n.textContent ?? "").trim();
      if (o) t.push(o);
    }
    if (!t.length) {
      let n = (e.textContent ?? "").trim();
      if (n) t.push(n);
    }
    return t;
  }
  var Jr = new Set([
    "host",
    "mod",
    "moderador",
    "moderator",
    "convidado",
    "guest",
    "admin",
    "equipe",
    "sub",
    "top fan",
  ]);
  function Ye(e) {
    let t = Dt(e).filter((i, r) => r === 0 || !Jr.has(R(i)));
    if (t.length < 2 || !t[0]) return null;
    let n = t[0]
        .replace(/^@/, "")
        .replace(/[:·]\s*$/, "")
        .trim(),
      o = t.slice(1).join(" ").trim();
    if (!n || !o) return null;
    if (Yr.test(R(`${n} ${o}`))) return null;
    if (!/\p{L}{2,}/u.test(o)) return null;
    return { user: n, text: o };
  }
  function ea(e) {
    let t = Je(e),
      n = t?.parentElement ?? null;
    for (let o = 0; n && o < 8; o++, n = n.parentElement)
      if (
        [...n.children].filter((r) => !r.contains(t)).some((r) => Ye(r)) ||
        [...n.querySelectorAll("div")].filter((r) => Ye(r)).length >= 2
      )
        return n;
    return e.body;
  }
  function So(e, t) {
    let n = ea(e),
      o = new Set(),
      i = (d) => `${d.user}\x00${d.text}`;
    for (let d of n.querySelectorAll("div")) {
      let p = Ye(d);
      if (p) o.add(i(p));
    }
    let r = (d) => {
        let p = Ye(d);
        if (!p) return;
        let h = i(p);
        if (o.has(h)) return;
        o.add(h), t(p);
      },
      l = e.defaultView,
      s = l?.MutationObserver ?? globalThis.MutationObserver;
    if (!s) return () => {};
    let c = new s((d) => {
      for (let p of d)
        for (let h of p.addedNodes) {
          if (!(h instanceof (l?.Element ?? Element))) continue;
          let g = h;
          r(g);
          for (let y of g.querySelectorAll("div")) r(y);
        }
    });
    return c.observe(n, { childList: !0, subtree: !0 }), () => c.disconnect();
  }
  var ta = new Set(["adicionar produtos", "add products", "add product"]),
    na = new Set(["adicionar", "add"]),
    wo = /link do produto|product url|url d[eo] produto|product link/i,
    oa = new Set([
      "adicionar",
      "adicionar produtos",
      "add",
      "add products",
      "confirmar",
      "confirm",
      "salvar",
      "save",
      "ok",
    ]);
  async function Eo(e, t, { timeoutMs: n = 12000, pollMs: o = 150 } = {}) {
    let i = (c) => new Promise((d) => setTimeout(d, c)),
      r = Date.now() + n,
      l =
        [...e.querySelectorAll("button, div[role=button]")].find((c) =>
          ta.has(ae(c)),
        ) ??
        [...e.querySelectorAll("button, div[role=button]")].find((c) =>
          na.has(ae(c)),
        );
    if (!l) return !1;
    l.click();
    let s = e.defaultView;
    while (Date.now() < r) {
      let c =
        [...e.querySelectorAll('[role="tab"]')].find((h) =>
          wo.test(h.textContent ?? ""),
        ) ??
        [...e.querySelectorAll("button, div")].find(
          (h) => h.children.length === 0 && wo.test(h.textContent ?? ""),
        );
      if (c) c.click();
      let d =
        [
          ...e.querySelectorAll(
            "input[type=text], input:not([type]), textarea",
          ),
        ].find((h) =>
          /url|link/i.test(
            `${h.placeholder ?? ""} ${h.getAttribute("aria-label") ?? ""}`,
          ),
        ) ?? null;
      if (!d) {
        await i(o);
        continue;
      }
      d.focus(),
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(d),
          "value",
        )?.set?.call(d, t),
        d.dispatchEvent(new s.Event("input", { bubbles: !0 }));
      let p =
        d.closest("[role=dialog], .arco-modal, .arco-drawer, .m4b-modal") ?? e;
      for (let h = 0; h < 8 && Date.now() < r; h++) {
        if (!d.isConnected) break;
        let g = [...p.querySelectorAll("button")].find(
          (y) => oa.has(ae(y)) && !y.disabled,
        );
        if (g) return g.click(), !0;
        await i(o);
      }
      await i(o);
    }
    return !1;
  }
  var ia =
    /^(.{1,40}?)\s+(?:acabou de entrar|entrou na live|entrou|just joined|joined)$/i;
  function yo(e) {
    let t = Dt(e).join(" ").replace(/\s+/g, " ").trim();
    if (!t || t.length > 80) return null;
    return t.match(ia)?.[1]?.trim() ?? null;
  }
  function To(e, t) {
    let n = new Set();
    for (let s of e.querySelectorAll("div, li, p, span")) {
      let c = s.children.length <= 3 ? yo(s) : null;
      if (c) n.add(c);
    }
    let o = (s) => {
        if ((s.textContent ?? "").length > 80) return;
        let c = yo(s);
        if (!c || n.has(c)) return;
        n.add(c), t(c);
      },
      i = e.defaultView,
      r = i?.MutationObserver ?? globalThis.MutationObserver;
    if (!r) return () => {};
    let l = new r((s) => {
      for (let c of s)
        for (let d of c.addedNodes) {
          if (!(d instanceof (i?.Element ?? Element))) continue;
          let p = d;
          if ((o(p), (p.textContent ?? "").length <= 400))
            for (let h of p.querySelectorAll("div, li, p")) o(h);
        }
    });
    return (
      l.observe(e.body, { childList: !0, subtree: !0 }), () => l.disconnect()
    );
  }
  async function Ao(e, t, { timeoutMs: n = 4000, pollMs: o = 120 } = {}) {
    let i = t.trim();
    if (!i) return !1;
    let l = [...e.querySelectorAll("div")]
      .filter((p) => (p.textContent ?? "").includes(i))
      .at(-1);
    if (!l) return !1;
    let s = e.defaultView;
    for (let p of [
      "pointerover",
      "pointerenter",
      "mouseover",
      "mouseenter",
      "mousemove",
    ])
      try {
        let h = s?.PointerEvent,
          g = s?.MouseEvent ?? MouseEvent;
        l.dispatchEvent(
          p.startsWith("pointer") && h
            ? new h(p, { bubbles: !0, pointerType: "mouse", isPrimary: !0 })
            : new g(p, { bubbles: !0 }),
        );
      } catch {}
    let c = Date.now() + n,
      d = null;
    while (Date.now() < c && !d)
      if (
        ((d =
          l
            .querySelector("svg.arco-icon-more")
            ?.closest("button, div[role=button]") ?? null),
        !d)
      )
        await new Promise((p) => setTimeout(p, o));
    if (!d) return !1;
    d.click();
    while (Date.now() < c) {
      let p = [...e.querySelectorAll("[role=menuitem]")].find((h) =>
        /^bloquear\b/i.test((h.textContent ?? "").trim()),
      );
      if (p) return p.click(), !0;
      await new Promise((h) => setTimeout(h, o));
    }
    return e.body.click(), !1;
  }
  var ra = (e) =>
      e
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim(),
    aa =
      /\b(foi|has been|was|esta|is)\s+(restringid\w*|restrit\w*|suspens\w*|restricted|suspended|removed|banned|encerrad\w*|ended)\b|live (foi )?encerrada|live (has been |was )?ended|conta (foi )?(restringida|suspensa|bloqueada)/,
    sa =
      /lembrete|reminder|interacao em tempo real|real-time (verbal )?interaction/,
    la = /\b(advertencia|warning|penalt\w*|penalidade\w*|pontos?|points?)\b/;
  function qt(e) {
    let t = ra(e);
    if (aa.test(t)) return 3;
    if (la.test(t)) return 2;
    if (sa.test(t)) return 1;
    return 2;
  }
  var Ne =
      '.arco-notification, .arco-message, .arco-alert, .arco-modal, .m4b-alert, .m4b-message, .m4b-notification, [class*="toast" i], [class*="banner" i], [class*="violation" i]',
    ca = [
      /diretrizes da comunidade|community guidelines/,
      /\b(foi|has been|was|esta|is)\s+(restringid\w*|restrit\w*|suspens\w*|restricted|suspended|removed|banned|encerrad\w* por)/,
      /\b(violat\w*|violac\w*|violou|violar)\b/,
      /conteudo nao original|unoriginal content/,
      /conteudo (nao original|reproduzido|nao envolvente|de baixa qualidade)|non-?engaging|reproduced content|low[- ]quality live/,
      /lembrete de conteudo|content reminder|interacao em tempo real|real-time (verbal )?interaction/,
      /\b(advertencia|warning)\s*:/,
      /\b(penalt\w*|penalidade\w*)\b/,
    ],
    Lo = [];
  function Co(e) {
    Lo = e.flatMap((t) => {
      try {
        return [new RegExp(t)];
      } catch {
        return [];
      }
    });
  }
  function ua(e) {
    if (e.length > 600) return !1;
    let t = R(e);
    if (
      /^(lembrete de violacao|historico de violacoes|violation reminder|violation history)[:\s]*$/.test(
        t,
      )
    )
      return !1;
    return ca.some((n) => n.test(t)) || Lo.some((n) => n.test(t));
  }
  function Ft(e) {
    let t = e.closest(Ne);
    if (!t) return null;
    for (let o = t; o; o = o.parentElement) {
      if (o.hasAttribute("hidden") || o.getAttribute("aria-hidden") === "true")
        return null;
      let i = o.ownerDocument.defaultView?.getComputedStyle(o);
      if (i?.display === "none" || i?.visibility === "hidden") return null;
    }
    let n = (t.textContent ?? "").trim();
    return ua(n) ? ha(n) : null;
  }
  var da =
      /ajude-nos a melhorar|help us improve|as informa[çc][õo]es sobre a viola[çc][ãa]o|is the information about the violation/i,
    pa =
      "Aviso de violação na tela (o motivo fica em Saúde da conta, no TikTok)";
  function ha(e) {
    let t = e.search(da),
      n = (t < 0 ? e : e.slice(0, t)).replace(/[*\s]+$/, "").trim();
    return n.length >= 8 ? n : pa;
  }
  var Mo = new Set([
    "itens vendidos",
    "items sold",
    "pedidos pagos",
    "paid orders",
    "unidades vendidas",
  ]);
  function zt(e) {
    let t = e.match(/\d{1,3}(?:[.,]\d{3})+|\d+/);
    return t ? Number(t[0].replace(/[.,]/g, "")) : null;
  }
  var ma = new Set([
      "vendas",
      "pedidos",
      "pedidos pagos",
      "paid orders",
      "orders",
      "total de pedidos",
    ]),
    fa = new Set([
      "faturamento",
      "faturamento (gmv)",
      "receita",
      "receita (gmv)",
      "gmv",
      "revenue",
      "receita total",
      "vendas (gmv)",
    ]);
  function ga(e) {
    let t = e.match(/-?[\d.,]*\d/);
    if (!t) return null;
    let n = t[0],
      o = n.lastIndexOf(","),
      i = n.lastIndexOf("."),
      r = Math.max(o, i),
      l = r >= 0 && n.length - r - 1 === 2,
      s = l ? n.slice(0, r) : n,
      c = l ? n.slice(r + 1) : "00",
      d = s.replace(/[.,]/g, "");
    if (!d) return null;
    return Number(d) * 100 + Number(c);
  }
  function Po(e) {
    let t = { items: null, orders: null, gmvCents: null };
    for (let n of e.querySelectorAll("span, div, p, dt, dd")) {
      if (n.children.length) continue;
      let o = n.textContent ?? "";
      if (o.length > 48) continue;
      let i = R(o),
        r = [];
      if (t.items === null && Mo.has(i)) r.push(["items", zt]);
      if (t.orders === null && ma.has(i)) r.push(["orders", zt]);
      if (t.gmvCents === null && fa.has(i)) r.push(["gmvCents", ga]);
      if (!r.length || !n.parentElement) continue;
      let l = (n.parentElement.textContent ?? "").replace(o, " ");
      for (let [s, c] of r) t[s] = c(l);
      if (t.items !== null && t.orders !== null && t.gmvCents !== null) break;
    }
    return t;
  }
  function Ro(e) {
    if (!e.gmvCents || !e.orders) return null;
    return Math.round(e.gmvCents / e.orders);
  }
  function Oo(e) {
    for (let t of e.querySelectorAll("span, div, p, dt, dd")) {
      if (t.children.length || !Mo.has(R(t.textContent ?? ""))) continue;
      let n = t.parentElement;
      if (!n) continue;
      let o = t.textContent ?? "",
        i = zt((n.textContent ?? "").replace(o, " "));
      if (i !== null) return i;
    }
    return null;
  }
  var Ht = [
      "iniciar live",
      "iniciar live agora",
      "go live",
      "go live now",
      "start live",
      "start live now",
      "comecar live",
    ],
    va = new Set([
      "iniciar",
      "iniciar live",
      "comecar",
      "confirmar",
      "confirm",
      "go live",
      "start",
    ]),
    ba = /^\d{1,2}:\d{2}:\d{2}$/;
  function se(e) {
    let t = e.querySelector("svg.arco-icon-im_close_chat");
    if (t) {
      let o = t;
      for (let i = 0; o && i < 5; i++, o = o.parentElement)
        if (
          [...o.querySelectorAll("span, div, p")].some(
            (l) =>
              l.children.length === 0 && ba.test((l.textContent ?? "").trim()),
          )
        )
          return "on";
    }
    return [...e.querySelectorAll("button, div[role=button]")].some((o) =>
      Ht.includes(R(o.textContent ?? "")),
    )
      ? "off"
      : "unknown";
  }
  var wa = /sem feed de video|no video feed|sem sinal de video/,
    _e = (e) =>
      e.disabled ||
      e.getAttribute("aria-disabled") === "true" ||
      e.classList.contains("arco-btn-disabled") ||
      e.closest("[aria-disabled=true]") !== null;
  function Ut(e) {
    let t = [...e.querySelectorAll("button, div[role=button]")].filter((i) =>
        Ht.includes(R(i.textContent ?? "")),
      ),
      n = t.find((i) => !_e(i)) ?? t[0];
    if (!n) return { ok: !1, why: "no_button" };
    let o = n.closest("section, div");
    if (o && wa.test(R(o.textContent ?? ""))) return { ok: !1, why: "no_feed" };
    if (!_e(n)) return { ok: !0 };
    return { ok: !1, why: "disabled" };
  }
  async function Bt(
    e,
    { timeoutMs: t = 6000, pollMs: n = 120, shouldContinue: o = () => !0 } = {},
  ) {
    if (!o() || se(e) === "on") return !1;
    if (!Ut(e).ok) return !1;
    let i = [...e.querySelectorAll("button, div[role=button]")]
      .filter((s) => Ht.includes(R(s.textContent ?? "")))
      .find((s) => !_e(s));
    if (!i) return !1;
    i.click();
    let r = Date.now() + t,
      l = !1;
    while (Date.now() < r) {
      if (!o()) return !1;
      if (se(e) === "on") return !0;
      let s = e.querySelector(".arco-modal, [role=dialog]");
      if (s && !l) {
        let c =
          [...s.querySelectorAll("button")].find((d) =>
            va.has(R(d.textContent ?? "")),
          ) ?? s.querySelector("button.arco-btn-primary");
        if (!c || _e(c)) return !1;
        (l = !0), c.click();
      }
      await new Promise((c) => setTimeout(c, n));
    }
    return !1;
  }
  var ya = [
      "encerrar live",
      "end live",
      "finalizar live",
      "encerrar transmissao",
      "encerrar a live",
    ],
    xa = (e) => ya.some((t) => e.includes(t)),
    ka = new Set([
      "encerrar",
      "end",
      "confirmar",
      "confirm",
      "finalizar",
      "sim",
    ]);
  async function $e(e, { timeoutMs: t = 6000, pollMs: n = 120 } = {}) {
    let i =
      e
        .querySelector("svg.arco-icon-im_close_chat")
        ?.closest(".cursor-pointer, button") ??
      [...e.querySelectorAll("button, div.cursor-pointer, [role=button]")].find(
        (s) => xa(R(s.textContent ?? "")),
      );
    if (!i) return !1;
    i.click();
    let r = Date.now() + t,
      l = !1;
    while (Date.now() < r) {
      if (se(e) === "off") return !0;
      let s = e.querySelector(".arco-modal, [role=dialog]");
      if (s && !l) {
        let c =
          [...s.querySelectorAll("button")].find((d) =>
            ka.has(R(d.textContent ?? "")),
          ) ?? s.querySelector("button.arco-btn-primary");
        if (!c || _e(c)) return !1;
        (l = !0), c.click();
      }
      await new Promise((c) => setTimeout(c, n));
    }
    return !1;
  }
  var _o = [
      ["calmo", "Calmo (2 a 5 min)"],
      ["normal", "Normal (1 a 2 min)"],
      ["animado", "Animado (30 a 60s)"],
    ],
    Io = {
      calmo: { min: 120, max: 300 },
      normal: { min: 60, max: 120 },
      animado: { min: 30, max: 60 },
    };
  function et(e) {
    return Io[e] ?? Io.normal;
  }
  var Do = [
    "IA",
    "I.A",
    "fake",
    "falso",
    "falsa",
    "robô",
    "bot",
    "golpe",
    "mentira",
  ];
  var tt = (e) => e.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    No = (e) => tt(e).toLowerCase();
  function qo(e, t, n = "") {
    return $o(e, t) ?? (n ? $o(n, t) : null);
  }
  function $o(e, t) {
    for (let n of t) {
      let o = n.trim();
      if (!o) continue;
      let i = o.length <= 2,
        r = i ? tt(e) : No(e),
        l = i ? tt(o) : No(o);
      if (!l) continue;
      if (
        new RegExp(
          `(^|[^\\p{L}\\p{N}])${l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`,
          "u",
        ).test(r)
      )
        return l;
    }
    return null;
  }
  function zo(e) {
    let t = new Map();
    for (let n of e.split(/[\n,;]+/)) {
      let o = tt(n).trim();
      if (!o) continue;
      let i = o.length <= 2 ? o : o.toLowerCase();
      if (!t.has(i)) t.set(i, i);
    }
    return [...t.values()];
  }
  var nt = {
      comments: !0,
      pin: !0,
      celebrate: !0,
      violation: "now",
      violationGrace: 5,
      endAfter: 0,
      relayAfter: 0,
      answer: !0,
      greet: !0,
      rotate: 0,
      pace: "normal",
      blockOn: !0,
      blockWords: Do.join(", "),
      mirror: !1,
      realClips: !0,
    },
    Sa = ["flashEvery", "flashFor"];
  function Fo(e) {
    let t = e && typeof e === "object" ? { ...e } : {};
    for (let n of Sa) delete t[n];
    return { ...nt, ...t };
  }
  var Ea = {
    time: "⚡ A oferta relâmpago terminou no horário: o cartão saiu da tela.",
    manual: "⚡ Oferta relâmpago tirada da tela.",
    product:
      "⚡ Oferta relâmpago tirada da tela: a live passou para outro produto.",
    stopped: "⚡ Oferta relâmpago tirada da tela com o fim da live.",
  };
  class Vt {
    hooks;
    runner = null;
    flash = null;
    timers = [];
    endTimer = null;
    endMinutes = 0;
    violationTimer = null;
    observer = null;
    lastSales = null;
    violationSeen = !1;
    plan = null;
    sales = 0;
    startedAt = 0;
    pinTitle = null;
    panel = { items: null, orders: null, gmvCents: null };
    constructor(e) {
      this.hooks = e;
    }
    lastStatus = null;
    get status() {
      return this.runner?.status() ?? this.lastStatus;
    }
    settings = nt;
    start(e, t) {
      this.stop(),
        (this.plan = e),
        (this.settings = t),
        (this.lastStatus = null),
        (this.startedAt = Date.now()),
        (this.sales = 0),
        (this.violationSeen = !1),
        (this.commentsPaused = !1),
        (this.panel = { items: null, orders: null, gmvCents: null }),
        (this.lastSales = Oo(document));
      let n = { ...e, commentEvery: et(t.pace) };
      if (
        ((this.runner = new Nt(n, {
          postComment: (o) => {
            let i = Ie(document, o);
            if (i.ok)
              this.hooks.onComment?.(o),
                this.hooks.log(`\uD83D\uDCAC Comentário: “${o}”`);
            else if (i.reason === "blocked") this.hooks.log(Oe(i.why, o));
            return i;
          },
          pinProduct: () => {
            let o = ye(document, this.pinTitle ?? e.product.title);
            if (o === "pinned") this.hooks.log("\uD83D\uDCCC Produto fixado");
            return o;
          },
          random: Math.random,
          now: Date.now,
          setTimer: (o, i) => window.setTimeout(o, i),
          clearTimer: (o) => window.clearTimeout(o),
        })),
        this.applyViolation(),
        this.violationSeen)
      )
        return;
      this.runner.start({ comments: t.comments, pin: t.pin }),
        this.timers.push(
          window.setInterval(() => {
            this.panel = Po(document);
            let o = this.panel.items;
            if (o === null) return;
            if (this.lastSales !== null && o > this.lastSales) {
              let i = o - this.lastSales;
              if (
                ((this.sales += i),
                this.hooks.log(
                  `\uD83C\uDF89 ${i === 1 ? "Nova venda" : `${i} novas vendas`} (total ${o})`,
                ),
                this.hooks.alert({
                  type: "sale",
                  count: this.sales,
                  product: e.product.title,
                }),
                this.settings.celebrate)
              )
                this.hooks.onSale();
            }
            this.lastSales = o;
          }, 5000),
        ),
        this.applyEndTimer(),
        (this.flash = this.offers(e));
    }
    update(e) {
      if (!this.runner || this.violationSeen) return;
      (this.settings = e),
        this.runner.configure({
          comments: !this.commentsPaused && e.comments,
          pin: e.pin,
          commentEvery: et(e.pace),
        }),
        this.applyViolation(),
        this.applyEndTimer();
    }
    applyViolation() {
      if (this.observer) return;
      let e = (t) => {
        let n = Ft(t);
        if (n) this.violation(n);
        if (!this.violationSeen)
          for (let o of t.querySelectorAll(Ne)) {
            let i = Ft(o);
            if (i) {
              this.violation(i);
              break;
            }
          }
      };
      (this.observer = new MutationObserver((t) => {
        if (this.violationSeen) return;
        for (let n of t) {
          let o =
            n.target instanceof Element ? n.target : n.target.parentElement;
          if (o && (n.type === "attributes" || o.closest(Ne))) e(o);
          for (let i of n.addedNodes) {
            let r = i instanceof Element ? i : i.parentElement;
            if (r) e(r);
            if (this.violationSeen) return;
          }
        }
      })),
        this.observer.observe(document.body, {
          childList: !0,
          characterData: !0,
          attributes: !0,
          attributeFilter: ["hidden", "aria-hidden", "style", "class"],
          subtree: !0,
        });
      for (let t of document.querySelectorAll(Ne))
        if ((e(t), this.violationSeen)) break;
    }
    violation(e) {
      if (!this.runner || this.violationSeen) return;
      this.violationSeen = !0;
      let t = qt(e);
      this.hooks.log(`⚠️ Aviso do TikTok (nível ${t}): “${e.slice(0, 140)}”`),
        this.hooks.alert({ type: "violation", text: e, level: t }),
        (this.lastStatus = this.runner.status()),
        this.runner.stop(),
        this.flash?.stop(),
        (this.violationTimer = window.setTimeout(
          () => void this.end("violation"),
          0,
        ));
    }
    applyEndTimer() {
      let e = this.settings.endAfter;
      if (e === this.endMinutes && (this.endTimer !== null) === e > 0) return;
      if (((this.endMinutes = e), this.endTimer !== null))
        window.clearTimeout(this.endTimer);
      if (((this.endTimer = null), e <= 0)) return;
      let t = this.startedAt + e * 60000 - Date.now();
      if (t < 60000)
        this.hooks.log("A live já passou desse tempo: encerro em 1 min.");
      this.endTimer = window.setTimeout(
        () => void this.end("timer"),
        Math.max(60000, t),
      );
    }
    offers(e) {
      return new Ot({
        onStart: (t) => {
          if (this.settings.pin) ye(document, this.pinTitle ?? e.product.title);
          this.hooks.log(
            t.endsAt
              ? `⚡ Oferta relâmpago do TikTok na tela até ${Xe(t.endsAt)}${t.price ? `, por ${t.price}` : ""}`
              : "⚡ Oferta relâmpago na tela.",
          ),
            this.hooks.alert({ type: "note", text: "Oferta relâmpago no ar" }),
            this.hooks.onFlash(t);
        },
        onEnd: (t) => {
          this.hooks.log(Ea[t]), this.hooks.onFlash(null);
        },
        now: Date.now,
        setTimer: (t, n) => window.setTimeout(t, n),
        clearTimer: (t) => window.clearTimeout(t),
      });
    }
    openFlash(e) {
      return this.flash?.open(e) ?? !1;
    }
    closeFlash(e = "manual") {
      this.flash?.close(e);
    }
    get flashSale() {
      return this.flash?.current ?? null;
    }
    async end(e) {
      if (this.settings.relayAfter && e === "timer") {
        this.hooks.onRelay("timer");
        return;
      }
      let t = !1;
      try {
        t = await $e(document);
      } catch {}
      this.hooks.log(
        t
          ? `⏹️ Live encerrada (${e === "timer" ? "timer" : "proteção contra violação"})`
          : "Não achei o botão de encerrar a live.",
      ),
        this.stop(),
        this.hooks.onEnded(e);
    }
    pauseComments(e) {
      this.commentsPaused = e;
      let t = this.settings;
      this.runner?.configure({
        comments: !e && t.comments,
        pin: t.pin,
        commentEvery: et(t.pace),
      });
    }
    commentsPaused = !1;
    stop() {
      if (this.runner) this.lastStatus = this.runner.status();
      if (
        (this.runner?.stop(),
        (this.runner = null),
        this.flash?.stop(),
        (this.flash = null),
        this.endTimer !== null)
      )
        window.clearTimeout(this.endTimer);
      if (this.violationTimer !== null)
        window.clearTimeout(this.violationTimer);
      (this.endTimer = this.violationTimer = null), (this.endMinutes = 0);
      for (let e of this.timers)
        window.clearTimeout(e), window.clearInterval(e);
      (this.timers = []), this.observer?.disconnect(), (this.observer = null);
    }
  }
  var Ho = 8;
  function Uo(e, t, n, o = 8) {
    let i = Math.max(o, n.width - t.width - o),
      r = Math.max(o, n.height - 168 - o),
      l = Math.max(o, Math.min(e.x, i)),
      s = Math.max(o, Math.min(e.y, r));
    return { x: l, y: s, maxHeight: Math.max(168, n.height - s - o) };
  }
  function Bo(e = Math.random) {
    return 0.96 + e() * 0.08499999999999996;
  }
  function Vo(e = Math.random) {
    return 1 + (e() * 2 - 1) * 0.07;
  }
  function ot(e, t, n = 1 / 0) {
    let o = Math.min(0.06, n / 4);
    if (e >= o) return t;
    return t * Math.max(0, e / o);
  }
  function Go(e, t) {
    if (!Number.isFinite(t) || t <= 0) return !1;
    let n = Math.min(0.09, t / 4);
    return e >= t - n;
  }
  function Wo(e, t, n) {
    if (!Number.isFinite(n) || n <= 0) return t;
    let o = Math.min(0.09, n / 4),
      i = n - e;
    if (i >= o) return t;
    return t * Math.max(0, i / o);
  }
  class it {
    count;
    random;
    queue = [];
    previous = [];
    constructor(e, t = Math.random) {
      this.count = e;
      this.random = t;
    }
    next(e) {
      if (this.count <= 1) return 0;
      if (!this.queue.length) this.queue = this.cycle();
      if (e !== void 0) {
        let t = this.queue.indexOf(e);
        if (t >= 0) this.queue.splice(t, 1), this.queue.unshift(e);
        else return e;
      }
      return this.queue.shift();
    }
    restore(e) {
      if (this.count > 1 && !this.queue.includes(e)) this.queue.unshift(e);
    }
    cycle() {
      let e = this.count,
        t = Math.min(2, Math.floor(e / 2)),
        n = this.previous.slice(-t),
        o = [];
      for (let i = 0; i < 64; i++) {
        let r = this.shuffle(),
          l = r.slice(0, t).some((c) => n.includes(c)),
          s = e >= 3 && r.every((c, d) => c === this.previous[d]);
        if (((o = r), !l && !s)) break;
      }
      return (this.previous = o), [...o];
    }
    shuffle() {
      let e = [...Array(this.count).keys()];
      for (let t = e.length - 1; t > 0; t--) {
        let n = Math.floor(this.random() * (t + 1));
        [e[t], e[n]] = [e[n], e[t]];
      }
      return e;
    }
  }
  function Ta() {
    try {
      let e = URL.createObjectURL(
          new Blob(
            [
              `let id = 0;
onmessage = (e) => {
  clearInterval(id);
  const ms = e.data && e.data.ms;
  if (ms > 0) id = setInterval(() => postMessage(1), ms);
};`,
            ],
            { type: "text/javascript" },
          ),
        ),
        t = new Worker(e);
      return URL.revokeObjectURL(e), t;
    } catch {
      return null;
    }
  }
  var Aa = () => ({
    hasBeenActive: () =>
      typeof navigator > "u"
        ? !0
        : (navigator.userActivation?.hasBeenActive ?? !0),
    onGesture: (e) => {
      let t = () => {
          n(), e();
        },
        n = () => {
          removeEventListener("pointerdown", t, !0),
            removeEventListener("keydown", t, !0);
        };
      return (
        addEventListener("pointerdown", t, !0),
        addEventListener("keydown", t, !0),
        n
      );
    },
  });
  function jo(
    e = () =>
      typeof AudioContext > "u"
        ? null
        : new AudioContext({ latencyHint: "playback" }),
    t = Aa(),
  ) {
    let n = null,
      o = null,
      i = 0,
      r = !0,
      l = null,
      s = null,
      c = () => {
        if (n || !r) return;
        try {
          n = e();
        } catch {
          n = null;
        }
        if (!n) return;
        (o = n.createGain()), (o.gain.value = 0), o.connect(n.destination), d();
      },
      d = () => {
        if (!r || !n || !o || i <= 0 || l) return;
        if (n.state === "suspended") n.resume().catch(() => {});
        let h = n.createConstantSource();
        (h.offset.value = 0),
          h.connect(o),
          (h.onended = () => {
            if ((h.disconnect(), l === h)) l = null;
            if (!r) return;
            p.onmessage?.(new MessageEvent("message", { data: 1 })), d();
          });
        let g = n.currentTime;
        h.start(g), h.stop(g + i / 1000), (l = h);
      },
      p = {
        onmessage: null,
        postMessage(h) {
          if (((i = h && h.ms > 0 ? h.ms : 0), n)) return d();
          if (t.hasBeenActive()) c();
          else s ??= t.onGesture(c);
        },
        terminate() {
          (r = !1),
            s?.(),
            l?.disconnect(),
            (l = null),
            n?.close().catch(() => {}),
            (n = null);
        },
      };
    return p;
  }
  function La(e = {}) {
    return {
      now: () => (typeof performance > "u" ? Date.now() : performance.now()),
      raf: (t) => requestAnimationFrame(t),
      cancelRaf: (t) => cancelAnimationFrame(t),
      setTimer: (t, n) => setInterval(t, n),
      clearTimer: (t) => clearInterval(t),
      worker: () => Ta(),
      hidden: () =>
        typeof document < "u" && document.visibilityState === "hidden",
      ...e,
    };
  }
  class Gt {
    s;
    interval;
    stallMs;
    draw = null;
    rafId = 0;
    timerId = 0;
    ticker = null;
    lastFrame = 0;
    lastRaf = 0;
    due = 0;
    running = !1;
    lastSource = "raf";
    rafAlive = !0;
    constructor(e = {}) {
      (this.interval = 1000 / (e.fps ?? 30)),
        (this.stallMs = e.stallMs ?? 400),
        (this.s = La(e.scheduler));
    }
    get source() {
      return this.lastSource;
    }
    get rescued() {
      return this.running && !this.rafAlive;
    }
    get fps() {
      return 1000 / this.interval;
    }
    setFps(e) {
      let t = 1000 / e;
      if (!(t > 0) || !Number.isFinite(t) || t === this.interval) return;
      if (((this.interval = t), !this.running)) return;
      this.ticker?.postMessage({ ms: this.interval }),
        this.s.clearTimer(this.timerId),
        (this.timerId = this.s.setTimer(
          () => this.backup("timer"),
          this.interval,
        ));
    }
    start(e) {
      if (this.running) return;
      if (
        ((this.running = !0),
        (this.draw = e),
        (this.rafAlive = !0),
        (this.lastFrame = this.lastRaf = this.s.now()),
        (this.due = 0),
        this.pump(),
        (this.ticker = this.s.worker()),
        this.ticker)
      )
        (this.ticker.onmessage = () => this.backup("worker")),
          this.ticker.postMessage({ ms: this.interval });
      this.timerId = this.s.setTimer(() => this.backup("timer"), this.interval);
    }
    stop() {
      (this.running = !1),
        (this.draw = null),
        this.s.cancelRaf(this.rafId),
        this.s.clearTimer(this.timerId),
        (this.rafId = this.timerId = 0),
        this.ticker?.terminate(),
        (this.ticker = null);
    }
    pump() {
      if (!this.running || this.rafId) return;
      this.rafId = this.s.raf(() => {
        if (((this.rafId = 0), !this.running)) return;
        this.onRaf(), this.pump();
      });
    }
    onRaf() {
      let e = this.s.now(),
        t = e - this.lastRaf;
      if (((this.lastRaf = e), !this.rafAlive && t > this.stallMs)) return;
      if (!this.rafAlive) this.due = 0;
      if (this.due && e + this.interval / 4 < this.due) return;
      let n = this.due + this.interval;
      (this.due = this.due && n > e ? n : e + this.interval), this.frame("raf");
    }
    backup(e) {
      if (!this.running) return;
      let t = this.s.now();
      if (this.rafAlive) {
        if (!this.s.hidden() && t - this.lastRaf < this.stallMs) return;
        this.rafAlive = !1;
      }
      if (t - this.lastFrame < this.interval * 0.9) return;
      this.frame(e), this.pump();
    }
    frame(e) {
      if (((this.lastFrame = this.s.now()), (this.lastSource = e), e === "raf"))
        this.rafAlive = !0;
      this.draw?.();
    }
  }
  function le(e, t, n, o) {
    return {
      amp: e * (o() * 2 - 1),
      period: t + o() * (n - t),
      phase: o() * Math.PI * 2,
    };
  }
  var Ca = (e, t) => e.amp * Math.sin((t / e.period) * Math.PI * 2 + e.phase),
    Ma = (e) => {
      let t = Math.max(0, Math.min(1, e));
      return t * t * (3 - 2 * t);
    };
  class rt {
    span;
    from;
    to;
    swayX;
    swayY;
    tilt;
    light;
    constructor(e = 8, t = Math.random) {
      this.span = e;
      let n = 1.03 + t() * 0.038000000000000055;
      (this.from = n),
        (this.to = t() < 0.5 ? n + 0.022 : Math.max(1.03, n - 0.022)),
        (this.swayX = [le(5.58, 5.5, 9, t), le(3.42, 2.3, 3.9, t)]),
        (this.swayY = [le(5.58, 6.5, 11, t), le(3.42, 2.7, 4.4, t)]),
        (this.tilt = le(0.22, 7, 13, t)),
        (this.light = [le(0.0196, 9, 17, t), le(0.0084, 3.1, 5.3, t)]);
    }
    at(e) {
      let t = Math.max(0, e),
        n = (o) => o.reduce((i, r) => i + Ca(r, t), 0);
      return {
        zoom: this.from + (this.to - this.from) * Ma(t / this.span),
        dx: n(this.swayX),
        dy: n(this.swayY),
        tilt: (n([this.tilt]) * Math.PI) / 180,
        exposure: n(this.light),
      };
    }
  }
  var Pa = 0.17,
    Wt = 48,
    Ra = 28,
    Ko = 260,
    Oa = 0.68,
    Ia = {
      voice: "Voz gerada por IA",
      images: "Imagens geradas por IA",
      "voice-and-images": "Voz e imagens geradas por IA",
    };
  function Xo(e) {
    if (!e.on) return "none";
    if (e.realFootage) return e.voiceOnAir ? "voice" : "none";
    return e.voiceOnAir ? "voice-and-images" : "images";
  }
  var Qo = (e) => 1 - Math.pow(1 - Math.max(0, Math.min(1, e)), 3);
  function _a(e) {
    let t = Math.max(0, Math.ceil(e / 1000));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  }
  function Na(e, t, n) {
    if (e.measureText(t).width <= n) return t;
    let o = t.split(/\s+/),
      i = "";
    for (let r of o) {
      let l = i ? `${i} ${r}` : r;
      if (e.measureText(`${l}…`).width > n) break;
      i = l;
    }
    if (!i) {
      i = t;
      while (i.length > 1 && e.measureText(`${i}…`).width > n)
        i = i.slice(0, -1);
    }
    return `${i}…`;
  }
  class jt {
    now;
    content = {};
    shownAt = 0;
    hiddenAt = 0;
    visible = !1;
    disclosed = "none";
    offerFrom = 0;
    fitted = { title: "", width: 0, text: "" };
    note;
    constructor(e = () => Date.now()) {
      this.now = e;
    }
    set(e) {
      let t = Boolean(e.title?.trim()) && !Ze(e.title);
      if (t && !this.visible) this.shownAt = this.now();
      if (!t && this.visible) this.hiddenAt = this.now();
      if (e.until !== this.content.until) this.offerFrom = this.now();
      (this.visible = t),
        (this.content = e),
        (this.note = e.note && !Ze(e.note) ? e.note : void 0);
    }
    get shown() {
      return this.visible;
    }
    setDisclosure(e) {
      this.disclosed = e;
    }
    get disclosure() {
      return this.disclosed;
    }
    progress() {
      let e = this.now();
      if (this.visible) return Qo((e - this.shownAt) / Ko);
      return 1 - Qo((e - this.hiddenAt) / Ko);
    }
    draw(e, t, n) {
      if (this.disclosed !== "none") $a(e, t, n, Ia[this.disclosed]);
      let o = this.progress();
      if (o <= 0.002) return;
      let { title: i, until: r } = this.content,
        l = this.note;
      if (!i) return;
      let s = r !== void 0 ? r - this.now() : 0,
        c = r !== void 0 && s > 0,
        d =
          c && this.content.offerPrice
            ? this.content.offerPrice
            : this.content.price;
      e.save(), (e.globalAlpha = o), e.translate(0, (1 - o) * 18);
      let p = Wt,
        h = n * Pa,
        g = t - Wt * 2,
        P = 96 + ((d ? 1 : 0) + (l || c ? 1 : 0)) * 58 + (c ? 18 : 0);
      if (
        ((e.fillStyle = "rgba(12, 12, 12, 0.72)"),
        at(e, p, h, g, P, Ra),
        e.fill(),
        (e.textBaseline = "top"),
        (e.fillStyle = "#fff"),
        (e.font =
          "600 42px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"),
        this.fitted.title !== i || this.fitted.width !== g)
      )
        this.fitted = { title: i, width: g, text: Na(e, i.trim(), g - 72) };
      e.fillText(this.fitted.text, p + 36, h + 32);
      let L = h + 92;
      if (d)
        (e.fillStyle = "oklch(0.86 0.19 128)"),
          (e.font =
            "800 54px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"),
          e.fillText(d, p + 36, L),
          (L += 62);
      if (c || l)
        (e.fillStyle = c ? "oklch(0.83 0.15 80)" : "rgba(255,255,255,0.72)"),
          (e.font =
            "600 34px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"),
          e.fillText(
            c ? `${l || "Oferta relâmpago"} · ${_a(s)}` : l,
            p + 36,
            L,
          ),
          (L += 46);
      if (c && this.content.until) {
        let X = Math.max(1, this.content.until - this.offerFrom),
          T = Math.max(0, Math.min(1, s / X)),
          S = g - 72;
        (e.fillStyle = "rgba(255,255,255,0.16)"),
          at(e, p + 36, L, S, 8, 4),
          e.fill(),
          (e.fillStyle = "oklch(0.83 0.15 80)"),
          at(e, p + 36, L, S * T, 8, 4),
          e.fill();
      }
      e.restore();
    }
  }
  function $a(e, t, n, o) {
    e.save(),
      (e.font =
        "600 26px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif");
    let r = e.measureText(o).width + 40,
      l = 44,
      s = t - Wt - r,
      c = n * Oa;
    (e.fillStyle = "rgba(12, 12, 12, 0.55)"),
      at(e, s, c, r, l, 12),
      e.fill(),
      (e.textBaseline = "top"),
      (e.fillStyle = "rgba(255,255,255,0.78)"),
      e.fillText(o, s + 20, c + 10),
      e.restore();
  }
  function at(e, t, n, o, i, r) {
    if ((e.beginPath(), typeof e.roundRect === "function"))
      e.roundRect(t, n, o, i, r);
    else {
      let l = Math.min(r, o / 2, i / 2);
      e.moveTo(t + l, n),
        e.arcTo(t + o, n, t + o, n + i, l),
        e.arcTo(t + o, n + i, t, n + i, l),
        e.arcTo(t, n + i, t, n, l),
        e.arcTo(t, n, t + o, n, l),
        e.closePath();
    }
  }
  var Kt = 1080,
    Da = 1920,
    qa = 0.55,
    za = 2,
    Fa = 0.7,
    Ha = 0.6,
    Ua = 4,
    Ba = 0.28,
    Zo = 0.5,
    Va = 6,
    Yo = 360,
    Jo = 640,
    Ga = 0.03,
    ti = [
      { width: 1080, height: 1920, fps: 30, grain: !0, exposure: !0 },
      { width: 1080, height: 1920, fps: 30, grain: !1, exposure: !1 },
      { width: 720, height: 1280, fps: 30, grain: !1, exposure: !1 },
      { width: 720, height: 1280, fps: 24, grain: !1, exposure: !1 },
      { width: 540, height: 960, fps: 24, grain: !1, exposure: !1 },
    ],
    Qt = 2,
    ei = 3000,
    Wa = 0.8,
    ja = 2,
    st = () => (typeof performance > "u" ? Date.now() : performance.now());
  class Xt {
    canvas;
    ctx;
    clock;
    random;
    mirror;
    urls = [];
    owned = [];
    shuffler = new it(0);
    preferred = null;
    focusClip(e) {
      if (!Number.isInteger(e) || e < 0 || e >= this.urls.length) return !1;
      if (((this.preferred = e), this.next))
        this.shuffler.restore(this.next.index),
          ce(this.next.video),
          (this.next = null);
      return !0;
    }
    current = null;
    next = null;
    grain = [];
    grainAt = 0;
    tier;
    host = null;
    background = null;
    backgroundUrl = null;
    pendingTier = null;
    floor;
    onQuality;
    window = { start: 0, frames: 0 };
    strikes = 0;
    settleUntil = 0;
    time;
    overlay = new jt();
    constructor(e, t = {}) {
      this.canvas = e;
      this.tier = lt(t.quality ?? 0);
      let n = t.adaptive ?? !1;
      (this.floor = n
        ? lt(typeof n === "object" ? (n.floor ?? De) : De)
        : this.tier),
        (this.onQuality = t.onQuality),
        (this.time = t.scheduler?.now ?? st);
      let o = this.quality;
      if (
        ((e.width = o.width),
        (e.height = o.height),
        (this.ctx = e.getContext("2d")),
        (this.ctx.fillStyle = "#000"),
        this.ctx.fillRect(0, 0, o.width, o.height),
        (this.random = t.random ?? Math.random),
        (this.mirror = t.mirror ?? !1),
        (this.clock = new Gt({ fps: t.fps ?? o.fps, scheduler: t.scheduler })),
        (t.grain ?? !0) && o.grain)
      )
        this.grain = Ka(this.random);
    }
    get qualityTier() {
      return this.tier;
    }
    get quality() {
      return ti[this.tier];
    }
    setQuality(e, t = {}) {
      let n = lt(e),
        o = t.adaptive ?? !1;
      if (
        ((this.floor = o
          ? lt(typeof o === "object" ? (o.floor ?? De) : De)
          : n),
        (this.strikes = 0),
        (this.window = { start: 0, frames: 0 }),
        this.current)
      )
        this.pendingTier = n;
      else this.applyTier(n);
    }
    get clipCount() {
      return this.urls.length;
    }
    get clockSource() {
      return this.clock.source;
    }
    show(e) {
      this.overlay.set(e);
    }
    setDisclosure(e) {
      this.overlay.setDisclosure(e);
    }
    setMirror(e) {
      this.mirror = e;
    }
    setHost(e) {
      this.host = e;
    }
    setBackgroundUrl(e) {
      if (this.background) ce(this.background);
      if (((this.background = null), (this.backgroundUrl = e), this.current))
        this.startBackground();
    }
    startBackground() {
      if (!this.backgroundUrl || this.background) return;
      let e = document.createElement("video");
      (e.muted = !0),
        (e.playsInline = !0),
        (e.loop = !0),
        (e.src = this.backgroundUrl),
        (this.background = e),
        e.play().catch(() => {});
    }
    get hosting() {
      return this.hostBandHeight(this.quality) > 0;
    }
    hostBandHeight(e) {
      let t = this.host;
      if (!t || t.readyState < 2 || !t.videoWidth) return 0;
      return Math.round(e.height * qa);
    }
    setClipBlobs(e) {
      let t = e.map((n) => URL.createObjectURL(n));
      this.setClipUrls(t), (this.owned = t);
    }
    setClipUrls(e) {
      for (let t of [this.current, this.next]) if (t) ce(t.video);
      for (let t of this.owned) URL.revokeObjectURL(t);
      if (
        ((this.owned = []),
        (this.urls = e),
        (this.preferred = null),
        (this.shuffler = new it(this.urls.length, this.random)),
        (this.current = this.next = null),
        this.clock.stop(),
        !this.urls.length)
      ) {
        if (this.background) ce(this.background);
        this.background = null;
        return;
      }
      (this.current = this.load()),
        this.startBackground(),
        this.clock.start(() => this.draw());
    }
    stop() {
      if ((this.clock.stop(), this.background)) ce(this.background);
      this.background = null;
      for (let e of [this.current, this.next]) if (e) ce(e.video);
      this.current = this.next = null;
      for (let e of this.owned) URL.revokeObjectURL(e);
      (this.owned = []), (this.urls = []);
    }
    load() {
      let e = document.createElement("video");
      (e.muted = !0), (e.playsInline = !0);
      let t = this.shuffler.next(this.preferred ?? void 0);
      (this.preferred = null),
        (e.src = this.urls[t]),
        (e.playbackRate = 0.97 + this.random() * 0.06);
      let n = {
        index: t,
        video: e,
        motion: new rt(void 0, this.random),
        since: st(),
        outAt: 1 / 0,
        passes: this.random() < Ba ? 2 : 1,
        mirrored: this.mirror && this.random() < Zo,
      };
      return (
        (e.onloadedmetadata = () => this.enter(n)), e.play().catch(() => {}), n
      );
    }
    enter(e) {
      let t = e.video.duration,
        n = Number.isFinite(t) && t > Ua,
        o = n ? this.random() * Fa : 0;
      if (
        ((e.outAt = n ? t - this.random() * Ha : 1 / 0),
        (e.motion = new rt(Number.isFinite(t) ? t : void 0, this.random)),
        (e.since = st()),
        (e.mirrored = this.mirror && this.random() < Zo),
        o > 0)
      )
        try {
          e.video.currentTime = o;
        } catch {}
      e.video.play().catch(() => {});
    }
    done(e) {
      return e.video.ended || e.video.currentTime >= e.outAt;
    }
    spent(e) {
      return this.done(e) && e.passes <= 1;
    }
    paint(e) {
      let t = e.video;
      if (t.readyState < 2 || !t.videoWidth) return;
      let n = this.quality,
        o = this.hostBandHeight(n),
        i = n.height - o,
        r = e.motion.at((st() - e.since) / 1000),
        l = Math.max(n.width / t.videoWidth, i / t.videoHeight) * r.zoom,
        s = t.videoWidth * l,
        c = t.videoHeight * l,
        d = n.width / Kt,
        p = this.background,
        h = 1;
      if (p && p.readyState >= 2 && p.videoWidth) {
        let y = (this.time() / 1000) % 12,
          P = y < 4 ? Math.sin((Math.PI * y) / 4) ** 2 : 0;
        if (P > 0) {
          let L = Math.max(n.width / p.videoWidth, i / p.videoHeight),
            X = p.videoWidth * L,
            T = p.videoHeight * L;
          this.ctx.drawImage(p, (n.width - X) / 2, o + (i - T) / 2, X, T),
            (h = 1 - 0.02 * P);
        }
      }
      if (
        (this.ctx.save(),
        (this.ctx.globalAlpha = h),
        this.ctx.translate(n.width / 2 + r.dx * d, o + i / 2 + r.dy * d),
        this.ctx.rotate(r.tilt),
        e.mirrored)
      )
        this.ctx.scale(-1, 1);
      if (
        (this.ctx.drawImage(t, -s / 2, -c / 2, s, c),
        this.ctx.restore(),
        (this.ctx.globalAlpha = 1),
        n.exposure && Math.abs(r.exposure) > 0.002)
      )
        (this.ctx.globalAlpha = Math.min(0.05, Math.abs(r.exposure))),
          (this.ctx.fillStyle = r.exposure > 0 ? "#fff" : "#000"),
          this.ctx.fillRect(0, o, n.width, i),
          (this.ctx.globalAlpha = 1);
      let g = this.host;
      if (g && o > 0) {
        let y = Math.max(n.width / g.videoWidth, o / g.videoHeight),
          P = g.videoWidth * y,
          L = g.videoHeight * y;
        this.ctx.drawImage(g, (n.width - P) / 2, (o - L) / 2, P, L);
      }
      if (n.grain && this.grain.length)
        (this.grainAt =
          (this.grainAt + 1 + Math.floor(this.random() * 2)) %
          this.grain.length),
          (this.ctx.globalAlpha = Ga),
          this.ctx.drawImage(this.grain[this.grainAt], 0, 0, n.width, n.height),
          (this.ctx.globalAlpha = 1);
    }
    applyTier(e) {
      if (
        ((this.pendingTier = null),
        e === this.tier && this.canvas.width === this.quality.width)
      )
        return;
      this.tier = e;
      let t = this.quality;
      (this.canvas.width = t.width),
        (this.canvas.height = t.height),
        (this.ctx.fillStyle = "#000"),
        this.ctx.fillRect(0, 0, t.width, t.height),
        this.clock.setFps(t.fps),
        (this.settleUntil = this.time() + ei),
        this.onQuality?.(e, t);
    }
    govern() {
      if (this.tier >= this.floor || this.clock.source === "timer") {
        this.window = { start: 0, frames: 0 };
        return;
      }
      let e = this.time();
      if (!this.window.start) {
        this.window = { start: e, frames: 0 };
        return;
      }
      this.window.frames++;
      let t = e - this.window.start;
      if (t < ei) return;
      let n = (this.window.frames * 1000) / t;
      if (((this.window = { start: e, frames: 0 }), e < this.settleUntil))
        return;
      if (
        ((this.strikes = n < this.quality.fps * Wa ? this.strikes + 1 : 0),
        this.strikes < ja)
      )
        return;
      (this.strikes = 0), (this.pendingTier = this.tier + 1);
    }
    draw() {
      if (this.pendingTier !== null) this.applyTier(this.pendingTier);
      this.govern();
      let e = this.current;
      if (e) {
        let i = e.passes > 1 ? 1 / 0 : e.outAt - e.video.currentTime;
        if (this.urls.length > 1 && !this.next && Number.isFinite(i) && i < za)
          this.next = this.load();
        if (e.passes > 1 && this.done(e)) e.passes--, this.enter(e);
        if (this.spent(e))
          if (
            this.next &&
            this.next.video.readyState >= 2 &&
            this.next.video.videoWidth
          )
            ce(e.video), (this.current = this.next), (this.next = null);
          else this.enter(e);
        this.paint(this.current ?? e);
      }
      let t = this.quality.width / Kt,
        n = this.hostBandHeight(this.quality),
        o = n > 0 ? (this.quality.height - n) / t : Da;
      if ((this.ctx.save(), n > 0)) this.ctx.translate(0, n);
      if (t !== 1) this.ctx.scale(t, t);
      this.overlay.draw(this.ctx, Kt, o), this.ctx.restore();
    }
  }
  var De = ti.length - 1,
    lt = (e) => Math.max(0, Math.min(De, Math.floor(e) || 0));
  function ce(e) {
    (e.onloadedmetadata = null), e.removeAttribute("src");
    try {
      e.pause(), e.load();
    } catch {}
  }
  function Ka(e) {
    try {
      return Array.from({ length: Va }, () => {
        let t = document.createElement("canvas");
        (t.width = Yo), (t.height = Jo);
        let n = t.getContext("2d");
        if (!n) throw Error("no context");
        let o = n.createImageData(Yo, Jo),
          i = o.data;
        for (let r = 0; r < i.length; r += 4) {
          let l = e() < 0.5 ? 0 : 255;
          (i[r] = i[r + 1] = i[r + 2] = l), (i[r + 3] = Math.floor(e() * 256));
        }
        return n.putImageData(o, 0, 0), t;
      });
    } catch {
      return [];
    }
  }
  class Zt {
    load;
    parallel;
    urls = new Map();
    queue = [];
    active = 0;
    constructor(e, t = 3) {
      this.load = e;
      this.parallel = t;
    }
    warm(e) {
      for (let t of e)
        if (!this.urls.has(t) && !this.queue.includes(t)) this.queue.push(t);
      this.pump();
    }
    get(e) {
      let t = this.queue.indexOf(e);
      if (t >= 0) this.queue.splice(t, 1);
      return this.urls.get(e) ?? this.fetch(e);
    }
    fetch(e) {
      let t = this.load(e);
      return this.urls.set(e, t), t.catch(() => this.urls.delete(e)), t;
    }
    pump() {
      while (this.active < this.parallel && this.queue.length) {
        let e = this.queue.shift();
        this.active++,
          this.fetch(e)
            .catch(() => {})
            .finally(() => {
              this.active--, this.pump();
            });
      }
    }
  }
  var ct = new Set(["cta", "howto", "urgency"]),
    Yt = new Set(["celebration", "greet_user"]);
  class Jt {
    product;
    shared;
    random;
    blockLength;
    all;
    position = 0;
    blockSize;
    sinceCta = 0;
    lastWasCta = !1;
    played = new Map();
    count = 0;
    lastId = null;
    lastInterjected = new Map();
    constructor(e, t, n = {}) {
      this.product = e;
      this.shared = t;
      (this.random = n.random ?? Math.random),
        (this.blockLength = n.blockLength ?? 12),
        (this.all = [...e, ...t]),
        (this.blockSize = this.drawBlock());
    }
    next() {
      let e = this.position === 0,
        t = this.position === this.blockSize - 1,
        n = this.sinceCta >= 4 && !this.lastWasCta,
        o;
      if (e)
        o =
          this.pick(
            this.product.filter((i) => i.kind === "hook"),
            [],
          ) ??
          this.pick(
            [],
            this.shared.filter((i) => i.kind === "greeting"),
          );
      else if (n) o = this.pickSplit((i) => ct.has(i.kind));
      else if (t)
        o = this.pick(
          [],
          this.shared.filter((i) => i.onlyAt === "block_close"),
        );
      if (
        ((o ??= this.pickSplit(
          (i) =>
            !ct.has(i.kind) &&
            i.kind !== "hook" &&
            i.onlyAt !== "block_close" &&
            i.onlyAt !== "block_open",
        )),
        (o ??= this.pick(
          this.all.filter((i) => !Yt.has(i.kind)),
          [],
        )),
        this.position++,
        this.position >= this.blockSize)
      )
        (this.position = 0), (this.blockSize = this.drawBlock());
      return (
        this.record(o),
        (this.lastWasCta = ct.has(o.kind)),
        (this.sinceCta = this.lastWasCta ? 0 : this.sinceCta + 1),
        { line: o, gapMs: this.gapAfter(o) }
      );
    }
    drawBlock() {
      let e = Math.round(this.random() * 4) - 2;
      return Math.max(3, this.blockLength + e);
    }
    gapAfter(e) {
      if (this.random() < 0.11) return Math.round(2600 + this.random() * 1800);
      if (ct.has(e.kind) || e.onlyAt === "block_close")
        return Math.round(1100 + this.random() * 1300);
      return Math.round(450 + this.random() * 1000);
    }
    interject(e) {
      let t = this.shared.filter((r) => r.kind === e);
      if (!t.length) return null;
      let n = this.lastInterjected.get(e),
        o = t.length > 1 ? t.filter((r) => r.id !== n) : t,
        i = o[Math.floor(this.random() * o.length)];
      return this.lastInterjected.set(e, i.id), i;
    }
    pickSplit(e) {
      let t = this.product.filter((o) => e(o) && !Yt.has(o.kind)),
        n = this.shared.filter((o) => e(o) && !Yt.has(o.kind));
      return this.random() < 0.4 ? this.pick(n, t) : this.pick(t, n);
    }
    pick(e, t) {
      for (let n of [e, t]) {
        let o = n.filter((i) => !this.recent(i));
        if (o.length) return this.stalest(o);
      }
      for (let n of [e, t]) {
        if (!n.length) continue;
        let o = n.length > 1 ? n.filter((i) => i.id !== this.lastId) : n;
        return this.stalest(o);
      }
      return;
    }
    stalest(e) {
      let t = e.filter((r) => !this.played.has(r.id));
      if (t.length) return t[Math.floor(this.random() * t.length)];
      let n = e.map((r) => this.played.get(r.id)).sort((r, l) => r - l),
        o = n[Math.floor((n.length - 1) / 3)],
        i = e.filter((r) => this.played.get(r.id) <= o);
      return i[Math.floor(this.random() * i.length)];
    }
    recent(e) {
      let t = this.played.get(e.id);
      return t !== void 0 && this.count - t <= (e.minGap ?? 6);
    }
    record(e) {
      this.played.set(e.id, this.count++), (this.lastId = e.id);
    }
  }
  function en(e, t = Math.random) {
    let n = 0;
    for (let o = 0; o < e.length; o++)
      (n = (n + 0.02 * (t() * 2 - 1)) / 1.02), (e[o] = n);
    return e;
  }
  function tn(e, t, n = 22050) {
    let o = Math.min(1, (2 * Math.PI * t) / n),
      i = 0;
    for (let r = 0; r < e.length; r++) (i += o * (e[r] - i)), (e[r] = i);
    return e;
  }
  function Qa(e, t = 2048) {
    let n = e.length;
    if (n < t * 2) return e;
    for (let o = 0; o < t; o++) {
      let i = o / t;
      e[o] = e[o] * i + e[n - t + o] * (1 - i);
    }
    return e.subarray(0, n - t);
  }
  function Xa(e = 12, t = Math.random) {
    let n = en(new Float32Array(Math.floor(22050 * e) + 2048), t),
      o = Qa(tn(n, 320)),
      i = 0;
    for (let s of o) i = Math.max(i, Math.abs(s));
    let r = i > 0 ? 0.08 / i : 0,
      l = new Int16Array(o.length);
    for (let s = 0; s < o.length; s++)
      l[s] = Math.round(Math.max(-1, Math.min(1, o[s] * r)) * 32767);
    return l;
  }
  function qe(e, t = 22050) {
    let n = new ArrayBuffer(44 + e.length * 2),
      o = new DataView(n),
      i = (r, l) => {
        for (let s = 0; s < l.length; s++) o.setUint8(r + s, l.charCodeAt(s));
      };
    return (
      i(0, "RIFF"),
      o.setUint32(4, 36 + e.length * 2, !0),
      i(8, "WAVEfmt "),
      o.setUint32(16, 16, !0),
      o.setUint16(20, 1, !0),
      o.setUint16(22, 1, !0),
      o.setUint32(24, t, !0),
      o.setUint32(28, t * 2, !0),
      o.setUint16(32, 2, !0),
      o.setUint16(34, 16, !0),
      i(36, "data"),
      o.setUint32(40, e.length * 2, !0),
      new Int16Array(n, 44).set(e),
      n
    );
  }
  function ni(e = 12) {
    return URL.createObjectURL(new Blob([qe(Xa(e))], { type: "audio/wav" }));
  }
  function oi(e, t) {
    let n =
      Math.sin(t / 47) * 0.5 +
      Math.sin(t / 113 + 2.1) * 0.3 +
      Math.sin(t / 19 + 4.7) * 0.2;
    return Math.max(0, e * (1 + n * 0.22));
  }
  var xe = 22050,
    Za = 0.16,
    Ya = { sale: 0.42 },
    ut = 0.006,
    nn = {
      arm: [
        { at: 0, ms: 90, hz: 587.33 },
        { at: 0.07, ms: 150, hz: 880 },
      ],
      start: [
        { at: 0, ms: 90, hz: 587.33 },
        { at: 0.07, ms: 110, hz: 880 },
        { at: 0.15, ms: 190, hz: 1174.66, gain: 0.7 },
      ],
      stop: [
        { at: 0, ms: 110, hz: 880 },
        { at: 0.08, ms: 180, hz: 587.33 },
      ],
      sale: [
        { at: 0, ms: 220, hz: 1046.5 },
        { at: 0, ms: 260, hz: 1568, gain: 0.55 },
        { at: 0.05, ms: 200, hz: 2093, gain: 0.25 },
      ],
      error: [{ at: 0, ms: 200, hz: 233.08, to: 185 }],
    };
  function Ja(e, t) {
    if (e < ut) return e / ut;
    let n = (e - ut) / Math.max(0.000001, t - ut);
    return Math.max(0, Math.exp(-4.2 * n) * (1 - n));
  }
  function es(e) {
    let t = nn[e],
      n = Math.max(...t.map((s) => s.at + s.ms / 1000)) + 0.02,
      o = new Float32Array(Math.ceil(xe * n));
    for (let s of t) {
      let c = s.ms / 1000,
        d = Math.floor(s.at * xe),
        p = Math.floor(c * xe),
        h = 0;
      for (let g = 0; g < p; g++) {
        let y = d + g;
        if (y >= o.length) break;
        let P = g / xe,
          L = s.to === void 0 ? s.hz : s.hz + (s.to - s.hz) * (P / c);
        (h += (L * 2 * Math.PI) / xe),
          (o[y] += Math.sin(h) * Ja(P, c) * (s.gain ?? 1));
      }
    }
    let i = 0;
    for (let s of o) i = Math.max(i, Math.abs(s));
    let r = i > 0 ? (Ya[e] ?? Za) / i : 0,
      l = new Int16Array(o.length);
    for (let s = 0; s < o.length; s++)
      l[s] = Math.round(Math.max(-1, Math.min(1, o[s] * r)) * 32767);
    return l;
  }
  function ii() {
    let e = {};
    for (let t of Object.keys(nn))
      e[t] = URL.createObjectURL(
        new Blob([qe(es(t), xe)], { type: "audio/wav" }),
      );
    return e;
  }
  var oc = Object.keys(nn);
  var ke = 22050,
    ri = { notification: 0.16, ring: 0.13, clink: 0.12, car: 0.1 },
    ai = {
      notification: "Notificação de celular",
      ring: "Telefone tocando",
      clink: "Copo na mesa",
      car: "Carro passando",
    },
    ze = Object.keys(ri),
    ts = (e, t, n = 0.005) => {
      if (e < n) return e / n;
      let o = (e - n) / Math.max(0.000001, t - n);
      return Math.max(0, Math.exp(-4 * o) * (1 - o));
    };
  function ue(e, t, n, o, i = 1, r = 0.005) {
    let l = n / 1000,
      s = Math.floor(t * ke),
      c = 0;
    for (let d = 0; d < Math.floor(l * ke); d++) {
      let p = s + d;
      if (p >= e.length) return;
      (c += (o * 2 * Math.PI) / ke),
        (e[p] += Math.sin(c) * ts(d / ke, l, r) * i);
    }
  }
  function dt(e, t, n) {
    let o = new Float32Array(Math.ceil(ke * e));
    t(o);
    let i = 0;
    for (let s of o) i = Math.max(i, Math.abs(s));
    let r = i > 0 ? n / i : 0,
      l = new Int16Array(o.length);
    for (let s = 0; s < o.length; s++)
      l[s] = Math.round(Math.max(-1, Math.min(1, o[s] * r)) * 32767);
    return l;
  }
  function ns(e, t = Math.random) {
    let n = ri[e];
    switch (e) {
      case "notification":
        return dt(
          0.7,
          (o) => {
            ue(o, 0, 110, 1318.51, 1),
              ue(o, 0.08, 130, 1760, 0.9),
              ue(o, 0.18, 320, 1318.51, 0.7);
          },
          n,
        );
      case "ring":
        return dt(
          2.6,
          (o) => {
            for (let i of [0, 1.4])
              for (let r = 0; r < 14; r++)
                ue(o, i + r * 0.05, 48, 425, 0.9, 0.004);
          },
          n,
        );
      case "clink":
        return dt(
          0.42,
          (o) => {
            ue(o, 0, 260, 2637, 1, 0.001),
              ue(o, 0, 200, 3950, 0.55, 0.001),
              ue(o, 0.004, 90, 1200, 0.3, 0.001);
          },
          n,
        );
      case "car":
        return dt(
          3.4,
          (o) => {
            let i = tn(en(new Float32Array(o.length), t), 260);
            for (let r = 0; r < o.length; r++) {
              let l = r / o.length,
                s = Math.sin(Math.PI * Math.pow(l, 0.85));
              o[r] = i[r] * s;
            }
          },
          n,
        );
    }
  }
  function on(e = Math.random) {
    let t = {};
    for (let n of ze)
      t[n] = URL.createObjectURL(
        new Blob([qe(ns(n, e), ke)], { type: "audio/wav" }),
      );
    return t;
  }
  class rn {
    everyMinutes;
    enabled;
    hooks;
    timer = 0;
    queue = [];
    random;
    constructor(e, t, n) {
      this.everyMinutes = e;
      this.enabled = t;
      this.hooks = n;
      this.random = n.random ?? Math.random;
    }
    start() {
      if ((this.stop(), this.everyMinutes <= 0 || !this.enabled.length)) return;
      this.next();
    }
    stop() {
      if (this.timer) this.hooks.clearTimer(this.timer);
      this.timer = 0;
    }
    next() {
      let t = this.everyMinutes * 60000 * (0.5 + this.random());
      this.timer = this.hooks.setTimer(() => {
        this.hooks.play(this.take()), this.next();
      }, Math.round(t));
    }
    take() {
      if (!this.queue.length) {
        let e = [...this.enabled];
        for (let t = e.length - 1; t > 0; t--) {
          let n = Math.floor(this.random() * (t + 1));
          [e[t], e[n]] = [e[n], e[t]];
        }
        this.queue = e;
      }
      return this.queue.shift();
    }
  }
  var C = {
      canvas: "zaalys-live-canvas",
      voice: "zaalys-live-voice",
      ambient: "zaalys-live-ambient",
      sfx: "zaalys-live-sfx",
      life: "zaalys-live-life",
      ui: "zaalys-live-ui",
    },
    sc = [C.voice, C.ambient, C.sfx, C.life],
    an = "__zaalysLive";
  function si(e, t) {
    return (
      (e.id = t),
      Object.assign(e.style, {
        position: "fixed",
        left: "0",
        bottom: "0",
        width: "2px",
        height: "2px",
        opacity: "0.01",
        pointerEvents: "none",
        zIndex: "-1",
      }),
      document.documentElement.append(e),
      e
    );
  }
  function os(e, t) {
    return (
      (e.id = t),
      (e.style.display = "none"),
      document.documentElement.append(e),
      e
    );
  }
  class sn {
    canvas = os(document.createElement("canvas"), C.canvas);
    onQuality = () => {};
    picture;
    halted = !1;
    constructor(e) {
      (this.picture = new Xt(this.canvas, {
        quality: e.tier,
        adaptive: e.adaptive,
        onQuality: (t, n) => this.onQuality(t, n),
        scheduler: { worker: () => jo() },
      })),
        li("video/background-motion.mp4")
          .then((t) => this.picture.setBackgroundUrl(t))
          .catch(() => {});
    }
    get clipCount() {
      return this.picture.clipCount;
    }
    get quality() {
      return this.picture.quality;
    }
    get qualityTier() {
      return this.picture.qualityTier;
    }
    setQuality(e) {
      this.picture.setQuality(e.tier, { adaptive: e.adaptive });
    }
    focusClip(e) {
      return !this.halted && this.picture.focusClip(e);
    }
    setClips(e) {
      if (this.halted) return;
      this.picture.setClipBlobs(e);
    }
    halt() {
      (this.halted = !0), this.picture.stop();
      let e = this.canvas.getContext("2d");
      if (e)
        (e.fillStyle = "#000"),
          e.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    show(e) {
      this.picture.show(e);
    }
    setMirror(e) {
      this.picture.setMirror(e);
    }
    setDisclosure(e) {
      this.picture.setDisclosure(e);
    }
  }
  class Fe {
    el;
    level;
    token = 0;
    trim = 1;
    duck = 1;
    shape = null;
    since = 0;
    settle = null;
    constructor(e, t) {
      (this.el = si(document.createElement("audio"), e)),
        (this.level = t),
        this.write(t);
    }
    set gain(e) {
      (this.level = e), this.write(e);
    }
    get gain() {
      return this.level;
    }
    setDuck(e) {
      (this.duck = Math.max(0, Math.min(1, e))), this.shape?.();
    }
    write(e) {
      this.el.dataset.gain = String(Number.isFinite(e) ? Math.max(0, e) : 0);
    }
    play(e, t = !1) {
      let n = ++this.token;
      this.settle?.(),
        (this.el.loop = t),
        (this.el.src = e),
        (this.trim = t ? 1 : Vo()),
        (this.el.playbackRate = t ? 1 : Bo()),
        (this.since = Date.now()),
        this.write(0);
      let o = () => {
        let { currentTime: i, duration: r } = this.el,
          l = (Date.now() - this.since) / 1000;
        if (t) return this.write(ot(l, oi(this.level, l)));
        let s = this.level * this.trim * this.duck;
        if (!Number.isFinite(r)) return this.write(ot(i, s));
        if (Go(i, r)) this.write(Wo(i, s, r));
        else this.write(ot(i, s, r));
      };
      return (
        (this.shape = t ? null : o),
        (this.el.ontimeupdate = o),
        new Promise((i) => {
          let r = () => {
            if (n === this.token)
              (this.el.ontimeupdate = null),
                (this.settle = null),
                (this.shape = null);
            i();
          };
          (this.settle = r),
            (this.el.onended = r),
            (this.el.onerror = r),
            this.el.play().then(o).catch(r);
        })
      );
    }
    async stop() {
      let e = this.token;
      if (
        ((this.el.ontimeupdate = null),
        (this.shape = null),
        this.write(0),
        await new Promise((t) => setTimeout(t, 140)),
        e !== this.token)
      )
        return;
      this.el.onended?.(new Event("ended")),
        this.el.pause(),
        this.el.removeAttribute("src"),
        this.write(this.level);
    }
  }
  class ln {
    level;
    el = si(document.createElement("audio"), C.ui);
    urls = null;
    enabled = !0;
    constructor(e = 0.35) {
      this.level = e;
      this.el.preload = "auto";
    }
    play(e) {
      if (!this.enabled) return;
      (this.urls ??= ii()),
        (this.el.volume = this.level),
        (this.el.src = this.urls[e]),
        this.el.play().catch(() => {});
    }
  }
  class cn {
    channel;
    urls = null;
    track = null;
    constructor(e = 0.5) {
      this.channel = new Fe(C.life, e);
    }
    set gain(e) {
      this.channel.gain = e;
    }
    start(e, t) {
      if ((this.stop(), !e || !t.length)) return;
      (this.urls ??= on()),
        (this.track = new rn(e, t, {
          play: (n) => void this.channel.play(this.urls[n]),
          now: Date.now,
          setTimer: (n, o) => window.setTimeout(n, o),
          clearTimer: (n) => window.clearTimeout(n),
        })),
        this.track.start();
    }
    preview(e) {
      (this.urls ??= on()), this.channel.play(this.urls[e]);
    }
    stop() {
      this.track?.stop(), (this.track = null), this.channel.stop();
    }
  }
  var Se = {
    voiceOn: !0,
    voice: 1,
    ambient: 0.06,
    ambientOn: !0,
    breaths: !0,
    pauseEvery: 0,
    pauseFor: 20,
    uiSounds: !0,
    lifeEvery: 0,
    lifeSounds: [...ze],
    lifeVolume: 0.5,
  };
  async function li(e) {
    let t = await fetch(chrome.runtime.getURL(e));
    return URL.createObjectURL(await t.blob());
  }
  async function is(e) {
    let t = await fetch(e);
    if (!t.ok) throw Error(`Áudio indisponível: ${e}`);
    return URL.createObjectURL(await t.blob());
  }
  class un {
    voice = new Fe(C.voice, 1);
    ambient = new Fe(C.ambient, 0.06);
    sfx = new Fe(C.sfx, 0.2);
    sequencer = null;
    audio = new Zt((e) => (/^https?:/.test(e) ? is(e) : li(e)));
    library = null;
    roomTone = null;
    running = !1;
    wait = 0;
    pauseTimer = 0;
    silencedUntil = 0;
    settings = Se;
    voiceOn = Se.voiceOn;
    pauseEvery = Se.pauseEvery;
    silent = !1;
    run = 0;
    celebrationPending = !1;
    onLine = () => {};
    betweenLines = null;
    async loadLibrary() {
      if (this.library) return this.library;
      return (
        (this.library = await (
          await fetch(chrome.runtime.getURL("audio/library.json"))
        ).json()),
        this.library
      );
    }
    async prepare(e = {}) {
      let t = await this.remote("p", e.product),
        n = (await this.loadLibrary()).lines,
        o = e.voice
          ? await this.remote("s", e.voice)
          : n.map((i) => ({ ...i, id: `s:${i.id}`, file: i.file }));
      if (e.voice)
        o.push(
          ...n
            .filter((i) => i.id.startsWith("merged_"))
            .map((i) => ({ ...i, id: `s:${i.id}` })),
        );
      return (
        (this.sequencer = new Jt(t, o)), { shared: o.length, own: t.length }
      );
    }
    async remote(e, t) {
      if (!t?.lines.length) return [];
      let n = t.lines.map((i) => ({
          id: `${e}:${i.id}`,
          kind: i.kind,
          text: i.text,
          file: `${t.base}/${i.file}`,
          dur: i.dur ?? 0,
          minGap: i.minGap,
          onlyAt: i.onlyAt,
        })),
        o = n.filter((i) => i.kind === "hook" || i.kind === "greeting");
      return (
        this.audio.warm([...o, ...n].map((i) => i.file)),
        await Promise.all(
          o.slice(0, 3).map((i) => this.audio.get(i.file).catch(() => null)),
        ),
        n
      );
    }
    async preload(e) {
      await Promise.all([
        this.remote("p", e.product),
        this.remote("s", e.voice),
      ]);
    }
    async speakFor(e) {
      return await this.prepare(e);
    }
    duck(e) {
      this.voice.setDuck(e);
    }
    get offAir() {
      return this.silent;
    }
    set offAir(e) {
      if (((this.silent = e), e)) this.stop();
    }
    async nextPassage() {
      if (this.betweenLines) await this.betweenLines();
      return this.sequencer?.next().line ?? null;
    }
    celebrationPassage() {
      return this.sequencer?.interject("celebration") ?? null;
    }
    apply(e) {
      let t = this.voiceOn;
      this.voiceOn = e.voiceOn;
      let n = this.pauseEvery;
      if (
        ((this.pauseEvery = e.pauseEvery),
        (this.settings = e),
        (this.voice.gain = e.voice),
        (this.ambient.gain = e.ambientOn ? e.ambient : 0),
        t && !e.voiceOn)
      )
        this.voice.stop();
      if (this.running && n !== e.pauseEvery) this.schedulePause();
    }
    url(e) {
      return this.audio.get(e.file);
    }
    async start() {
      if (!this.sequencer || this.running || this.silent) return;
      this.running = !0;
      let e = ++this.run,
        t = await this.loadLibrary();
      if (!this.running || e !== this.run) return;
      (this.roomTone ??= ni()),
        this.ambient.play(this.roomTone, !0),
        this.schedulePause(),
        this.loop(e);
    }
    stop() {
      (this.running = !1),
        this.run++,
        (this.celebrationPending = !1),
        clearTimeout(this.wait),
        clearTimeout(this.pauseTimer),
        this.voice.stop(),
        this.ambient.stop(),
        this.sfx.stop();
    }
    async celebrate() {
      if (!this.sequencer || this.silent || !this.running) return;
      this.celebrationPending = !0;
    }
    async previewCelebration() {
      if (this.running) return this.celebrate();
      if (!this.sequencer || this.silent) return;
      let e = this.run;
      (this.celebrationPending = !0),
        await this.playCelebration(
          () => !this.running && e === this.run && !this.silent,
        );
    }
    async playCelebration(e) {
      if (!this.celebrationPending) return;
      this.celebrationPending = !1;
      let t = await this.loadLibrary();
      if (!e()) return;
      let n = t.sfx.sale[Math.floor(Math.random() * t.sfx.sale.length)],
        o = n && (await this.audio.get(n).catch(() => null));
      if (!e()) return;
      if (o) await this.sfx.play(o);
      if (!e() || !this.settings.voiceOn) return;
      let i = this.sequencer?.interject("celebration"),
        r = i && (await this.url(i).catch(() => null));
      if (i && r && e() && this.settings.voiceOn)
        this.onLine(i.text ?? "", i), await this.voice.play(r);
    }
    schedulePause() {
      if ((clearTimeout(this.pauseTimer), !this.settings.pauseEvery)) return;
      this.pauseTimer = window.setTimeout(() => {
        (this.silencedUntil = Date.now() + this.settings.pauseFor * 1000),
          this.schedulePause();
      }, this.settings.pauseEvery * 60000);
    }
    async loop(e) {
      let t = () => this.running && e === this.run && !this.silent;
      while (t() && this.sequencer) {
        if (Date.now() < this.silencedUntil) {
          await new Promise(
            (r) =>
              (this.wait = window.setTimeout(
                r,
                this.silencedUntil - Date.now(),
              )),
          );
          continue;
        }
        if ((await this.playCelebration(t), !t())) break;
        if (!(this.settings?.voiceOn ?? !0)) {
          await new Promise((r) => (this.wait = window.setTimeout(r, 1000)));
          continue;
        }
        if (this.betweenLines) await this.betweenLines();
        if (!t() || !this.sequencer) break;
        let { line: n, gapMs: o } = this.sequencer.next(),
          i = await this.url(n).catch(() => null);
        if (!t()) break;
        if (!i) {
          await new Promise((r) => (this.wait = window.setTimeout(r, o)));
          continue;
        }
        if ((this.onLine(n.text ?? "", n), await this.voice.play(i), !t()))
          break;
        await new Promise((r) => (this.wait = window.setTimeout(r, o)));
      }
    }
  }
  var B = (e) => (typeof e === "string" ? e : ""),
    Y = (e) => {
      let t = Number(e);
      return Number.isFinite(t) ? t : 0;
    };
  function rs(e, t) {
    switch (e) {
      case "roomInfo":
        return {
          kind: "room",
          isLive: Boolean(t.roomInfo?.isLive),
          title: B(t.roomInfo?.title),
          host: B(t.user?.uniqueId),
        };
      case "WebcastChatMessage": {
        let n = B(t.comment).trim(),
          o = B(t.user?.uniqueId);
        if (!n || !o) return null;
        return {
          kind: "chat",
          id: B(t.common?.msgId) || `${o}:${t.common?.createTime}`,
          user: o,
          nickname: B(t.user?.nickname) || o,
          avatar: B(t.user?.profilePicture?.url?.[0]) || null,
          text: n,
          at: Y(t.common?.createTime),
        };
      }
      case "WebcastRoomUserSeqMessage":
        return { kind: "viewers", count: Y(t.viewerCount) };
      case "WebcastLikeMessage":
        return { kind: "likes", total: Y(t.totalLikeCount) };
      case "WebcastGiftMessage": {
        if (Y(t.giftDetails?.giftType) === 1 && Y(t.repeatEnd) !== 1)
          return null;
        let n = Math.max(1, Y(t.repeatCount));
        return {
          kind: "gift",
          user: B(t.user?.uniqueId),
          name: B(t.giftDetails?.giftName),
          count: n,
          diamonds: n * Y(t.giftDetails?.diamondCount),
        };
      }
      case "WebcastControlMessage":
        return Y(t.action) === 3 ? { kind: "end" } : null;
      default:
        return null;
    }
  }
  function di(e) {
    try {
      let t = JSON.parse(e);
      return (Array.isArray(t.messages) ? t.messages : [t]).flatMap((o) => {
        let i = rs(B(o?.type), o?.data ?? {});
        return i ? [i] : [];
      });
    } catch {
      return [];
    }
  }
  function pi(e) {
    switch (e) {
      case 4404:
        return {
          kind: "not_live",
          retry: !1,
          message:
            "Essa conta não está ao vivo agora. Comece a live no TikTok e conecte de novo.",
        };
      case 4403:
        return {
          kind: "wrong_creator",
          retry: !1,
          message:
            "A conexão foi autorizada para outra conta. Confira o @ e tente de novo.",
        };
      case 4005:
        return { kind: "ended", retry: !1, message: "A live terminou." };
      case 4429:
        return {
          kind: "busy",
          retry: !1,
          message:
            "Muitas lives conectadas agora. Tente de novo em alguns minutos.",
        };
      case 4401:
        return {
          kind: "auth",
          retry: !1,
          message: "A autorização expirou. Conecte de novo.",
        };
      case 4555:
        return {
          kind: "limit",
          retry: !1,
          message: "A conexão atingiu o limite de 8 horas.",
        };
      default:
        return {
          kind: "dropped",
          retry: !0,
          message: "Conexão com o chat caiu. Reconectando…",
        };
    }
  }
  function as(e) {
    return e
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }
  var ss = [
      /\b(whats|whatsapp|zap|telegram|dm|pix)\b/,
      /\b(sigam|segue de volta|ganhe seguidores|seguidores gratis)\b/,
      /\d[\d\s().-]{8,}\d/,
      /https?:\/\/(?!(?:\w+\.)?tiktok\.com)/,
    ],
    ci =
      /\b(quero|comprei|compro|vou levar|ja pedi|pedi o meu|manda o link|cade o link|qual o link)\b/,
    ui =
      /\b(quanto|quantos|quantas|qual|quais|tem|serve|chega|frete|entrega|prazo|tamanho|numeracao|cor|cores|desconto|cupom|funciona|como|onde|quando|pode|garantia|original|preco|valor|parcela)\b/;
  function hi(e) {
    let t = as(e);
    if (!/\p{L}{2,}/u.test(t)) return "spam";
    if (ss.some((n) => n.test(t))) return "spam";
    if (t.includes("?")) return ci.test(t) && !ui.test(t) ? "buy" : "question";
    if (ci.test(t)) return "buy";
    if (ui.test(t)) return "question";
    return "chat";
  }
  var yc = new Set(
    "a o e os as um uma de da do das dos em no na nos nas por pra para com que qual quais quanto quantos quantas muito muita ela ele dela dele isso esse essa mesmo tem fica eh e se ser sao me voce vc ai la ja so mais bem".split(
      " ",
    ),
  );
  function mi(e, t) {
    let n = new WebSocket(e),
      o = !1;
    return (
      (n.onmessage = (i) => {
        for (let r of di(String(i.data))) {
          if (r.kind === "end")
            t({ kind: "ended", message: "A LIVE foi encerrada no TikTok" });
          if (r.kind === "room" && r.isLive === !1)
            t({ kind: "suspect", message: "O chat diz que a LIVE saiu do ar" });
          if (r.kind === "chat")
            t({ kind: "chat", user: r.user, message: r.text });
        }
      }),
      (n.onclose = (i) => {
        if (o) return;
        t(ls(i.code));
      }),
      () => {
        (o = !0), n?.close(), (n = null);
      }
    );
  }
  function ls(e) {
    let t = pi(e);
    if (t.kind === "ended")
      return { kind: "ended", message: "A LIVE foi encerrada no TikTok" };
    if (t.kind === "not_live")
      return { kind: "suspect", message: "O chat não encontrou a LIVE no ar" };
    return {
      kind: "lost",
      message: "Perdi a conexão com o chat; sigo lendo pela tela",
    };
  }
  var cs = 100,
    vi = {
      own: "é uma resposta minha",
      repeat: "essa pergunta já foi respondida ou está em andamento",
      cooldown: "respondi agora há pouco",
      chatter: "não parece pergunta",
      full: "a fila de perguntas está cheia",
    },
    fi = {
      preco: "Qual o preço do produto?",
      tamanho: "Quais os tamanhos e medidas do produto?",
      cores: "Quais as cores disponíveis do produto?",
      uso: "Como usar o produto?",
      frete: "Como conferir o frete e o prazo de entrega?",
      produto: "Qual é o produto apresentado?",
    };
  function gi(e) {
    let t = e.trim();
    if (!t.startsWith("!")) return t;
    let n = t
      .slice(1)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
    return Object.hasOwn(fi, n) ? fi[n] : "";
  }
  class dn {
    opts;
    answered = new Map();
    pending = null;
    turns = new Map();
    posted = new Set();
    lastAt = null;
    queue = [];
    constructor(e) {
      this.opts = e;
    }
    now() {
      return this.opts.now?.() ?? Date.now();
    }
    key(e, t) {
      return `${e.trim().toLowerCase()}\x00${t.trim().toLowerCase()}`;
    }
    history(e, t = "") {
      return this.turns.get(`${e.trim().toLowerCase()}|${t}`) ?? [];
    }
    failed() {
      this.pending = null;
    }
    reset() {
      (this.pending = null),
        (this.queue = []),
        this.answered.clear(),
        this.turns.clear(),
        (this.lastAt = null);
    }
    get busy() {
      return this.pending !== null;
    }
    discardQueue() {
      this.queue = [];
    }
    waiting(e) {
      return (
        (this.queue = this.queue.filter(
          (t) => t.scope === e && this.now() - t.at < 180000,
        )),
        this.queue.length
      );
    }
    enqueue(e) {
      this.waiting(e.scope ?? "");
      let t = gi(e.text),
        n = e.user.trim(),
        o = `${e.scope ?? ""}|${this.key(n, t)}`,
        i = this.skip({ ...e, user: n, text: t });
      if (i) return { ok: !1, why: i };
      if (this.queue.some((r) => r.key === o)) return { ok: !1, why: "repeat" };
      if (
        this.queue.length >= 5 ||
        this.queue.filter((r) => r.user.toLowerCase() === n.toLowerCase())
          .length >= 2
      )
        return { ok: !1, why: "full" };
      return (
        this.queue.push({
          user: n,
          text: t,
          scope: e.scope ?? "",
          at: this.now(),
          key: o,
        }),
        { ok: !0, user: n, text: t }
      );
    }
    next(e) {
      if (
        (this.waiting(e),
        this.busy ||
          (this.lastAt !== null &&
            this.now() - this.lastAt < this.opts.cooldownMs))
      )
        return null;
      while (this.queue.length) {
        let t = this.pick(this.queue.shift());
        if (t.ok) return t;
      }
      return null;
    }
    skip(e) {
      let { user: t, text: n } = e;
      if (!t || this.posted.has(n)) return "own";
      let o = `${e.scope ?? ""}|${this.key(t, n)}`;
      for (let [r, l] of this.answered)
        if (this.now() - l > 300000) this.answered.delete(r);
      if (this.pending === o || this.answered.has(o)) return "repeat";
      let i = hi(n);
      if (
        i !== "question" &&
        i !== "buy" &&
        !(
          this.history(t, e.scope).length &&
          /^(e |mas |a azul|o azul|essa|esse)/i.test(n)
        )
      )
        return "chatter";
      return null;
    }
    mine(e) {
      if ((this.posted.add(e.trim()), this.posted.size > 50))
        this.posted.delete(this.posted.values().next().value);
    }
    pick(e) {
      let t = gi(e.text),
        n = e.user.trim(),
        o = this.skip({ ...e, user: n, text: t });
      if (o) return { ok: !1, why: o };
      let i = `${e.scope ?? ""}|${this.key(n, t)}`;
      if (
        this.pending ||
        (this.lastAt !== null &&
          this.now() - this.lastAt < this.opts.cooldownMs)
      )
        return { ok: !1, why: "cooldown" };
      return (this.pending = i), { ok: !0, user: n, text: t };
    }
    sent(e, t, n, o = "") {
      if (this.pending) this.answered.set(this.pending, this.now());
      if (this.answered.size > 200)
        this.answered.delete(this.answered.keys().next().value);
      if (((this.pending = null), (this.lastAt = this.now()), e && t && n)) {
        let i = `${e.trim().toLowerCase()}|${o}`;
        if (
          (this.turns.set(
            i,
            [...this.history(e, o), { question: t, answer: n }].slice(-3),
          ),
          this.turns.size > 50)
        )
          this.turns.delete(this.turns.keys().next().value);
      }
    }
    compose(e, t) {
      let n = `@${e.slice(0, 40)} `,
        o = cs - n.length;
      if (t.length <= o) return n + t;
      let i = t.slice(0, o - 1),
        r = i.lastIndexOf(" ");
      return (n + (r > o / 2 ? i.slice(0, r) : i)).trimEnd() + "…";
    }
  }
  var pn = [
    "oi! que bom te ver por aqui \uD83D\uDC9B",
    "boas-vindas! fica à vontade pra perguntar",
    "chegou na hora boa! o produto tá fixado aqui embaixo",
    "oi, tudo bem? se tiver dúvida me chama aqui",
    "que bom que você veio! de onde você tá assistindo?",
    "oi! as fotos e detalhes estão na sacolinha",
    "olá! me conta, você já conhece esse produto?",
    "boas-vindas à live! pode perguntar o que quiser",
    "oi, chegou agora? qualquer dúvida, escreve aqui",
    "eba, mais gente! o produto tá na sacolinha \uD83D\uDECD️",
    "oi! me conta o que você procura",
    "que bom te ver! qualquer coisa é só chamar",
  ];
  class hn {
    opts;
    greeted = new Set();
    recent = [];
    lastAt = 0;
    constructor(e) {
      this.opts = e;
    }
    greet(e) {
      let t = e.trim(),
        n = t.toLowerCase();
      if (!t || n === this.opts.host?.trim().toLowerCase()) return null;
      if (this.greeted.has(n)) return null;
      let o = (this.opts.now ?? Date.now)();
      if (o - this.lastAt < this.opts.cooldownMs) return null;
      let i = pn.filter((c) => !this.recent.includes(c)),
        r = i.length ? i : pn,
        l = r[Math.floor((this.opts.random ?? Math.random)() * r.length)];
      if (
        (this.greeted.add(n),
        (this.lastAt = o),
        this.recent.push(l),
        this.recent.length > pn.length - 3)
      )
        this.recent.shift();
      let s = `@${t} ${l}`;
      return s.length <= 100 ? s : `@${t} oi! \uD83D\uDC9B`.slice(0, 100);
    }
  }
  class fn {
    board;
    blockMs;
    hooks;
    index = -1;
    startedAt = 0;
    prepared = new Set();
    switching = !1;
    constructor(e, t, n) {
      this.board = e;
      this.blockMs = t;
      this.hooks = n;
    }
    get current() {
      return this.board[this.index] ?? null;
    }
    get length() {
      return this.board.length;
    }
    get elapsedSeconds() {
      if (this.index < 0) return 0;
      return Math.max(0, Math.floor((this.at() - this.startedAt) / 1000));
    }
    at() {
      return (this.hooks.now ?? Date.now)();
    }
    due() {
      if (this.switching || this.board.length < 2) return !1;
      return this.at() - this.startedAt >= this.blockMs;
    }
    async begin() {
      if (!this.board.length) return !1;
      return this.enter(0);
    }
    async advance() {
      if (this.switching || this.board.length < 2) return !1;
      return this.enter((this.index + 1) % this.board.length);
    }
    async enter(e) {
      let t = this.board[e];
      if (!t) return !1;
      this.switching = !0;
      try {
        if ((await this.prepare(t), t.url)) {
          if ((await this.hooks.pin(t.title)) === "not_found") {
            let o = await this.hooks.add(t.url);
            if (
              (this.hooks.log(
                o
                  ? `\uD83D\uDECD️ Coloquei ${mn(t.title)} na live`
                  : `Não consegui colocar ${mn(t.title)} na lista.`,
              ),
              o)
            )
              await this.hooks.pin(t.title);
          }
        }
        return (
          (this.index = e),
          (this.startedAt = this.at()),
          this.hooks.show(t),
          await this.hooks.speak(t),
          this.hooks.log(
            `▶️ Agora: ${mn(t.title)}${t.why[0] ? ` — ${t.why[0]}` : ""}`,
          ),
          this.prepare(this.board[(e + 1) % this.board.length]),
          !0
        );
      } finally {
        this.switching = !1;
      }
    }
    async prepare(e) {
      if (!e || this.prepared.has(e.id)) return;
      this.prepared.add(e.id);
      try {
        await this.hooks.preload(e);
      } catch {
        this.prepared.delete(e.id);
      }
    }
  }
  var mn = (e) =>
    e
      .split(/\s[-–|]\s/)[0]
      .split(/\s+/)
      .slice(0, 4)
      .join(" ");
  class gn {
    decide;
    now;
    questions = [];
    nextAt = 0;
    pending = !1;
    revision = 0;
    request = 0;
    pendingUntil = 0;
    ready = null;
    heldScope = null;
    holdUntil = 0;
    dueScope = null;
    dueAt = 0;
    constructor(e, t = Date.now) {
      this.decide = e;
      this.now = t;
    }
    question(e, t) {
      this.questions.push({ text: e.slice(0, 300), scope: t, at: this.now() }),
        (this.questions = this.questions.slice(-3));
    }
    engaged(e) {
      return this.questions.some(
        (t) => t.scope === e && this.now() - t.at < 30000,
      );
    }
    boundary(e, t, n, o = t) {
      let i = this.now();
      if (this.pending && i >= this.pendingUntil)
        (this.pending = !1), this.request++;
      if (e.rotationDue && this.dueScope !== t)
        (this.dueScope = t), (this.dueAt = i);
      let r = this.questions
          .filter((c) => c.scope === o && i - c.at < 60000)
          .map((c) => c.text),
        l = this.ready;
      if (
        ((this.ready = null), l?.scope === t && l.revision === this.revision)
      ) {
        let c = l.decision;
        if (r.length && (c.action === "focus" || c.action === "hold")) {
          if (c.topic) n(c.topic);
          if (e.rotationDue && this.heldScope !== t)
            (this.heldScope = t), (this.holdUntil = this.dueAt + 60000);
        }
      }
      if (!this.pending && i >= this.nextAt && (r.length || e.rotationDue)) {
        (this.nextAt = i + 30000), (this.pending = !0);
        let c = this.revision,
          d = ++this.request,
          p = (this.pendingUntil = i + 1e4);
        Promise.resolve()
          .then(() => this.decide({ ...e, questions: r }))
          .then((h) => {
            if (
              c === this.revision &&
              d === this.request &&
              this.now() < p &&
              h
            )
              this.ready = { decision: h, scope: t, revision: c };
          })
          .catch(() => {})
          .finally(() => {
            if (c === this.revision && d === this.request) this.pending = !1;
          });
      }
      let s =
        r.length > 0 &&
        this.pending &&
        this.dueScope === t &&
        i < this.dueAt + 5000;
      return (
        e.rotationDue && !s && !(this.heldScope === t && i < this.holdUntil)
      );
    }
    reset() {
      this.revision++,
        (this.pending = !1),
        (this.ready = null),
        (this.questions = []),
        (this.nextAt = 0),
        (this.heldScope = null),
        (this.holdUntil = 0),
        (this.dueScope = null),
        (this.dueAt = 0);
    }
  }
  function vn(e, t) {
    return (
      e.review?.kind === "real-pov" &&
      e.review.facesVisible === !1 &&
      e.review.productId === t
    );
  }
  async function bi(e) {
    e = e.replace(/\/+$/, "");
    let t = await wi(`${e}/index.json`);
    if (!t) return [];
    try {
      let n = await t.json();
      if (!Array.isArray(n.clips)) return [];
      let o = /\/real\/?$/.test(e),
        i = Number(/\/clips\/(\d+)\/real\/?$/.exec(e)?.[1]);
      return n.clips.flatMap((r) => {
        let l = typeof r === "string" ? { file: r } : r;
        if (
          !l ||
          typeof l.file !== "string" ||
          !/^[a-zA-Z0-9_-][a-zA-Z0-9._-]*\.mp4$/.test(l.file)
        )
          return [];
        if (o && (!Number.isSafeInteger(i) || i <= 0 || !vn(l, i))) return [];
        return [
          {
            file: l.file,
            topics: Array.isArray(l.topics)
              ? l.topics.filter((s) => typeof s === "string").slice(0, 20)
              : [],
          },
        ];
      });
    } catch {
      return [];
    }
  }
  var de = (e) => `${e}/real`,
    us = 20000;
  async function wi(e, t = us) {
    let n = new AbortController(),
      o = setTimeout(() => n.abort(), t);
    try {
      let i = await fetch(e, { signal: n.signal });
      return i.ok ? i : null;
    } catch {
      return null;
    } finally {
      clearTimeout(o);
    }
  }
  async function yi(e) {
    return (await bi(e)).map((t) => t.file);
  }
  class pt {
    byProduct = new Map();
    inFlight = new Map();
    assets = new Map();
    focus(e, t) {
      let n = t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((i) => i.length > 2);
      return (
        (this.assets.get(e) ?? []).find(({ asset: i }) =>
          i.topics?.some((r) =>
            n.includes(
              r
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase(),
            ),
          ),
        )?.blob ?? null
      );
    }
    async load(e, t) {
      let n = this.byProduct.get(e);
      if (n) return n;
      let o = this.inFlight.get(e);
      if (o) return o;
      let i = (async () => {
        let r = await bi(t),
          s = (
            await Promise.all(
              r.map(async (c) => {
                let d = await wi(`${t}/${c.file}`),
                  p = d && (await d.blob());
                return p && p.size > 0 ? { asset: c, blob: p } : null;
              }),
            )
          ).filter((c) => c !== null);
        return this.assets.set(e, s), s.map((c) => c.blob);
      })().then((r) => {
        if (r.length) this.byProduct.set(e, r);
        return this.inFlight.delete(e), r;
      });
      return this.inFlight.set(e, i), i;
    }
    ready(e) {
      return this.byProduct.get(e) ?? [];
    }
  }
  var bn =
      "inset 0 1px 0 0 oklch(1 0 0 / 0.07), 0 0 0 1px oklch(0 0 0 / 0.35), 0 24px 56px -16px rgb(0 0 0 / 0.55), 0 8px 18px -8px rgb(0 0 0 / 0.35)",
    xi = `
:host {
  /* Ground is the panel; surface is a group sitting on it; raised is a
     control sitting on a group. Each step is a little lighter, as depth reads
     on a dark screen. */
  --ground: oklch(0.17 0.006 75);
  --surface: oklch(0.215 0.006 75);
  --raised: oklch(0.265 0.007 75);
  --raised-hover: oklch(0.3 0.008 75);
  --track: oklch(0.33 0.008 75);
  --fg: oklch(0.96 0.004 75);
  --fg-muted: oklch(0.72 0.008 75);
  --fg-subtle: oklch(0.6 0.008 75);
  --border: oklch(1 0 0 / 9%);
  --hairline: oklch(1 0 0 / 7%);
  --primary: oklch(0.86 0.19 128);
  --primary-hover: oklch(0.89 0.18 128);
  --primary-fg: oklch(0.2 0.05 128);
  --warn: oklch(0.83 0.15 80);
  --danger: oklch(0.66 0.19 22);
  --danger-fg: oklch(0.8 0.12 22);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  /* Springs, sampled from Apple's model (damping ratio, response) into
     linear() so they run on the compositor like any other curve.
     press: 0.75 / 0.3s — a release that settles a hair past rest.
     slide: 1.0 / 0.32s — critically damped, for things that move across.
     menu: 0.82 / 0.28s — a list landing, barely past its size. */
  --spring-press: linear(0, 0.0333, 0.1155, 0.2249, 0.3454, 0.4657, 0.5784, 0.6791, 0.7656, 0.8373, 0.8947, 0.9392, 0.9724, 0.996, 1.0119, 1.0216, 1.0267, 1.0283, 1.0277, 1.0255, 1.0225, 1.0191, 1.0157, 1.0125, 1.0095, 1.007, 1.0049, 1.0032, 1);
  --spring-press-ms: 370ms;
  --spring-slide: linear(0, 0.0501, 0.1599, 0.2891, 0.4163, 0.531, 0.6294, 0.7109, 0.7768, 0.8292, 0.8702, 0.902, 0.9264, 0.9449, 0.959, 0.9695, 0.9775, 0.9834, 0.9878, 0.991, 0.9934, 0.9952, 0.9965, 0.9974, 1);
  --spring-slide-ms: 435ms;
  --spring-menu: linear(0, 0.0364, 0.124, 0.2373, 0.359, 0.4775, 0.5861, 0.6813, 0.7617, 0.8275, 0.8799, 0.9205, 0.9509, 0.9731, 0.9886, 0.999, 1.0055, 1.0091, 1.0108, 1.0111, 1.0105, 1.0094, 1.0081, 1.0068, 1.0055, 1.0043, 1.0033, 1.0025, 1);
  --spring-menu-ms: 365ms;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --pad: 14px;
  all: initial;
  position: fixed;
  right: max(16px, var(--safe-right));
  bottom: max(16px, var(--safe-bottom));
  z-index: 2147483647;
  font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--fg);
  caret-color: var(--primary);
  /* Lets a revealed row transition from height 0 to its own auto height. */
  interpolate-size: allow-keywords;
}
* {
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: var(--raised) transparent;
}
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--raised); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: var(--raised-hover); }
::selection { background: oklch(0.86 0.19 128 / 0.25); color: var(--fg); }
svg { display: block; }

/* ---------------------------------------------------------------- panel */

.panel {
  position: relative;
  display: flex; flex-direction: column;
  width: 352px;
  max-width: min(352px, calc(100vw - max(24px, calc(var(--safe-left) + var(--safe-right) + 16px))));
  /* --panel-max-height is the room actually left below wherever the panel was
     dropped; it is set when the panel is placed and absent while it sits in its
     default corner. Either way the panel never runs off the bottom edge. */
  max-height: min(var(--panel-max-height, 640px), 85vh, 640px);
  max-height: min(var(--panel-max-height, 640px), 85dvh, 640px);
  overflow: hidden;
  border-radius: 20px;
  background: var(--ground);
  box-shadow: ${"inset 0 1px 0 0 oklch(1 0 0 / 0.07), 0 0 0 1px oklch(0 0 0 / 0.35), 0 24px 56px -16px rgb(0 0 0 / 0.55), 0 8px 18px -8px rgb(0 0 0 / 0.35)"};
  opacity: 1;
  transform: translateY(0) scale(1);
  transform-origin: bottom right;
  /* Paints and lays out on its own: nothing on TikTok's page is restyled when
     the panel rebuilds, and the other way round. */
  contain: layout paint style;
  /* allow-discrete lets the display change wait for the transition, so
     minimising is a movement toward the pill rather than the panel blinking
     out of existence. */
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out),
    display 200ms allow-discrete;
  @starting-style { opacity: 0; transform: translateY(8px) scale(0.98); }
}
/* The main screen keeps one height whatever the tab holds. It used to follow
   its content, and anchored at the bottom that meant the tabs jumped hundreds
   of pixels up and down every time the creator switched between them. */
.panel[data-screen="main"] {
  height: min(var(--panel-max-height, 640px), 85vh, 640px);
  height: min(var(--panel-max-height, 640px), 85dvh, 640px);
}
:host([data-collapsed="true"]) .panel {
  display: none;
  opacity: 0;
  /* Toward the pill, which sits in the corner the panel is anchored to. */
  transform: translateY(8px) scale(0.96);
}

header {
  flex: none;
  display: flex; align-items: center; gap: 8px;
  padding: var(--pad) var(--pad) 0;
  cursor: grab; touch-action: none; user-select: none;
}
header:active { cursor: grabbing; }
.mark { flex: none; width: 22px; height: 22px; color: var(--primary); }
.mark svg { width: 100%; height: 100%; }
.wordmark { font-size: 14.5px; font-weight: 750; letter-spacing: -0.02em; }
.header-end { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.status {
  display: inline-flex; align-items: center; gap: 6px;
  max-width: 120px; padding: 3px 9px; border-radius: 999px;
  background: var(--surface); color: var(--fg-muted);
  font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.status.on { background: oklch(0.66 0.19 22 / 0.16); color: var(--danger-fg); }
.status.on .onair { background: currentColor; width: 6px; height: 6px; }
.icon {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: grid; place-items: center;
  width: 28px; height: 28px; border-radius: 9px;
  color: var(--fg-muted);
  transition: background-color 150ms ease, color 150ms ease, transform 160ms var(--ease-out);
}
.icon:active { transform: scale(0.94); }
.minimize::before { content: ""; width: 10px; height: 1.8px; border-radius: 1px; background: currentColor; }
@media (hover: hover) and (pointer: fine) { .icon:hover { background: var(--surface); color: var(--fg); } }

/* The one part that scrolls. contain keeps a scrolled panel from scrolling
   TikTok's page once it reaches the end. No scrollbar, as on iOS: its gutter
   pushed every group out of line with the header and the tabs, by a width
   that differs per system, and the fade into the start button already says
   there is more below. */
.body {
  flex: 1 1 auto; min-height: 0;
  display: flex; flex-direction: column; gap: 16px;
  padding: 14px var(--pad) var(--pad);
  overflow-x: hidden; overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.body::-webkit-scrollbar { display: none; }
.panel:not([data-screen="main"]) .body { flex: 0 1 auto; }

/* The panel's one authored entrance: on its first appearance the sections
   arrive in turn, 40ms apart. Never on a repaint (panel.ts sets it once). */
@keyframes zl-rise {
  from { opacity: 0; transform: translateY(6px); }
}
.body[data-intro] > * { animation: zl-rise 320ms var(--ease-out) both; }
.body[data-intro] > :nth-child(2) { animation-delay: 40ms; }
.body[data-intro] > :nth-child(3) { animation-delay: 80ms; }
.body[data-intro] > :nth-child(4) { animation-delay: 120ms; }
.body[data-intro] > :nth-child(5) { animation-delay: 160ms; }
.body[data-intro] > :nth-child(n + 6) { animation-delay: 200ms; }

/* ------------------------------------------------------------------ tabs */

/* One pill that moves between the tabs, rather than a background appearing
   under the new tab and disappearing from under the old one. The movement is
   what says the sections sit beside each other.

   The pill is a real element and not ::before because the panel is rebuilt by
   replaceChildren on every render: a CSS transition would have nothing to
   transition from, so panel.ts animates this from the old index to the new. */
.tabs {
  flex: none; position: relative;
  display: grid; grid-template-columns: repeat(3, 1fr);
  margin: 12px var(--pad) 0; padding: 3px; border-radius: 11px; background: var(--surface);
}
/* Where the body scrolls under the tabs it fades out instead of being cut
   off in a hard line. At rest it lies over the body's own top padding. */
.tabs::after {
  content: ""; position: absolute; z-index: 2; pointer-events: none;
  left: calc(-1 * var(--pad)); right: calc(-1 * var(--pad)); top: 100%; height: 12px;
  background: linear-gradient(var(--ground), oklch(0.17 0.006 75 / 0));
}
.tab-indicator {
  position: absolute; z-index: 0;
  top: 3px; bottom: 3px; left: 3px;
  width: calc((100% - 6px) / 3);
  border-radius: 8px;
  background: oklch(0.32 0.008 75);
  /* A hairline of light along the top edge, so the pill sits on the track
     rather than being a slightly paler patch of it. */
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.4);
  transform: translateX(calc(var(--tab, 0) * 100%));
}

.tabs button {
  all: unset; position: relative; z-index: 1;
  cursor: pointer; text-align: center; padding: 6px 0; border-radius: 8px;
  font-size: 12.5px; font-weight: 600; color: var(--fg-muted);
  font-variant-numeric: tabular-nums;
}
.tabs button[aria-selected="true"] { color: var(--fg); }
@media (hover: hover) and (pointer: fine) {
  .tabs button:not([aria-selected="true"]):hover { color: var(--fg); }
}

/* -------------------------------------------------------- groups and rows */

.section { display: grid; gap: 6px; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 0 4px; }
.section-title {
  margin: 0; padding: 0 4px;
  font-size: 11px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--fg-subtle);
}
.section-head .section-title { padding: 0; }
.section-meta { font-size: 11px; font-weight: 600; color: var(--fg-subtle); font-variant-numeric: tabular-nums; }
.section-meta.ok { color: var(--primary); }
.caption, .hint { margin: 0; padding: 0 4px; font-size: 11.5px; line-height: 1.4; color: var(--fg-subtle); }

/* iOS Settings, on charcoal: one surface per group, a hairline between rows
   that starts where the words start. The hairline is a background image, so
   it costs no element and moves with its row when the row folds away. */
.group {
  display: grid; margin: 0; padding: 0; list-style: none;
  border-radius: 14px; background: var(--surface);
  overflow: clip;
}
.group > * + * {
  background-image: linear-gradient(var(--hairline), var(--hairline));
  background-repeat: no-repeat;
  background-position: 12px 0;
  background-size: calc(100% - 12px) 1px;
}
.row {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  min-height: 44px; padding: 10px 12px;
  -webkit-tap-highlight-color: transparent;
}
.row-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.row-text strong, strong.row-text { font-size: 13px; font-weight: 600; }
.row-text small { color: var(--fg-muted); font-size: 11.5px; line-height: 1.35; overflow-wrap: anywhere; }
.row.toggle, .row.choice { cursor: pointer; transition: background-color 120ms ease; }
/* The row answers the press, as a table cell does on iOS. */
.row.toggle:active, .row.choice:active { background-color: oklch(1 0 0 / 0.025); }
.row.slider { display: grid; gap: 10px; }
.row.slider .row-text { grid-template-columns: 1fr auto; align-items: baseline; }
.row.slider output { color: var(--fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.row.stack-row, .row.chips { flex-direction: column; align-items: stretch; gap: 8px; }
.row.chips small { color: var(--fg-muted); font-size: 11.5px; }

/* A row that only exists while another setting is on opens out of the group
   instead of popping in and shoving the rest down. An accordion, so height
   is animated: there is no transform that makes room. Closing is the same
   path in reverse, played by panel.ts. */
.group > [data-enter] {
  overflow: clip;
  transition: height 200ms var(--ease-out), padding-block 200ms var(--ease-out), opacity 200ms var(--ease-out);
  @starting-style { height: 0; min-height: 0; padding-block: 0; opacity: 0; }
}

/* ------------------------------------------------------------- checklist */

.progress { height: 3px; margin: 0 4px 2px; border-radius: 999px; background: var(--surface); overflow: hidden; }
.progress i {
  display: block; height: 100%; width: 100%;
  background: var(--primary); border-radius: inherit;
  transform-origin: left;
  /* No transition: the bar is rebuilt every render, so panel.ts grows it from
     where it stood with WAAPI. */
}
.check {
  display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: start;
  column-gap: 10px; row-gap: 10px;
  padding: 11px 12px;
}
.checks > * + * { background-position: 42px 0; background-size: calc(100% - 42px) 1px; }
.check > .btn { align-self: center; }
.dot {
  display: grid; place-items: center;
  width: 20px; height: 20px; margin-top: 0; border-radius: 999px;
  box-shadow: inset 0 0 0 1.5px oklch(1 0 0 / 0.16); color: var(--fg-subtle);
  font-size: 10.5px; font-weight: 650; font-variant-numeric: tabular-nums;
  transition: background-color 200ms ease, box-shadow 200ms ease, color 200ms ease;
}
.dot.ok { background: var(--primary); box-shadow: none; color: var(--primary-fg); }
.check.ok .row-text strong { color: var(--fg); }
.plan-pick { grid-column: 2 / -1; display: flex; gap: 6px; min-width: 0; }
/* A step seen undone and now done. Rare — a handful per session — so it gets
   the full moment: the dot fills from a little smaller and the tick draws. */
@keyframes zl-draw { to { stroke-dashoffset: 0; } }
.check[data-enter] .dot {
  transition: background-color 200ms ease, box-shadow 200ms ease, color 200ms ease, transform 260ms var(--ease-out);
  @starting-style { background-color: transparent; color: var(--fg-subtle); transform: scale(0.8); }
}
.check[data-enter] .dot path {
  stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: zl-draw 280ms var(--ease-out) 110ms forwards;
}

/* --------------------------------------------------------------- buttons */

/* Pressed the instant the pointer goes down, quickly; let go, it comes back
   on a spring and settles a hair past rest, the way a physical key does.
   Two transitions, one per direction: :active swaps the curve in. */
.btn {
  all: unset; box-sizing: border-box; cursor: pointer; flex: none;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 30px; padding: 0 12px; border-radius: 9px;
  background: var(--raised); color: var(--fg);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.06), 0 1px 1px rgb(0 0 0 / 0.2);
  font-size: 12.5px; font-weight: 600; letter-spacing: -0.003em; white-space: nowrap;
  -webkit-tap-highlight-color: transparent; user-select: none;
  transition: transform var(--spring-press-ms) var(--spring-press), background-color 150ms ease, color 150ms ease, opacity 150ms ease;
}
.btn:active { transform: scale(0.96); transition-duration: 90ms, 150ms, 150ms, 150ms; transition-timing-function: var(--ease-out), ease, ease, ease; }
/* The one lime thing in the panel. Light catches its top edge and falls off
   down the face: a material, not a flat fill. No coloured glow (DESIGN.md). */
.btn.primary {
  background: linear-gradient(to bottom, oklch(1 0 0 / 0.16), oklch(1 0 0 / 0) 55%), var(--primary);
  color: var(--primary-fg);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.35), inset 0 -1px 0 oklch(0 0 0 / 0.12), 0 1px 2px rgb(0 0 0 / 0.35), 0 6px 14px -6px rgb(0 0 0 / 0.5);
}
.btn.stop {
  background: oklch(0.66 0.19 22 / 0.15); color: var(--danger-fg);
  box-shadow: inset 0 0 0 1px oklch(0.66 0.19 22 / 0.24);
}
.btn.big { width: 100%; height: 46px; border-radius: 13px; font-size: 14.5px; font-weight: 650; letter-spacing: -0.01em; }
/* Play and stop, drawn: they say what the press does before the words do. */
.btn.big.primary:not(:disabled)::before, .btn.big.stop::before { content: ""; flex: none; background: currentColor; }
.btn.big.primary:not(:disabled)::before { width: 9px; height: 11px; clip-path: polygon(0 0, 100% 50%, 0 100%); margin-left: 2px; }
.btn.big.stop::before { width: 10px; height: 10px; border-radius: 2.5px; }
.btn.wide { width: 100%; height: 38px; }
.btn.icon-btn { width: 34px; height: 34px; padding: 0; color: var(--fg-muted); }
.btn-label { display: inline-block; overflow: hidden; text-overflow: ellipsis; }
.btn:disabled { cursor: not-allowed; opacity: 0.4; transform: none; }
/* Lime at partial opacity turns to mud on charcoal. A start button that
   cannot start yet is plainly neutral, and its words say what is missing. */
.btn.primary:disabled { opacity: 1; background: var(--surface); color: var(--fg-muted); box-shadow: inset 0 0 0 1px var(--hairline); font-weight: 600; }
@media (hover: hover) and (pointer: fine) {
  .btn:not(:disabled):hover { background-color: var(--raised-hover); }
  .btn.primary:not(:disabled):hover { background-color: var(--primary-hover); }
  .btn.stop:not(:disabled):hover { background-color: oklch(0.66 0.19 22 / 0.22); }
  .btn.icon-btn:not(:disabled):hover { color: var(--fg); }
}
.btn:focus-visible, .icon:focus-visible, .pill:focus-visible, .dock:focus-visible, .select:focus-visible,
.chip:focus-visible, .link:focus-visible, .tabs button:focus-visible, textarea:focus-visible, input:focus-visible {
  outline: 2px solid var(--primary); outline-offset: 2px;
}
/* Text fields keep theirs: a caret alone is easy to lose. */
:host([data-input="pointer"]) :focus-visible:not(textarea, input[type="text"]) { outline: none; }

/* Apple's continuous corners where the browser can draw them: the curve
   eases into the straight edge instead of meeting it, which is most of why
   a squircle reads as soft. Radii grow to keep the same visual size. */
@supports (corner-shape: squircle) {
  .btn, .select, .chip, .stat, .now, .warning, .update { corner-shape: squircle; }
  .btn { border-radius: 14px; }
  .btn.big { border-radius: 20px; }
  .select { border-radius: 14px; }
  .group { corner-shape: squircle; border-radius: 22px; }
  .panel { corner-shape: squircle; border-radius: 32px; }
  .menu { corner-shape: squircle; border-radius: 20px; }
  .option { corner-shape: squircle; border-radius: 12px; }
  .tabs { corner-shape: squircle; border-radius: 17px; }
  .tab-indicator { corner-shape: squircle; border-radius: 13px; }
  /* The minimise morph travels between two squircles; it has to be one too. */
  .morph { corner-shape: squircle; }
}

/* The start button lives outside the scroll, always in the same place. The
   body fades into it rather than meeting a hard line: only where content
   actually runs under it, and without a blur, which costs the most on the
   machines that draw this panel without a graphics card. */
.actionbar {
  flex: none; position: relative;
  display: grid; gap: 10px;
  padding: 10px var(--pad) var(--pad);
  background: var(--ground);
}
.actionbar::before {
  content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 20px;
  background: linear-gradient(to bottom, oklch(0.17 0.006 75 / 0), var(--ground));
  pointer-events: none;
}
/* On air: a light that breathes, then the clock and the counts. */
.footer {
  display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;
  margin: 0; color: var(--fg-muted); font-size: 11.5px; font-variant-numeric: tabular-nums;
}
.footer::before {
  content: ""; flex: none; width: 7px; height: 7px; border-radius: 999px; background: var(--danger);
  animation: zaalys-onair 2s var(--ease-in-out) infinite;
}
.warning {
  margin: 0; padding: 8px 10px; border-radius: 10px;
  background: oklch(0.83 0.15 80 / 0.12); color: var(--warn); font-size: 12px; line-height: 1.4;
}

/* ------------------------------------------------------------------ select */

/* In a row, an iOS picker row: the value in secondary ink beside a small
   up-and-down chevron, no box around it. The box arrives only under the
   pointer or while its list is open. The plan's picker stands alone, so it
   keeps a field. See picker.ts for the list. */
.select {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  flex: none; min-width: 0; max-width: 60%; height: 30px; margin-right: -8px; padding: 0 8px 0 10px; border-radius: 9px;
  color: var(--fg-muted);
  font-size: 13px; font-weight: 500;
  -webkit-tap-highlight-color: transparent; user-select: none;
  transition: background-color 150ms ease, color 150ms ease, transform var(--spring-press-ms) var(--spring-press);
}
.select:active { transform: scale(0.96); transition-duration: 150ms, 150ms, 90ms; transition-timing-function: ease, ease, var(--ease-out); }
.select[aria-expanded="true"] { background: var(--raised); color: var(--fg); }
.select.wide {
  flex: 1; max-width: none; height: 36px; margin-right: 0; padding: 0 10px 0 12px;
  background: var(--raised); color: var(--fg); font-weight: 550;
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.06), 0 1px 1px rgb(0 0 0 / 0.2);
}
.select-value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* chevron.up.chevron.down, from borders: says "pick one of several" rather
   than "opens downward", which is right whichever way the list opens. */
.select-icon { flex: none; position: relative; width: 8px; height: 12px; color: var(--fg-subtle); }
.select-icon::before, .select-icon::after {
  content: ""; position: absolute; left: 1.5px; width: 4px; height: 4px;
  border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; border-radius: 0 0 1px 0;
}
.select-icon::before { top: 1.5px; rotate: -135deg; }
.select-icon::after { bottom: 1.5px; rotate: 45deg; }
.select.wide .select-icon, .select[aria-expanded="true"] .select-icon { color: var(--fg-muted); }
.select:disabled { cursor: not-allowed; opacity: 0.5; transform: none; }
@media (hover: hover) and (pointer: fine) {
  .select:not(:disabled):hover { background: var(--raised); color: var(--fg); }
  .select.wide:not(:disabled):hover { background: var(--raised-hover); }
}

/* The list. Built once, outside the panel, so a rebuild never closes it.
   It grows out of the edge that touches its button (picker.ts sets the
   origin to the side it opened on) on a spring that lands without bouncing
   about, and leaves faster than it came. Transitions, not keyframes: a
   second click mid-way turns it round from where it is. */
.menu {
  position: fixed; z-index: 2;
  box-sizing: border-box; padding: 5px;
  overflow-y: auto; overscroll-behavior: contain;
  border-radius: 13px;
  background: oklch(0.245 0.007 75);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.08), 0 0 0 1px oklch(1 0 0 / 0.07), 0 18px 44px -12px rgb(0 0 0 / 0.65), 0 4px 12px -4px rgb(0 0 0 / 0.4);
  font-size: 13px; color: var(--fg);
  opacity: 0; transform: scale(0.94); visibility: hidden; pointer-events: none;
  transition: opacity 130ms var(--ease-out), transform 130ms var(--ease-out), visibility 0s linear 130ms;
}
.menu[data-open="pending"] { visibility: visible; transition: none; }
.menu[data-open="true"] {
  opacity: 1; transform: none; visibility: visible; pointer-events: auto;
  transition: opacity 160ms var(--ease-out), transform var(--spring-menu-ms) var(--spring-menu), visibility 0s;
}
.menu[data-instant] { transition-duration: 0s; }
/* The tick sits in its own column on the left, as in every Apple menu, so
   the labels line up whether or not they are the chosen one. */
.option {
  display: flex; align-items: center; gap: 6px;
  min-height: 34px; padding: 6px 12px 6px 6px; border-radius: 8px;
  cursor: pointer; user-select: none;
}
.option-check { order: -1; flex: none; display: grid; place-items: center; width: 18px; color: var(--primary); }
/* No transition on the highlight: it follows the pointer or the arrow keys,
   dozens of times a minute, and a menu that lags its own cursor feels slow. */
.option[data-active] { background: oklch(1 0 0 / 0.08); }
.option[aria-selected="true"] { font-weight: 600; }

/* ------------------------------------------------------- switch and fader */

input[role="switch"] {
  appearance: none; flex: none; cursor: pointer;
  position: relative; width: 44px; height: 26px; margin: 0;
  border-radius: 999px; background: var(--track);
  transition: background-color 180ms ease;
}
input[role="switch"]::after {
  content: ""; position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 999px; background: var(--fg);
  /* The thumb reads as sitting on the track rather than cut into it. */
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.3), 0 1px 1px rgb(0 0 0 / 0.15);
  /* Grows toward the side it is about to travel to while pressed, so the
     switch answers the press before the release flips it. */
  transform-origin: left;
  transition: transform 360ms var(--spring-slide), transform-origin 360ms var(--spring-slide), background-color 150ms ease;
}
input[role="switch"]:checked { background: var(--primary); }
input[role="switch"]:checked::after { transform: translateX(18px); transform-origin: right; background: var(--primary-fg); }
/* On the row, not the input: the whole row is the label, and a press on the
   words never makes the input :active. */
.row.toggle:active input[role="switch"]::after { transform: scaleX(1.15); }
.row.toggle:active input[role="switch"]:checked::after { transform: translateX(18px) scaleX(1.15); }

/* The filled part is the green, and the thumb grows a little under the
   finger. --fill is written by panel.ts as the value changes. */
input[type="range"] {
  appearance: none; -webkit-appearance: none;
  width: 100%; height: 20px; margin: 0; background: transparent; cursor: pointer;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px; border-radius: 999px;
  background: linear-gradient(var(--primary) 0 0) 0 / var(--fill, 50%) 100% no-repeat, var(--track);
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none; -webkit-appearance: none;
  margin-top: -7px; width: 18px; height: 18px; border-radius: 999px;
  background: var(--fg); box-shadow: 0 1px 3px rgb(0 0 0 / 0.35), 0 0 0 0.5px rgb(0 0 0 / 0.2);
  transition: transform 120ms var(--ease-out);
}
input[type="range"]:active::-webkit-slider-thumb { transform: scale(1.15); }
input[type="range"]::-moz-range-track { height: 4px; border-radius: 999px; background: var(--track); }
input[type="range"]::-moz-range-progress { height: 4px; border-radius: 999px; background: var(--primary); }
input[type="range"]::-moz-range-thumb {
  width: 18px; height: 18px; border: none; border-radius: 999px;
  background: var(--fg); box-shadow: 0 1px 3px rgb(0 0 0 / 0.35);
}

/* ------------------------------------------------------- chips and words */

.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  all: unset; cursor: pointer;
  padding: 6px 11px; border-radius: 999px;
  background: var(--raised); color: var(--fg-muted);
  font-size: 12px; font-weight: 600;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 150ms ease, color 150ms ease, transform var(--spring-press-ms) var(--spring-press);
}
.chip:active { transform: scale(0.95); transition-duration: 150ms, 150ms, 90ms; transition-timing-function: ease, ease, var(--ease-out); }
.chip.on { background: var(--primary); color: var(--primary-fg); }
@media (hover: hover) and (pointer: fine) { .chip:not(.on):hover { color: var(--fg); background: var(--raised-hover); } }

.words, textarea {
  width: 100%; min-height: 56px; resize: vertical; margin: 0;
  padding: 8px 10px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--ground); color: var(--fg);
  font: inherit; font-size: 12.5px; line-height: 1.4;
}

/* ------------------------------------------------------------------ live */

/* What the live has made. Four tiles, tabular figures, no colour: it is a
   readout, and a readout that decorates itself is harder to read. */
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat { display: grid; gap: 2px; padding: 10px 12px; border-radius: 12px; background: var(--surface); }
.stat-label { font-size: 11px; font-weight: 600; color: var(--fg-muted); }
.stat-value { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.now { display: grid; gap: 6px; padding: 10px 12px; border-radius: 12px; background: var(--surface); }
.now p { margin: 0; }
.now-product { font-size: 12.5px; font-weight: 600; }
.now-label {
  display: block; margin-bottom: 2px;
  font-size: 10.5px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-subtle);
}
.speaking {
  color: var(--fg-muted); font-size: 12px; font-style: italic;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

/* -------------------------------------------------------------------- log */

.log li {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px;
  padding: 8px 12px; font-size: 12px; line-height: 1.4; overflow-wrap: anywhere;
}
.log time { color: var(--fg-subtle); font: 11px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
/* A busy chat adds lines every few seconds: a fade and no movement, or the
   list would never sit still long enough to read. */
.log li[data-enter] { transition: opacity 200ms ease; @starting-style { opacity: 0; } }
.empty { margin: 0; padding: 28px 12px; text-align: center; color: var(--fg-muted); font-size: 12.5px; }

/* ------------------------------------------------------- update and keys */

/* A new version. Green, not amber: it is good news, not a problem. */
.update {
  flex: none;
  display: grid; gap: 8px; margin: 12px var(--pad) 0; padding: 10px 12px; border-radius: 12px;
  background: oklch(0.86 0.19 128 / 0.07); box-shadow: inset 0 0 0 1px oklch(0.86 0.19 128 / 0.22);
  font-size: 12px;
}
.update-head { display: flex; align-items: baseline; gap: 8px; }
.update-head > * { white-space: nowrap; }
.update-head strong { font-size: 12.5px; font-weight: 600; }
.update-head small {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;
  color: var(--fg-muted); font-size: 11.5px; font-variant-numeric: tabular-nums;
}
.update-head .link { margin-left: auto; }
.update ol { margin: 0; padding-left: 18px; display: grid; gap: 6px; color: var(--fg-muted); line-height: 1.4; }
.update ol strong { color: var(--fg); font-weight: 600; }
.update ol .btn { margin-left: 4px; height: 26px; vertical-align: middle; text-decoration: none; }
.update > .btn { justify-self: start; text-decoration: none; }
.update .note { margin: 0; color: var(--fg-muted); font-size: 11.5px; line-height: 1.4; }
.update .note.warn { color: var(--warn); }

.activate { display: grid; gap: 12px; padding-top: 4px; }
.activate h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.015em; }
.activate p { margin: 0; color: var(--fg-muted); font-size: 12.5px; line-height: 1.45; }
.activate a { color: var(--primary); text-underline-offset: 2px; }
.activate input {
  all: unset; box-sizing: border-box; width: 100%; height: 42px; padding: 0 12px; border-radius: 10px;
  background: var(--surface); box-shadow: inset 0 0 0 1px var(--border);
  font: 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--fg);
}
.activate input::placeholder { color: var(--fg-subtle); }
.activate .btn.big { margin-top: 2px; }
.activate .link { justify-self: center; }
.error { margin: 0; color: var(--danger-fg); font-size: 12px; line-height: 1.4; }

.foot { display: grid; justify-items: center; gap: 6px; padding-top: 4px; }
.version { font-size: 11px; color: var(--fg-subtle); font-variant-numeric: tabular-nums; }
.link {
  all: unset; cursor: pointer; font-size: 11.5px; color: var(--fg-muted);
  text-decoration: underline; text-decoration-color: oklch(1 0 0 / 0.25); text-underline-offset: 3px;
  transition: color 150ms ease;
}
@media (hover: hover) and (pointer: fine) { .link:hover { color: var(--fg); } }

/* ---------------------------------------------------------- pill and dock */

/* The pill is the same object as the panel, so it arrives the way the panel
   left: from the same corner, over the same curve. */
.pill {
  all: unset; box-sizing: border-box; cursor: grab; touch-action: none;
  display: none; align-items: center; gap: 8px;
  padding: 9px 14px 9px 11px; border-radius: 999px;
  background: var(--ground); box-shadow: ${"inset 0 1px 0 0 oklch(1 0 0 / 0.07), 0 0 0 1px oklch(0 0 0 / 0.35), 0 24px 56px -16px rgb(0 0 0 / 0.55), 0 8px 18px -8px rgb(0 0 0 / 0.35)"};
  font-size: 12.5px; font-weight: 650; letter-spacing: -0.005em; color: var(--fg);
  -webkit-tap-highlight-color: transparent;
  opacity: 1; transform: scale(1); transform-origin: bottom right;
  transition: transform 160ms var(--ease-out), background-color 150ms ease;
}
.pill .mark { width: 16px; height: 16px; }
.pill:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { .pill:hover { background: var(--surface); } }
:host([data-collapsed="true"]) .pill {
  display: inline-flex;
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out), background-color 150ms ease,
    display 200ms allow-discrete;
  @starting-style { opacity: 0; transform: scale(0.94); }
}

/* The phone sheet's own handle: a tab above its top edge, outside the
   content, that folds the sheet into the pill wherever it is scrolled to. */
.dock {
  all: unset; box-sizing: border-box;
  position: absolute; top: -30px; right: 16px;
  display: none; place-items: center;
  width: 52px; height: 30px;
  border-radius: 12px 12px 0 0;
  background: var(--ground); color: var(--fg-muted);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.07), 0 -6px 16px -8px rgb(0 0 0 / 0.4);
  cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  transition: color 150ms ease;
}
.dock::after { content: ""; position: absolute; inset: -8px -6px 0; }
.dock::before {
  content: ""; width: 7px; height: 7px; margin-top: -4px;
  border-right: 1.8px solid currentColor; border-bottom: 1.8px solid currentColor; border-radius: 0 0 1px 0;
  rotate: 45deg;
}
.dock:active { color: var(--fg); }
:host([data-sheet]) .dock { display: grid; }
:host([data-collapsed="true"]) .dock, :host([data-morphing]) .dock { display: none; }

/* Minimising and opening: one surface travels between the panel's box and
   the pill's, and the real one fades in under it as it lands. */
:host([data-morphing]) .panel, :host([data-morphing]) .pill { transition: none; }
.morph {
  position: fixed; z-index: 1; pointer-events: none;
  background: var(--ground);
  box-shadow: ${"inset 0 1px 0 0 oklch(1 0 0 / 0.07), 0 0 0 1px oklch(0 0 0 / 0.35), 0 24px 56px -16px rgb(0 0 0 / 0.55), 0 8px 18px -8px rgb(0 0 0 / 0.35)"};
}
:host([data-dragging]) .panel, :host([data-dragging]) .pill { cursor: grabbing; user-select: none; }
/* Dragging sets left/top every pointermove: a transition would lag behind the cursor. */
:host([data-dragging]) .panel { transition: none; }

/* --------------------------------------------------------- on air & sales */

/* The on-air dot. A CSS animation, not JS: the main thread is busy driving the
   live, and a predetermined loop like this runs off it and cannot drop frames.
   Slow and shallow on purpose — it is a status light, not a thing to look at. */
@keyframes zaalys-onair {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.85); }
}
.onair {
  display: inline-block; width: 7px; height: 7px; border-radius: 999px;
  background: var(--primary); flex: 0 0 auto;
}
.onair[data-live="true"] { animation: zaalys-onair 2s var(--ease-in-out) infinite; }

/* A sale. The one moment in a live worth interrupting the eye for, and rare
   enough to spend the budget on: the panel edge rings once (panel.ts) and the
   count that moved bumps. */
.sale-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; padding: 1px 7px; border-radius: 999px;
  background: var(--surface); color: var(--fg);
  font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums;
  transition: transform 200ms var(--ease-out), color 200ms ease, background-color 200ms ease;
}
.sale-count[data-bumped="true"] { transform: scale(1.18); color: var(--primary); background: oklch(0.86 0.19 128 / 0.16); }

/* ------------------------------------------------------------ adaptation */

/* A phone: a sheet along the bottom edge, the full width of the screen, low
   enough that TikTok's preview stays in view above it. It is not dragged;
   minimised, it is the pill in the corner. */
:host([data-sheet]) {
  left: max(8px, var(--safe-left));
  right: max(8px, var(--safe-right));
  bottom: max(8px, var(--safe-bottom));
}
:host([data-sheet][data-collapsed="true"]) { left: auto; }
:host([data-sheet]) .panel {
  width: auto; max-width: none;
  max-height: min(60vh, 520px); max-height: min(60dvh, 520px);
  border-radius: 20px;
  transform-origin: bottom center;
  --pad: 12px;
}
:host([data-sheet]) .panel[data-screen="main"] { height: min(60vh, 520px); height: min(60dvh, 520px); }
:host([data-sheet]) header { cursor: default; touch-action: manipulation; }

/* Fingers: every target at least 44px, and text fields at 16px so iOS does
   not zoom the page when one is focused. */
@media (pointer: coarse) {
  .icon { width: 44px; height: 44px; margin: -8px -8px -8px 0; }
  .btn { height: 38px; padding: 0 14px; font-size: 13px; }
  .btn.big { height: 48px; }
  .btn.icon-btn { width: 40px; height: 40px; }
  .select { height: 38px; font-size: 13px; }
  .select.wide { height: 40px; }
  .option { min-height: 44px; font-size: 13.5px; }
  .tabs button { padding: 10px 0; font-size: 13px; }
  .row { min-height: 52px; }
  .chip { padding: 9px 14px; font-size: 13px; }
  .pill { min-height: 44px; padding: 12px 18px 12px 14px; font-size: 13.5px; }
  .link { display: inline-block; padding: 8px 10px; margin: -4px -6px; font-size: 12.5px; }
  .words, textarea, .activate input { font-size: 16px; }
}

/* A short window: the same panel, tighter. Still capped by the room actually
   left below it, or a panel dragged around looking for space hangs off the
   bottom edge. */
@media (max-height: 600px) {
  :host { --pad: 12px; }
  .panel, .panel[data-screen="main"] { border-radius: 16px; }
  .panel { max-height: min(var(--panel-max-height, 520px), 92vh, 520px); max-height: min(var(--panel-max-height, 520px), 92dvh, 520px); }
  .panel[data-screen="main"] { height: min(var(--panel-max-height, 520px), 92vh, 520px); height: min(var(--panel-max-height, 520px), 92dvh, 520px); }
  .body { gap: 12px; padding-top: 10px; }
  .tabs { margin-top: 10px; }
  .row { min-height: 40px; padding: 8px 12px; }
  .check { padding: 9px 12px; }
  .btn.big { height: 40px; }
}

@media (max-width: 380px) {
  :host { --pad: 12px; }
  .tabs button { font-size: 12px; }
  .wordmark { font-size: 13.5px; }
}

@media (prefers-contrast: more) {
  :host { --hairline: oklch(1 0 0 / 18%); --border: oklch(1 0 0 / 24%); --fg-muted: oklch(0.82 0.008 75); --fg-subtle: oklch(0.74 0.008 75); }
  .group, .stat, .now { box-shadow: inset 0 0 0 1px var(--border); }
}

/* Fewer and gentler, not none: colour and opacity still say what changed;
   nothing travels, scales or cascades. */
@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity 150ms ease; transform: none; @starting-style { transform: none; } }
  /* The pill fades in where it is; it does not grow into place. */
  :host([data-collapsed="true"]) .pill {
    transition: opacity 200ms ease, background-color 150ms ease, display 200ms allow-discrete;
    @starting-style { opacity: 0; transform: none; }
  }
  .body[data-intro] > * { animation: none; }
  .menu, .menu[data-open="true"] { transform: none; }
  .select-icon { transition: none; }
  /* The switch still changes colour; the thumb just stops travelling. */
  input[role="switch"]::after { transition: background-color 150ms ease; }
  .row.toggle:active input[role="switch"]::after { transform: none; }
  .row.toggle:active input[role="switch"]:checked::after { transform: translateX(18px); }
  /* Revealed rows fade in place; the height snaps. panel.ts skips the fold. */
  .group > [data-enter] { transition: opacity 150ms ease; }
  .check[data-enter] .dot { transition: background-color 200ms ease, box-shadow 200ms ease, color 200ms ease; }
  .check[data-enter] .dot path { animation: none; stroke-dashoffset: 0; }
  /* The pill still marks the tab, it just stops travelling to it. panel.ts
     skips the slide as well, so nothing animates it from the other side. */
  .tab-indicator { transition: none; }
  input[type="range"]:active::-webkit-slider-thumb { transform: none; }
  .btn:active, .select:active, .chip:active, .pill:active, .icon:active { transform: none; }
  .footer::before { animation: none; }
  /* Keep the meaning, drop the movement: the dot still reads as on-air by
     fading, and a sale still marks itself in colour, without anything moving. */
  .onair[data-live="true"] { animation: none; opacity: 0.75; }
  .sale-count[data-bumped="true"] { transform: none; }
}
`;
  var ki = new Map();
  function ds(e, t) {
    let n = ki.get(t);
    if (!n || n.ownerDocument !== e) {
      let o = e.createElement("template");
      (o.innerHTML = t), (n = o.content.firstChild), ki.set(t, n);
    }
    return n.cloneNode(!0);
  }
  var Ee = 8,
    ht = 6,
    ps = 0;
  class wn {
    root;
    onClose;
    menu;
    current = null;
    typed = "";
    typedAt = 0;
    id = `zl-picker-${++ps}`;
    constructor(e, t = () => {}) {
      this.root = e;
      this.onClose = t;
      let n = e.ownerDocument ?? document;
      (this.menu = n.createElement("div")),
        (this.menu.className = "menu"),
        (this.menu.id = this.id),
        this.menu.setAttribute("role", "listbox"),
        (this.menu.dataset.open = "false"),
        this.menu.addEventListener("pointerdown", (i) => i.preventDefault()),
        this.menu.addEventListener("pointermove", (i) => {
          let r = this.indexOf(i.target);
          if (r >= 0 && this.current && r !== this.current.active)
            this.highlight(r);
        }),
        this.menu.addEventListener("click", (i) => {
          let r = this.indexOf(i.target);
          if (r >= 0) this.pick(r);
        }),
        e.append(this.menu);
      let o = n.defaultView ?? window;
      o.addEventListener(
        "pointerdown",
        (i) => {
          if (!this.current) return;
          let r = i.composedPath();
          if (!r.includes(this.menu) && !r.includes(this.current.anchor))
            this.close();
        },
        !0,
      ),
        o.addEventListener("resize", () => this.close());
    }
    get isOpen() {
      return this.current !== null;
    }
    trigger(e) {
      let t = this.menu.ownerDocument,
        n = t.createElement("button");
      (n.type = "button"),
        (n.className = `select${e.className ? ` ${e.className}` : ""}`),
        n.setAttribute("role", "combobox"),
        n.setAttribute("aria-haspopup", "listbox"),
        n.setAttribute("aria-expanded", "false"),
        n.setAttribute("aria-controls", this.id);
      let o = (h) =>
        n.setAttribute("aria-label", h ? `${e.label}: ${h}` : e.label);
      if (e.key) n.dataset.key = e.key;
      if (e.title) n.title = e.title;
      n.disabled = Boolean(e.disabled);
      let i = t.createElement("span");
      i.className = "select-value";
      let r = e.options.find((h) => h.value === e.value);
      (i.textContent = r?.label ?? e.options[0]?.label ?? ""), o(i.textContent);
      let l = t.createElement("span");
      (l.className = "select-icon"),
        l.setAttribute("aria-hidden", "true"),
        n.append(i, l);
      let s = {
          anchor: n,
          options: e.options,
          choose: (h) => {
            if (
              ((i.textContent =
                e.options.find((g) => g.value === h)?.label ?? ""),
              o(i.textContent),
              h !== e.value)
            )
              e.onChange(h);
          },
        },
        c = () =>
          Math.max(
            0,
            e.options.findIndex((h) => h.value === e.value),
          ),
        d = () => {
          if (this.current?.anchor === n) this.close();
          else this.show({ ...s, active: c() });
        },
        p = !1;
      return (
        n.addEventListener("pointerdown", (h) => {
          if (h.pointerType !== "mouse" || h.button !== 0 || n.disabled) return;
          h.preventDefault(), n.focus({ preventScroll: !0 }), (p = !0), d();
        }),
        n.addEventListener("click", () => {
          if (p) return void (p = !1);
          if (!n.disabled) d();
        }),
        n.addEventListener("keydown", (h) =>
          this.onKey(h, n, { ...s, active: c() }),
        ),
        n
      );
    }
    follow(e) {
      let t = this.current?.anchor;
      if (!t) return;
      let n = t.getBoundingClientRect();
      if (!t.isConnected || n.bottom < e.top || n.top > e.bottom) this.close();
      else this.place(t);
    }
    close(e = !1, t = !0) {
      let n = this.current;
      if (!n) return;
      if (
        ((this.current = null),
        (this.typed = ""),
        (this.menu.dataset.open = "false"),
        n.anchor.setAttribute("aria-expanded", "false"),
        n.anchor.removeAttribute("aria-activedescendant"),
        e && n.anchor.isConnected)
      )
        n.anchor.focus({ preventScroll: !0 });
      if (t) this.onClose();
    }
    show(e, t = !1) {
      if (this.current) this.close();
      this.current = e;
      let n = this.menu.ownerDocument;
      this.menu.replaceChildren(
        ...e.options.map((o, i) => {
          let r = n.createElement("div");
          (r.className = "option"),
            (r.id = `${this.id}-${i}`),
            r.setAttribute("role", "option"),
            (r.dataset.index = String(i));
          let l = i === e.active;
          r.setAttribute("aria-selected", String(l));
          let s = n.createElement("span");
          s.textContent = o.label;
          let c = n.createElement("span");
          if (((c.className = "option-check"), l))
            c.append(
              ds(
                n,
                '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              ),
            );
          return r.append(s, c), r;
        }),
      ),
        this.place(e.anchor),
        e.anchor.setAttribute("aria-expanded", "true"),
        this.highlight(e.active),
        this.menu.toggleAttribute("data-instant", t),
        (this.menu.dataset.open = "pending"),
        this.menu.offsetWidth,
        (this.menu.dataset.open = "true");
    }
    place(e) {
      let t = this.menu.ownerDocument.defaultView ?? window,
        n = t.visualViewport?.width ?? t.innerWidth,
        o = t.visualViewport?.height ?? t.innerHeight,
        i = e.getBoundingClientRect(),
        r = this.menu.style;
      (r.width = "max-content"),
        (r.minWidth = `${Math.min(Math.max(i.width, 180), n - Ee * 2)}px`),
        (r.maxWidth = `${Math.min(320, n - Ee * 2)}px`);
      let l = this.menu.offsetWidth,
        s = Math.min(Math.max(Ee, i.right - l), n - l - Ee),
        c = o - i.bottom - ht - Ee,
        d = i.top - ht - Ee,
        p = this.menu.scrollHeight || 240,
        h = c >= Math.min(p, 220) || c >= d,
        g = Math.max(120, h ? c : d),
        y = this.menu.style;
      if (((y.left = `${s}px`), (y.maxHeight = `${Math.min(g, 320)}px`), h))
        (y.top = `${i.bottom + ht}px`), (y.bottom = "auto");
      else (y.top = "auto"), (y.bottom = `${o - i.top + ht}px`);
      this.menu.dataset.side = h ? "bottom" : "top";
      let P = i.right - s > l / 2 ? "right" : "left";
      y.transformOrigin = `${h ? "top" : "bottom"} ${P}`;
    }
    highlight(e) {
      let t = this.current;
      if (!t) return;
      t.active = e;
      for (let o of this.menu.children)
        o.toggleAttribute("data-active", o.id === `${this.id}-${e}`);
      t.anchor.setAttribute("aria-activedescendant", `${this.id}-${e}`);
      let n = this.menu.children[e];
      if (n) {
        let o = n.offsetTop,
          i = o + n.offsetHeight;
        if (o < this.menu.scrollTop) this.menu.scrollTop = o - 4;
        else if (i > this.menu.scrollTop + this.menu.clientHeight)
          this.menu.scrollTop = i - this.menu.clientHeight + 4;
      }
    }
    pick(e) {
      let t = this.current;
      if (!t) return;
      let n = t.options[e];
      if ((this.close(!0, !1), n)) t.choose(n.value);
      this.onClose();
    }
    indexOf(e) {
      let t = e?.closest?.(".option");
      return t ? Number(t.dataset.index) : -1;
    }
    onKey(e, t, n) {
      if (t.disabled || e.isComposing) return;
      let o = this.current?.anchor === t ? this.current : null,
        i = n.options.length - 1,
        r = !0;
      if (!o)
        if (
          ["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(e.key)
        ) {
          if ((this.show(n, !0), e.key === "Home")) this.highlight(0);
          if (e.key === "End") this.highlight(i);
        } else if (e.key.length === 1 && /\S/.test(e.key))
          this.show(n, !0), this.typeAhead(e.key);
        else r = !1;
      else
        switch (e.key) {
          case "ArrowDown":
            this.highlight(Math.min(i, o.active + 1));
            break;
          case "ArrowUp":
            this.highlight(Math.max(0, o.active - 1));
            break;
          case "Home":
          case "PageUp":
            this.highlight(0);
            break;
          case "End":
          case "PageDown":
            this.highlight(i);
            break;
          case "Enter":
          case " ":
            this.pick(o.active);
            break;
          case "Escape":
            this.close(!0);
            break;
          case "Tab":
            this.close(), (r = !1);
            break;
          default:
            if (e.key.length === 1 && /\S/.test(e.key)) this.typeAhead(e.key);
            else r = !1;
        }
      if (r) e.preventDefault();
      e.stopPropagation();
    }
    typeAhead(e) {
      let t = this.current;
      if (!t) return;
      let n = Date.now();
      (this.typed = n - this.typedAt > 700 ? e : this.typed + e),
        (this.typedAt = n);
      let o = Si(this.typed),
        i = t.options.length;
      for (let r = this.typed.length > 1 ? 0 : 1; r <= i; r++) {
        let l = (t.active + r) % i;
        if (Si(t.options[l].label).startsWith(o)) return this.highlight(l);
      }
    }
  }
  var Si = (e) =>
    e
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  class yn {
    deps;
    relaying = !1;
    timer = null;
    stopped = !1;
    releaseWait = null;
    constructor(e) {
      this.deps = e;
    }
    get busy() {
      return this.relaying;
    }
    async relay(e) {
      if (this.relaying || this.stopped) return;
      this.relaying = !0;
      try {
        if (e !== "dropped") {
          let o = await this.deps.endLive();
          if (this.stopped) return;
          if (!o) {
            (this.stopped = !0),
              this.deps.onGaveUp(
                "não consegui confirmar o encerramento da LIVE",
              );
            return;
          }
          this.deps.log("⏹️ Live encerrada para recomeçar");
        }
        if (
          (await new Promise((o) => {
            (this.releaseWait = o),
              (this.timer = setTimeout(o, this.deps.gapSeconds * 1000));
          }),
          this.stopped)
        )
          return;
        let t;
        try {
          t = this.deps.mayOpen
            ? await this.deps.mayOpen()
            : "checagem de proteção indisponível";
        } catch {
          t =
            "não consegui verificar a proteção da conta; confira o TikTok antes de retomar";
        }
        if (this.stopped) return;
        if (t) {
          this.deps.log(`⛔ Modo infinito parou: ${t}`),
            (this.stopped = !0),
            this.deps.onGaveUp(t);
          return;
        }
        let n = await this.deps.startLive();
        if (this.stopped) return;
        if (!n) {
          (this.stopped = !0),
            this.deps.onGaveUp(
              "não consegui confirmar que a próxima LIVE entrou no ar",
            ),
            this.deps.log(
              "Não consegui abrir a próxima live. Abra uma e ligue o painel de novo.",
            );
          return;
        }
        this.deps.log("▶️ Próxima live aberta"), this.deps.onRestarted();
      } finally {
        (this.releaseWait = null), (this.relaying = !1);
      }
    }
    stop() {
      if (((this.stopped = !0), this.releaseWait?.(), this.timer !== null))
        clearTimeout(this.timer), (this.timer = null);
    }
  }
  class Sn {
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
  var xn = (e) =>
      e.includes("webcast/eco/violation_list") ||
      e.includes("live/get_violation_detail") ||
      e.includes("live/check_risk_permission"),
    kn = (e) => (e && typeof e === "object" && !Array.isArray(e) ? e : null);
  function hs(e) {
    if (!Array.isArray(e)) return "";
    let t = [];
    for (let n of e.slice(0, 3)) {
      let o = kn(n);
      if (!o) continue;
      let i = [
        "policy_name",
        "violation_reason",
        "reason",
        "punish_reason",
        "title",
        "policy",
        "rule_name",
        "description",
      ]
        .map((r) => o[r])
        .find((r) => typeof r === "string" && r.trim().length > 0);
      if (i) t.push(i.trim());
    }
    return [...new Set(t)].join("; ");
  }
  function ms(e, t) {
    if (!xn(e)) return null;
    let n;
    try {
      n = kn(JSON.parse(t));
    } catch {
      return null;
    }
    if (!n) return null;
    let o = kn(n.data);
    if (e.includes("live/check_risk_permission")) {
      let c = { ...n, ...(o ?? {}) };
      if (c.allow === !1 || c.allowed === !1 || c.can_live === !1)
        return {
          kind: "blocked",
          reason: typeof c.reason === "string" ? c.reason : "sem motivo",
        };
      return null;
    }
    if (!o) return null;
    let i = o.violation_list ?? o.violations ?? o.records,
      r = typeof o.active_count === "number" ? o.active_count : null,
      l = Array.isArray(i) && i.length > 0;
    if (
      e.includes("webcast/eco/violation_list")
        ? !(r && r > 0)
        : !(l || (r && r > 0))
    )
      return null;
    return {
      kind: "violation",
      text: hs(i) || `${r ?? 1} restrição(ões) ativa(s) na conta`,
      active: e.includes("webcast/eco/violation_list") ? r : null,
    };
  }
  function $c(e, t) {
    let n = (l, s) => {
        let c = ms(l, s);
        if (c) t(c);
      },
      o = e.fetch.bind(e),
      i = async (...l) => {
        let s = await o(...l);
        try {
          let c = l[0],
            d = typeof c === "string" ? c : c instanceof URL ? c.href : c.url;
          if (xn(d))
            s.clone()
              .text()
              .then(
                (p) => n(d, p),
                () => {},
              );
        } catch {}
        return s;
      };
    e.fetch = i;
    let r = e.XMLHttpRequest.prototype.open;
    e.XMLHttpRequest.prototype.open = function (l, s, ...c) {
      let d = String(s);
      if (xn(d))
        this.addEventListener("load", () => {
          if (typeof this.responseText === "string") n(d, this.responseText);
        });
      return r.call(this, l, s, ...c);
    };
  }
  var Ei = [
      ["auto", "Automática (recomendado)"],
      ["alta", "Alta (1080p)"],
      ["leve", "Leve (720p, para computador lento)"],
    ],
    fs = /swiftshader|llvmpipe|softpipe|software|basic render/i;
  function En(e) {
    if (e.renderer && fs.test(e.renderer))
      return "o navegador está desenhando sem placa de vídeo";
    if (e.cores && e.cores <= 4) return `o processador tem ${e.cores} núcleos`;
    if (e.memoryGb && e.memoryGb <= 4)
      return `o computador tem ${e.memoryGb} GB de memória`;
    return null;
  }
  function Ti(e, t) {
    if (e === "alta") return { tier: 0, adaptive: !1 };
    if (e === "leve") return { tier: Qt, adaptive: !0 };
    return { tier: En(t) ? Qt : 0, adaptive: !0 };
  }
  function Ai() {
    let e = navigator,
      t = { cores: e.hardwareConcurrency, memoryGb: e.deviceMemory };
    try {
      let n = document.createElement("canvas").getContext("webgl");
      if (n) {
        let o = n.getExtension("WEBGL_debug_renderer_info");
        (t.renderer = String(
          n.getParameter(o ? o.UNMASKED_RENDERER_WEBGL : n.RENDERER) ?? "",
        )),
          n.getExtension("WEBGL_lose_context")?.loseContext();
      }
    } catch {}
    return t;
  }
  var Tn =
    "";
  var Ci = 1800000,
    Mi = 25000,
    Pi = (e) => "update_url" in e,
    Li = (e) => e.split(".").map((t) => Number.parseInt(t, 10) || 0);
  function An(e, t) {
    let n = Li(e),
      o = Li(t);
    for (let i = 0; i < Math.max(n.length, o.length); i++) {
      let r = (n[i] ?? 0) - (o[i] ?? 0);
      if (r) return r > 0;
    }
    return !1;
  }
  var Ln = {
    minVersion: "0.0.0",
    off: { relay: !1, comments: !1, replies: !1, life: !1 },
    violationPhrases: [],
    notice: null,
  };
  function Ri(e) {
    let t = e && typeof e === "object" ? e : {},
      n = t.off && typeof t.off === "object" ? t.off : {},
      o = (r) => n[r] === !0,
      i = Array.isArray(t.violationPhrases)
        ? t.violationPhrases
            .filter(
              (r) => typeof r === "string" && r.length > 0 && r.length <= 200,
            )
            .slice(0, 30)
        : [];
    return {
      minVersion:
        typeof t.minVersion === "string" && /^\d+(\.\d+)*$/.test(t.minVersion)
          ? t.minVersion
          : Ln.minVersion,
      off: {
        relay: o("relay"),
        comments: o("comments"),
        replies: o("replies"),
        life: o("life"),
      },
      violationPhrases: i,
      notice:
        typeof t.notice === "string" && t.notice.trim()
          ? t.notice.trim().slice(0, 240)
          : null,
    };
  }
  function mt(e, t) {
    return !An(t.minVersion, e);
  }
  function Oi(e, t) {
    return {
      ...e,
      relayAfter: t.off.relay ? 0 : e.relayAfter,
      comments: t.off.comments ? !1 : e.comments,
      answer: t.off.replies ? !1 : e.answer,
    };
  }
  var Xi = "http://localhost:3000/painel/configuracoes",
    I = chrome.runtime.getManifest().version,
    $n = Pi(chrome.runtime.getManifest()),
    Zi =
      matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 1,
    gs = "http://localhost:3000/painel/live",
    vs = "zaalys-live";
  function Yi(e, t) {
    return new Promise((n, o) => {
      let i = indexedDB.open(vs, 2);
      (i.onupgradeneeded = () => {
        if (!i.result.objectStoreNames.contains("files"))
          i.result.createObjectStore("files");
      }),
        (i.onerror = () => o(i.error)),
        (i.onsuccess = () => {
          let r = t(i.result.transaction("files", e).objectStore("files"));
          (r.onsuccess = () => n(r.result)), (r.onerror = () => o(r.error));
        });
    });
  }
  var bs = (e) => Yi("readwrite", (t) => t.put(e, "clips")),
    ws = () => Yi("readonly", (e) => e.get("clips")),
    Ji = {
      planId: null,
      collapsed: !1,
      tab: "inicio",
      position: null,
      auto: nt,
      audio: Se,
      video: "auto",
    },
    m = Ji,
    H = () => void chrome.storage.local.set({ panelSettings: m });
  function u(e, t = {}, ...n) {
    let o = document.createElement(e);
    for (let [i, r] of Object.entries(t)) o.setAttribute(i, r);
    return o.append(...n.filter((i) => Boolean(i))), o;
  }
  var ys = (e) => {
      let t = Math.max(0, Math.round(e / 1000)),
        n = Math.floor(t / 3600),
        o = Math.floor((t % 3600) / 60),
        i = t % 60;
      return n
        ? `${n}:${String(o).padStart(2, "0")}:${String(i).padStart(2, "0")}`
        : `${o}:${String(i).padStart(2, "0")}`;
    },
    Gn = "cubic-bezier(0.23, 1, 0.32, 1)",
    xs =
      "linear(0, 0.0501, 0.1599, 0.2891, 0.4163, 0.531, 0.6294, 0.7109, 0.7768, 0.8292, 0.8702, 0.902, 0.9264, 0.9449, 0.959, 0.9695, 0.9775, 0.9834, 0.9878, 0.991, 0.9934, 0.9952, 0.9965, 0.9974, 1)",
    St = () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    Dn = 0,
    Ii = 0;
  function ft(e) {
    Dn = Math.max(Dn, performance.now() + e);
  }
  function Wn(e = 180) {
    ft(e), x();
  }
  var jn = [],
    ks =
      '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>',
    er =
      '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M25 75V25L50 55L75 25V75" fill="none" stroke="currentColor" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    Ss =
      '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.46-3.54M13 3v2.5h-2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    _i = new Map();
  function tr(e) {
    let t = _i.get(e);
    if (!t) {
      let n = document.createElement("template");
      (n.innerHTML = e), (t = n.content.firstChild), _i.set(e, t);
    }
    return t.cloneNode(!0);
  }
  function Kn(e, t, n = {}) {
    let o = u(e, n);
    return o.append(tr(t)), o;
  }
  var a = {
      screen: "loading",
      account: "",
      storedKey: null,
      activateError: "",
      activating: !1,
      plans: [],
      plan: null,
      planError: "",
      narrationReady: !1,
      clipNames: [],
      clipKind: null,
      clipFor: "",
      cameraInUse: !1,
      running: !1,
      starting: !1,
      sessionId: null,
      nowSpeaking: "",
      passage: "",
      audioFile: "",
      nowProduct: "",
      log: [],
      update: null,
      updateOpen: !1,
      orphaned: !1,
      duplicate: !1,
      violations: null,
    },
    me = Ln,
    ve = () => Oi(m.auto, me),
    W = null;
  function nr() {
    return Boolean(W?.busy || W?.waiting(K()) || re.engaged(K()));
  }
  function gt() {
    k.pauseComments(w || nr());
  }
  var D = new sn({ tier: 0, adaptive: !1 }),
    Cn = null,
    or = 0;
  function ir(e) {
    Cn ??= Ai();
    let t = Ti(m.video, Cn);
    (or = t.tier), D.setQuality(t);
    let n = m.video === "auto" ? En(Cn) : null;
    if (e && n) f(`\uD83C\uDF9E️ Vídeo em 720p desde o início: ${n}.`);
  }
  D.onQuality = (e, t) => {
    if (e <= or) return;
    f(
      `\uD83C\uDF9E️ O computador não estava dando conta: vídeo agora em ${t.width}p a ${t.fps} fps, para a live não travar.`,
    );
  };
  var E = new un(),
    re = new gn(async (e) => {
      let t = await b.direct(e);
      return t.ok ? t.data : null;
    }),
    O = new ln(),
    Q = new cn(),
    k = new Vt({
      log: (e) => f(e),
      onComment: (e) => W?.mine(e),
      alert: (e) => ge(e),
      onSale: () => {
        if (w) return;
        E.celebrate(), Ts();
      },
      onEnded: (e) => void Pe(e),
      onRelay: (e) => void As(e),
      onFlash: (e) => {
        if (((G = e), Et(), e)) O.play("arm");
        x();
      },
    }),
    G = null,
    rr = (e) => (e == null ? void 0 : ro(e));
  function Et() {
    if (!a.running) return D.show({});
    let e = a.nowProduct || a.plan?.product.title || "";
    D.show({
      title: e,
      price: G && !G.price ? void 0 : rr(a.plan?.product.priceCents),
      offerPrice: G?.price,
      until: G?.endsAt,
    });
  }
  function ar(e) {
    if (G?.title && G.title !== e) k.closeFlash("product");
  }
  function Es() {
    if (!a.running) {
      O.play("error"),
        f(
          "⚡ A oferta relâmpago aparece sobre o vídeo da live: ligue a live automática primeiro e toque de novo.",
        );
      return;
    }
    let e = a.nowProduct || a.plan?.product.title || "",
      t = a.nowProduct ? void 0 : rr(a.plan?.product.priceCents);
    if (!k.openFlash(t === void 0 ? { title: e } : { title: e, price: t })) {
      O.play("error"),
        f("Já tem uma oferta na tela. Tire aquela antes de mostrar outra.");
      return;
    }
    x(!0);
  }
  function je() {
    D.setDisclosure(
      Xo({
        on: !0,
        voiceOnAir: m.audio.voiceOn,
        realFootage: a.clipKind === "real",
      }),
    );
  }
  function Ts() {
    if (
      (O.play("sale"), matchMedia("(prefers-reduced-motion: reduce)").matches)
    )
      return;
    (m.collapsed ? he : oe).animate(
      [
        { boxShadow: `${bn}, 0 0 0 0 oklch(0.86 0.19 128 / 0.55)` },
        { boxShadow: `${bn}, 0 0 0 14px oklch(0.86 0.19 128 / 0)` },
      ],
      { duration: 620, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "none" },
    );
    let t = oe.querySelector(".sale-count");
    if (!t) return;
    (t.dataset.bumped = "true"), setTimeout(() => delete t.dataset.bumped, 200);
  }
  var te = null,
    w = !1,
    Tt = 0;
  async function As(e) {
    if (te?.busy || w) return;
    k.closeFlash("stopped"),
      (te = new yn({
        gapSeconds: Math.max(1, ve().relayAfter),
        endLive: () => $e(document),
        startLive: () =>
          Bt(document, { shouldContinue: () => a.running && !w }),
        log: f,
        onRestarted: () => {
          if (
            (re.reset(),
            (Tt = Date.now()),
            ge({
              type: "note",
              text: `Modo infinito: próxima live aberta (${e})`,
            }),
            a.plan)
          )
            qs();
        },
        onGaveUp: (t) => {
          ge({ type: "note", text: `Modo infinito parou: ${t}` }), Pe("manual");
        },
        mayOpen: async () => {
          let t = await b.violationStatus();
          if (!t.ok)
            return "não consegui verificar a proteção da conta; confira o TikTok antes de retomar.";
          a.violations = t.data;
          let n = yt(t.data) ? t.data : null;
          if (w)
            return "aviso do TikTok nesta execução; revise o conteúdo antes de iniciar outra live.";
          return n
            ? `aviso de violação na conta. Novas lives liberadas ${n.release ?? "mais tarde"}.`
            : null;
        },
      })),
      await te.relay(e);
  }
  var Ls = 90000,
    Cs = 15000,
    Mn = !1;
  async function Ms(e) {
    if (Mn || te?.busy || !a.running) return;
    if (Date.now() - Tt < Ls) return;
    Mn = !0;
    try {
      if (se(document) === "on") return;
      if ((await new Promise((n) => setTimeout(n, Cs)), !a.running || te?.busy))
        return;
      if (se(document) === "on") return;
      f(`\uD83D\uDCE1 ${e}`),
        ge({ type: "dropped" }),
        f(
          "A transmissão terminou sem um encerramento programado. Confira o TikTok antes de abrir outra LIVE.",
        ),
        Pe("manual");
    } finally {
      Mn = !1;
    }
  }
  var Pn = null,
    Ps = new Sn();
  function Rs(e) {
    if (e.kind === "violation") {
      if (e.active !== null) {
        let t = Pn;
        if (!a.running) {
          Pn = Math.max(t ?? 0, e.active);
          return;
        }
        if (t !== null && e.active <= t) return;
        Pn = e.active;
      }
      if (!a.running) return;
      k.violation(e.text);
      return;
    }
    if (!Ps.block(e.reason)) return;
    if (
      (f(
        `ℹ️ O TikTok marcou a verificação de LIVE (${e.reason}). Não é um aviso de violação; a automação segue.`,
      ),
      a.sessionId)
    )
      ge({ type: "note", text: `Verificação de LIVE do TikTok: ${e.reason}` });
  }
  async function vt(e) {
    try {
      let t = await fetch(`${e}/library.json`);
      if (!t.ok) return;
      let n = await t.json();
      return n.lines?.length ? { base: e, lines: n.lines } : void 0;
    } catch {
      return;
    }
  }
  function At() {
    document.getElementById(C.canvas)?.setAttribute("data-own", "1");
  }
  async function Os() {
    if (!a.running) return;
    if ((await new Promise((o) => setTimeout(o, 4000)), !a.running)) return;
    let e = document.getElementById(C.voice),
      t = e?.currentTime ?? 0;
    if (
      (await new Promise((o) => setTimeout(o, 5000)),
      !a.running || !e || e.paused || e.currentTime - t < 2)
    )
      return;
    if (document.getElementById(C.canvas)?.dataset.mix !== "live")
      f(
        "\uD83D\uDD07 O áudio da live está em silêncio no envio, com narração tocando. Clique na página e ligue de novo — o navegador segurou o som.",
      );
  }
  var _ = null,
    F = 0,
    Ue = 0,
    qn = {},
    Ve = new pt(),
    ne = new pt(),
    fe = [],
    Ge = [],
    We = [],
    Le = [],
    zn = null,
    Fn = 0,
    Be = 0,
    sr = [],
    bt = 0,
    lr = {
      material: "material composição acabamento",
      size: "tamanho medidas capacidade",
      use: "uso demonstração funcionamento",
      variants: "cores variantes",
    },
    K = () => `${a.sessionId}:${_?.current?.id ?? a.plan?.product.id ?? null}`,
    Is = () => `${K()}:${bt}`;
  function Qn(e) {
    let t = _?.current?.id ?? a.plan?.product.id;
    if (!t || a.clipKind === "own") return;
    let o = (a.clipKind === "real" ? ne : Ve).focus(t, e),
      i = o ? sr.indexOf(o) : -1;
    if (i >= 0) D.focusClip(i);
  }
  async function Xn() {
    if (!a.running || !a.plan || w) return;
    let t = _?.current?.id ?? a.plan.product.id ?? null,
      n = Is();
    if (
      re.boundary(
        {
          planId: a.plan.id,
          productId: t,
          narration: a.nowSpeaking.slice(0, 300),
          rotationDue: _?.due() ?? !1,
          elapsedSeconds: Math.min(
            86400,
            _?.elapsedSeconds ?? Math.floor((Date.now() - Tt) / 1000),
          ),
        },
        n,
        (i) => Qn(lr[i] ?? i),
        K(),
      )
    )
      await _?.advance();
  }
  function ee(e, t, n, o = "") {
    if (
      (bt++,
      (sr = e),
      D.setClips(e),
      (a.clipKind = e.length ? t : null),
      (a.clipFor = o),
      (a.clipNames = n ?? e.map((i, r) => `${t}-${r + 1}.mp4`)),
      je(),
      e.length)
    )
      At();
    x();
  }
  var wt = (e, t) =>
    e === "real"
      ? `${t} ${t === 1 ? "vídeo real" : "vídeos reais"}`
      : e === "generated"
        ? `${t} ${t === 1 ? "clipe gerado" : "clipes gerados"}`
        : `${t} ${t === 1 ? "clipe seu" : "clipes seus"}`;
  function Ce() {
    let e = m.auto.realClips ? Le : [];
    if (e.length) ee(e, "real");
    else if (We.length) ee(We, "generated");
    else ee(fe, "own", Ge);
    ar(a.plan?.product.title ?? ""), Et();
  }
  var Hn = new Set();
  function Zn(e) {
    let t = m.auto.realClips ? ne.ready(e.id) : [];
    if (m.auto.realClips && !t.length && !Hn.has(e.id))
      Hn.add(e.id),
        ne.load(e.id, de(e.clipBase)).then((i) => {
          if (i.length && m.auto.realClips && _?.current === e) Zn(e);
        });
    let n = Ve.ready(e.id),
      o = e.title.slice(0, 32);
    if (t.length)
      ee(t, "real", void 0, e.title),
        f(`\uD83C\uDFAC ${o}: ${wt("real", t.length)}`);
    else if (n.length)
      ee(n, "generated", void 0, e.title),
        f(`\uD83C\uDFAC ${o}: ${wt("generated", n.length)}`);
    else if (fe.length && a.plan?.product.id === e.id)
      ee(fe, "own", Ge, e.title),
        f(`\uD83C\uDFAC ${o}: sem vídeos deste produto; usando os seus`);
    else
      ee([], "generated", void 0, e.title),
        f(`⚠️ ${o}: sem vídeos disponíveis para este produto`);
    ar(e.title), Et();
  }
  async function _s() {
    let e = ++Be,
      t = m.auto.realClips;
    Hn.clear();
    let n = F ? _?.current : null;
    if (n) {
      if (t) await ne.load(n.id, de(n.clipBase));
      if (e !== Be || _?.current !== n) return;
      Zn(n);
    } else {
      if (t && zn && !Le.length) {
        let o = await ne.load(a.plan?.product.id ?? 0, de(zn));
        if (e !== Be) return;
        Le = o;
      }
      Ce();
    }
    if (t && a.clipKind !== "real")
      f(
        "\uD83C\uDFAC Este produto ainda não tem vídeos reais; seguem os outros",
      );
  }
  var Ni = new Map();
  function $i(e) {
    let t = Ni.get(e.id);
    if (!t)
      (t = Promise.all([vt(e.base), vt(e.voiceBase)]).then(([n, o]) => ({
        product: n,
        voice: o,
      }))),
        Ni.set(e.id, t);
    return t;
  }
  async function cr(e) {
    let t = ++Ue,
      n = await b.liveBoard(e);
    if (t !== Ue) return !1;
    if (!n.ok || n.data.products.length < 2)
      return (
        f("Sem produtos suficientes com dado de live; sigo com um produto só."),
        !1
      );
    let o = await Promise.all(
      n.data.products.map(async (r) => {
        let [l, s] = await Promise.all([
          Ve.load(r.id, r.clipBase),
          m.auto.realClips
            ? ne.load(r.id, de(r.clipBase))
            : Promise.resolve([]),
        ]);
        return {
          p: r,
          available:
            l.length > 0 ||
            s.length > 0 ||
            (fe.length > 0 && a.plan?.product.id === r.id),
        };
      }),
    );
    if (t !== Ue || !a.running) return !1;
    let i = o.filter((r) => r.available).map((r) => r.p);
    if (i.length < 2)
      return (
        f(
          "Sem vídeos de produtos suficientes para revezar; sigo com o produto atual.",
        ),
        !1
      );
    return (
      f(
        `\uD83E\uDDE0 ${i.length} produtos escolhidos por potencial de venda em live`,
      ),
      (_ = new fn(i, n.data.blockMinutes * 60000, {
        add: (r) => Eo(document, r),
        pin: async (r) => ye(document, r),
        preload: async (r) => {
          await Promise.all([
            E.preload(await $i(r)),
            Ve.load(r.id, r.clipBase),
            m.auto.realClips ? ne.load(r.id, de(r.clipBase)) : null,
          ]);
        },
        show: Zn,
        speak: async (r) => {
          (a.nowProduct = r.title),
            (k.pinTitle = r.title),
            await E.speakFor(await $i(r));
        },
        log: f,
      })),
      (F = e),
      (E.betweenLines = Xn),
      await _.begin(),
      !0
    );
  }
  async function Ns() {
    let e = m.auto.rotate > 1 ? m.auto.rotate : 0;
    if (e === F) return;
    let t = F;
    if (((F = 0), (_ = null), (E.betweenLines = Xn), Ue++, e && (await cr(e))))
      return;
    if (!t || !a.running || F) return;
    if (
      ((a.nowProduct = ""), (k.pinTitle = null), Ce(), E.speakFor(qn), a.plan)
    )
      ye(document, a.plan.product.title);
    f("▶️ De volta a um produto só: o do plano");
  }
  var V = null;
  async function $s() {
    V?.(), (V = null);
    let e = new dn({ cooldownMs: 60000 });
    (W = e), Te.clear();
    let t = setInterval(() => Yn(e), 1000),
      n = So(document, (p) => Di(e, p.user, p.text, "tela")),
      o = new hn({ cooldownMs: 30000, host: $t(document) }),
      i = To(document, (p) => {
        if (!a.running || !m.auto.greet || w || nr()) return;
        let h = o.greet(p);
        if (!h) return;
        e.mine(h);
        let g = Ie(document, h, { mention: p });
        if (g.ok) f(`\uD83D\uDC4B Dei oi para @${p}`);
        else
          f(
            g.reason === "blocked"
              ? Oe(g.why, h)
              : `Não consegui dar oi para @${p}.`,
          );
      }),
      r = () => {
        if ((clearInterval(t), W === e)) W = null;
        e.reset(), n(), i();
      };
    V = r;
    let l = $t(document);
    if (!l) {
      f(
        "Não identifiquei seu @ nesta página: leio o chat pela tela, mas não vou avisar se a live cair.",
      ),
        (V = r);
      return;
    }
    let s = await b.chatToken(l);
    if (W !== e) return;
    if (!s.ok) {
      f(
        "Não consegui acompanhar o estado da live agora; sigo lendo o chat pela tela.",
      ),
        (V = r);
      return;
    }
    let c = !1,
      d = mi(s.data.url, (p) => {
        if (p.kind === "chat") return Di(e, p.user, p.message, "socket");
        if (!a.running) return;
        if (p.kind === "lost") {
          if (!c) f(`\uD83D\uDCE1 ${p.message}`);
          c = !0;
          return;
        }
        Ms(p.message);
      });
    V = () => {
      r(), d();
    };
  }
  var Te = new Map();
  function Di(e, t, n, o) {
    let i = `${K()}\x00${t.trim().toLowerCase()}\x00${n.trim()}`,
      r = Date.now();
    if (r - (Te.get(i) ?? -1 / 0) < 2000) return;
    if ((Te.set(i, r), Te.size > 300)) Te.delete(Te.keys().next().value);
    let l = m.auto.blockOn ? qo(n, zo(m.auto.blockWords), t) : null;
    if (l) {
      f(`\uD83D\uDEAB @${t} disse "${l}" — bloqueando`),
        Ao(document, t).then((c) =>
          f(
            c
              ? `\uD83D\uDEAB Bloqueei @${t}`
              : `Não achei @${t} no chat para bloquear.`,
          ),
        );
      return;
    }
    if (!a.running)
      return f(`\uD83D\uDCAC @${t}: “${n}” — a live automática está parada`);
    if (!ve().answer)
      return f(`\uD83D\uDCAC @${t}: “${n}” — respostas desligadas`);
    if (w) return;
    let s = e.enqueue({ user: t, text: n, scope: K() });
    if (!s.ok) {
      if (s.why !== "own") f(`\uD83D\uDCAC @${t}: “${n}” — ${vi[s.why]}`);
      return;
    }
    f(`\uD83E\uDD14 @${t} perguntou (${o}): “${n}” — na fila de respostas`),
      re.question(s.text, K()),
      gt(),
      Yn(e);
  }
  function Yn(e) {
    if (W !== e) return;
    if (!a.running || !ve().answer || w) {
      e.discardQueue(), gt();
      return;
    }
    let t = e.next(K());
    if ((gt(), !t)) return;
    f(`\uD83D\uDCAC Respondendo à pergunta de @${t.user}…`),
      Ds(e, t.user, t.text);
  }
  async function Ds(e, t, n) {
    let o = a.plan,
      i = _?.current ?? null,
      r = i?.id ?? o?.product.id ?? null,
      l = a.sessionId,
      s = bt,
      c = K(),
      d = () =>
        W === e &&
        ve().answer &&
        bt === s &&
        a.running &&
        a.plan === o &&
        a.sessionId === l &&
        (_?.current ?? null) === i &&
        !w;
    try {
      if (!o || !d()) return;
      let p = await b.answer(o.id, n, r, e.history(t, c));
      if (!d())
        return f(`Resposta para @${t} descartada: a apresentação mudou.`);
      if (!p.ok) return f(`Não consegui responder @${t} agora.`);
      if (p.data.skipped)
        return f(`\uD83D\uDCAC @${t}: comentário sem resposta de produto.`);
      if (p.data.productId !== void 0 && p.data.productId !== r) return;
      let h = e.compose(t, p.data.answer);
      e.mine(h);
      let g = Ie(document, h, { mention: t });
      if (g.ok)
        e.sent(t, n, p.data.answer, c),
          Qn(lr[p.data.topic ?? ""] ?? n),
          f(`\uD83D\uDCAC Respondi @${t}: “${p.data.answer.slice(0, 60)}”`);
      else if (g.reason === "blocked") f(Oe(g.why, h));
      else f(`Não consegui enviar a resposta para @${t}.`);
    } catch {
      f(`Não consegui responder @${t} agora. Pode tentar de novo.`);
    } finally {
      e.failed(), Yn(e);
    }
  }
  async function qs() {
    if (a.sessionId) b.endSession(a.sessionId, "video", {});
    a.sessionId = null;
    let e = await b.startSession(a.plan?.id ?? null);
    if (!a.running || w) {
      if (e.ok) b.endSession(e.data.sessionId, "manual", {});
      return;
    }
    if ((re.reset(), (a.sessionId = e.ok ? e.data.sessionId : null), !e.ok))
      f(`⛔ ${e.error}`), await $e(document), Pe("manual"), Lt();
  }
  var qi = "";
  async function Lt() {
    let e = await Promise.resolve()
      .then(b.violationStatus)
      .catch(() => null);
    if (!e?.ok) return null;
    a.violations = e.data;
    let t = e.data,
      n = `${t.count90d}|${t.lockedUntil ?? ""}`;
    if (t.count90d > 0 && n !== qi)
      (qi = n),
        f(
          `⚠️ ${t.count90d === 1 ? "1 aviso" : `${t.count90d} avisos`} de violação nos últimos 90 dias` +
            (yt(t) && t.release ? ` — novas lives liberadas ${t.release}` : ""),
        );
    return Me(), yt(e.data) ? e.data : null;
  }
  var yt = (e) =>
    Boolean(e?.lockedUntil && new Date(e.lockedUntil).getTime() > Date.now());
  E.onLine = (e, t) => {
    Qn(e),
      (a.nowSpeaking = e.replace(/\[[^\]]*\]\s*/g, "")),
      (a.passage = t.id);
    try {
      a.audioFile = new URL(t.file, location.origin).pathname;
    } catch {
      a.audioFile = "";
    }
  };
  var zi = 150;
  function f(e) {
    let t = { at: new Date(), text: e };
    if (
      (a.log.unshift(t),
      (a.log.length = Math.min(a.log.length, zi)),
      a.screen !== "main")
    )
      return Me();
    if (((Pt[2].textContent = ur()), m.tab !== "log")) return;
    let n = j.querySelector(".log");
    if (!n) return Me();
    let o = Tr(t);
    (o.dataset.enter = ""), n.prepend(o);
    while (n.children.length > zi) n.lastElementChild.remove();
  }
  var ur = () => `Log${a.log.length ? ` (${a.log.length})` : ""}`;
  function ge(e) {
    if (e.type === "violation")
      (e = {
        ...e,
        context: {
          version: I.slice(0, 30),
          product: (a.nowProduct || a.plan?.product.title || "").slice(0, 200),
          passage: a.passage.slice(0, 100),
          audioFile: a.audioFile.slice(0, 300),
          narration: a.nowSpeaking.slice(0, 300),
          footage: (a.clipKind || "unknown").slice(0, 30),
        },
      }),
        (w = !0),
        te?.stop(),
        E.stop(),
        Q.stop(),
        D.halt(),
        re.reset(),
        V?.(),
        (V = null);
    if (a.sessionId) b.event(a.sessionId, e);
  }
  window.addEventListener("message", (e) => {
    if (e.source === window && e.data?.[an] === "page-signal" && e.data.signal)
      Rs(e.data.signal);
    if (
      e.source === window &&
      e.data?.[an] === "camera-in-use" &&
      !a.cameraInUse
    )
      (a.cameraInUse = !0),
        f("\uD83C\uDFA5 O TikTok está recebendo a câmera MediaFlowMZ");
  });
  async function Jn() {
    let e = await b.plans();
    if (!e.ok) {
      if (e.status === 401) return eo(e.error);
      return (a.planError = e.error), x();
    }
    if (((a.plans = e.data), !m.planId && e.data[0])) m.planId = e.data[0].id;
    if ((x(), Lt(), m.planId)) await dr(m.planId);
  }
  async function dr(e) {
    (m.planId = e),
      H(),
      (a.plan = null),
      (a.narrationReady = !1),
      (a.planError = ""),
      x();
    try {
      let t = await b.plan(e);
      if (!t.ok) return (a.planError = t.error), x();
      a.plan = t.data;
      let n = await b.voiceLines(e),
        o = n.ok ? n.data : null,
        [i, r] = await Promise.all([
          o?.base ? vt(o.base) : void 0,
          o?.voiceBase ? vt(o.voiceBase) : void 0,
        ]);
      (qn = { product: i, voice: r }), zs(e, o?.clipBase ?? null);
      let l = await E.prepare(qn);
      (a.narrationReady = !0),
        f(
          l.own
            ? `\uD83C\uDF99️ Narração pronta: ${l.own} falas deste produto + ${l.shared} gerais, na mesma voz`
            : `\uD83C\uDF99️ Narração pronta: ${l.shared} falas da voz MediaFlowMZ`,
        );
    } catch (t) {
      (a.planError = `Não deu para carregar a narração (${t instanceof Error ? t.message : String(t)}). Toque em Atualizar.`),
        x();
    }
  }
  async function zs(e, t) {
    let n = a.plan?.product.id ?? 0,
      o = ++Fn;
    if ((Be++, (We = []), (Le = []), (zn = t), !F)) Ce();
    if (!t) return;
    let [i, r] = await Promise.all([
        yi(t),
        m.auto.realClips ? ne.load(n, de(t)) : Promise.resolve([]),
      ]),
      l = i.length ? await Ve.load(n, t) : [];
    if (o !== Fn || m.planId !== e) return;
    if (i.length && !l.length)
      f(
        `⚠️ Não deu para baixar os vídeos deste produto (${t}); seguem os seus`,
      );
    if (!l.length && !r.length) return;
    if (((We = l), (Le = r), !F)) Ce();
    let s = m.auto.realClips && r.length ? "real" : "generated",
      c = s === "real" ? r.length : l.length;
    if (c) f(`\uD83C\uDFAC ${wt(s, c)} deste produto`);
  }
  async function Fs() {
    if (a.starting || a.running) return;
    if (w) {
      f(
        "⛔ Um aviso interrompeu esta execução. Revise o motivo no TikTok e o conteúdo antes de recarregar para iniciar novamente.",
      );
      return;
    }
    (a.starting = !0), Me();
    try {
      await Hs();
    } finally {
      (a.starting = !1), Me();
    }
  }
  async function Hs() {
    if (!a.plan) {
      f(
        a.plans.length
          ? "A live do MediaFlowMZ ainda está carregando. Aguarde um instante e ligue de novo."
          : "Falta escolher a live do MediaFlowMZ — crie uma em MediaFlowMZ → Assistente de Live.",
      ),
        O.play("error");
      return;
    }
    if (!D.clipCount) {
      f(
        "Falta carregar os clipes — sem eles não existe câmera para enviar. Toque em Escolher, no passo 1.",
      ),
        O.play("error");
      return;
    }
    if (m.audio.voiceOn && !a.narrationReady) {
      f(
        "A narração ainda está carregando. Aguarde o “\uD83C\uDF99️ Narração pronta” aqui no log e ligue de novo.",
      ),
        O.play("error");
      return;
    }
    if (!mt(I, me)) {
      f(
        `⛔ Esta versão (${I}) não pode mais abrir lives. Atualize a extensão (aviso no topo do painel).`,
      ),
        O.play("error");
      return;
    }
    if (a.duplicate) {
      f(
        "⛔ Há duas MediaFlowMZ Live instaladas. Remova a cópia antiga (aviso no topo do painel).",
      ),
        O.play("error");
      return;
    }
    Tt = Date.now();
    let e = await b.startSession(a.plan.id);
    if (w) {
      if (e.ok) b.endSession(e.data.sessionId, "manual", {});
      return;
    }
    if (!e.ok) {
      f(`⛔ ${e.error}`), O.play("error"), Lt();
      return;
    }
    if (
      (re.reset(),
      (E.betweenLines = Xn),
      (a.sessionId = e.ok ? e.data.sessionId : null),
      E.apply(m.audio),
      (a.running = !0),
      (a.passage = a.audioFile = a.nowSpeaking = ""),
      k.start(a.plan, ve()),
      w)
    )
      return;
    if ((pr(!0), mr.hold(), await E.start(), !a.running || w)) return;
    if (
      (Os(), je(), O.play("start"), (Q.gain = m.audio.lifeVolume), !me.off.life)
    )
      Q.start(m.audio.lifeEvery, m.audio.lifeSounds);
    if (m.auto.rotate > 1) await cr(m.auto.rotate);
    if (!a.running || w) return;
    At();
    let t = se(document);
    if (t === "off") {
      let n = Ut(document);
      if (!n.ok && n.why === "no_feed")
        f("O TikTok está sem feed de vídeo, por isso o botão dele está cinza."),
          f(
            D.clipCount
              ? "Recarregue a página (F5) e ligue de novo: a câmera ficou presa na sessão anterior."
              : "Carregue os clipes aqui no painel primeiro — sem eles não existe câmera pra enviar.",
          );
      else if (!n.ok && n.why === "disabled")
        f("O botão de iniciar LIVE está desabilitado no TikTok."),
          f(
            "Recarregue esta página (F5) e ligue de novo — isso solta a câmera presa.",
          );
      else if (!n.ok) f("Não achei o botão de iniciar LIVE nesta página.");
      else {
        f("Abrindo a live no TikTok…");
        let o = await Bt(document, { shouldContinue: () => a.running && !w });
        if (!a.running || w) return;
        f(
          o
            ? "\uD83D\uDD34 Live aberta com o vídeo e o áudio do MediaFlowMZ."
            : "Não consegui abrir a live; abra pelo TikTok.",
        ),
          ge({
            type: "note",
            text: o
              ? "TikTok: transmissão no ar confirmada pelo console."
              : "TikTok: tentativa de início sem confirmação de transmissão no ar.",
          });
      }
    } else if (t === "on")
      f(
        "A live já estava no ar. Troque a câmera para MediaFlowMZ Live se a imagem não mudar.",
      ),
        ge({
          type: "note",
          text: "TikTok: transmissão já estava no ar, confirmada pelo console.",
        });
    if (!a.running || w) return;
    Et(), f("▶️ Live automática ligada"), $s();
  }
  async function Pe(e) {
    let t = k.panel,
      n = {
        sales: k.sales,
        comments: k.status?.commentsSent ?? 0,
        pins: k.status?.pins ?? 0,
        minutes: Math.round((Date.now() - k.startedAt) / 60000),
        ...(t.gmvCents !== null ? { gmvCents: t.gmvCents } : {}),
        ...(t.orders !== null ? { orders: t.orders } : {}),
        ...(t.items !== null ? { items: t.items } : {}),
      };
    if (
      (te?.stop(),
      (te = null),
      re.reset(),
      E.stop(),
      Q.stop(),
      (E.betweenLines = null),
      (_ = null),
      (F = 0),
      Ue++,
      (a.nowProduct = ""),
      (k.pinTitle = null),
      (G = null),
      k.stop(),
      D.show({}),
      document.getElementById(C.canvas)?.removeAttribute("data-own"),
      V?.(),
      (V = null),
      a.sessionId)
    )
      b.endSession(a.sessionId, e, n);
    if (
      ((a.sessionId = null),
      (a.running = !1),
      pr(!1),
      mr.release(),
      je(),
      O.play(e === "manual" ? "stop" : "error"),
      e === "manual")
    )
      f("⏸️ Live automática desligada");
    if ((x(), e === "violation")) Lt();
  }
  var Fi = 0;
  function pr(e) {
    window.clearInterval(Fi);
    let t = () =>
      void Promise.resolve()
        .then(() => b.onAir(e))
        .catch(() => null);
    if ((t(), e)) Fi = window.setInterval(t, Mi);
  }
  function eo(e = "") {
    if (
      ((a.screen = "activate"),
      (a.narrationReady = !1),
      (a.activateError =
        e && a.storedKey ? "Este computador perdeu a vaga desta chave." : e),
      a.running)
    )
      Pe("manual");
    x();
  }
  var v = u("div", { id: "zaalys-live-panel" }),
    M = v.attachShadow({ mode: "open" });
  M.append(u("style", {}, xi));
  var oe = u("section", { class: "panel", "aria-label": "MediaFlowMZ Live" }),
    j = u("div", { class: "body" }),
    he = u("button", { class: "pill", type: "button" }),
    hr = u("button", {
      class: "dock",
      type: "button",
      "aria-label": "Minimizar",
    });
  hr.onclick = () => to(!0);
  M.append(oe, he, hr);
  var ie = new wn(M, () => Me());
  j.addEventListener(
    "scroll",
    () => ie.isOpen && ie.follow(j.getBoundingClientRect()),
    { passive: !0 },
  );
  var mr = new It({ wakeLock: navigator.wakeLock, doc: document }),
    Rn = 380,
    Us = "cubic-bezier(0.23, 1, 0.32, 1)";
  function to(e) {
    if (m.collapsed === e) return;
    ie.close();
    let t = m.collapsed ? he : oe,
      n = t.getBoundingClientRect(),
      o = getComputedStyle(t).borderRadius;
    (m.collapsed = e), H(), (v.dataset.morphing = "true"), x(!0), be();
    let i = e ? he : oe,
      r = i.getBoundingClientRect(),
      l = getComputedStyle(i).borderRadius,
      s = () => delete v.dataset.morphing;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !n.width ||
      !r.width
    ) {
      i.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 160,
        easing: "ease-out",
      }).onfinish = s;
      return;
    }
    let c = u("div", { class: "morph", "aria-hidden": "true" });
    M.append(c);
    let d = (h, g) => ({
      left: `${h.left}px`,
      top: `${h.top}px`,
      width: `${h.width}px`,
      height: `${h.height}px`,
      borderRadius: g,
    });
    c.animate([d(n, o), d(r, l)], {
      duration: Rn,
      easing: Us,
      fill: "forwards",
    }),
      i.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 140,
        delay: Rn - 160,
        easing: "ease-out",
        fill: "backwards",
      });
    let p = c.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 120,
      delay: Rn - 40,
      easing: "ease-out",
      fill: "forwards",
    });
    p.onfinish = p.oncancel = () => {
      c.remove(), s();
    };
  }
  var Bs = 3,
    no = matchMedia(so);
  function Ct(e) {
    if (no.matches)
      return (
        (v.dataset.sheet = "true"),
        (v.style.left = v.style.top = v.style.right = v.style.bottom = ""),
        v.style.removeProperty("--panel-max-height"),
        null
      );
    if ((delete v.dataset.sheet, !e))
      return (
        (v.style.left = v.style.top = "auto"),
        (v.style.right = v.style.bottom = `${Ho * 2}px`),
        v.style.removeProperty("--panel-max-height"),
        null
      );
    let t = { width: v.offsetWidth, height: v.offsetHeight },
      n = window.visualViewport ? window.visualViewport.width : innerWidth,
      o = window.visualViewport ? window.visualViewport.height : innerHeight,
      i = Uo(e, t, { width: n, height: o });
    return (
      (v.style.right = v.style.bottom = "auto"),
      (v.style.left = `${i.x}px`),
      (v.style.top = `${i.y}px`),
      v.style.setProperty("--panel-max-height", `${i.maxHeight}px`),
      i
    );
  }
  var Hi;
  function be() {
    let e = Ct(m.position);
    if (!e || !m.position) return;
    if (e.x === m.position.x && e.y === m.position.y) return;
    (m.position = { x: e.x, y: e.y }),
      clearTimeout(Hi),
      (Hi = setTimeout(H, 400));
  }
  var N = null;
  M.addEventListener("pointerdown", (e) => {
    let t = e;
    if (t.button !== 0 || no.matches) return;
    let n = t.composedPath(),
      o = n.find(
        (l) => l?.tagName === "HEADER" || l?.classList?.contains("pill"),
      );
    if (!o) return;
    if (
      n
        .slice(0, n.indexOf(o))
        .some(
          (l) =>
            l?.tagName &&
            ["BUTTON", "SELECT", "INPUT", "TEXTAREA", "A", "LABEL"].includes(
              l.tagName,
            ),
        )
    )
      return;
    let r = v.getBoundingClientRect();
    (N = {
      pointerId: t.pointerId,
      from: { x: t.clientX, y: t.clientY },
      origin: { x: r.left, y: r.top },
      moved: !1,
    }),
      o.setPointerCapture(t.pointerId);
  });
  M.addEventListener("pointermove", (e) => {
    let t = e;
    if (!N || t.pointerId !== N.pointerId) return;
    let n = t.clientX - N.from.x,
      o = t.clientY - N.from.y;
    if (!N.moved && Math.hypot(n, o) < Bs) return;
    (N.moved = !0),
      (v.dataset.dragging = "true"),
      Ct({ x: N.origin.x + n, y: N.origin.y + o });
  });
  var fr = 0,
    Mt = !1;
  M.addEventListener(
    "pointerdown",
    () => {
      (Mt = !0), gr("pointer");
    },
    !0,
  );
  M.addEventListener("keydown", () => gr("keyboard"), !0);
  function gr(e) {
    if (v.dataset.input !== e) v.dataset.input = e;
  }
  addEventListener("pointerup", () => (Mt = !1), !0);
  addEventListener("pointercancel", () => (Mt = !1), !0);
  function vr(e) {
    if (!N || e.pointerId !== N.pointerId) return;
    if (N.moved) {
      let n = Ct({ x: v.offsetLeft, y: v.offsetTop });
      if (n) m.position = { x: n.x, y: n.y };
      H(), (fr = Date.now());
    }
    (N = null), delete v.dataset.dragging;
  }
  M.addEventListener(
    "click",
    (e) => {
      if (Date.now() - fr < 250) e.stopPropagation(), e.preventDefault();
    },
    !0,
  );
  M.addEventListener("pointerup", vr);
  M.addEventListener("pointercancel", vr);
  M.addEventListener("dblclick", (e) => {
    if (
      !e
        .composedPath()
        .some((n) => n?.tagName === "HEADER" || n?.classList?.contains("pill"))
    )
      return;
    (m.position = null), H(), Ct(null);
  });
  addEventListener("resize", be);
  no.addEventListener("change", be);
  addEventListener("orientationchange", be);
  window.visualViewport?.addEventListener("resize", be);
  window.visualViewport?.addEventListener("scroll", be);
  var xt = u("input", {
    type: "file",
    accept: "video/*",
    multiple: "",
    hidden: "",
  });
  M.append(xt);
  xt.addEventListener("change", async () => {
    let e = [...(xt.files ?? [])];
    if (!e.length) return;
    let t = e.map((n) => ({ name: n.name, blob: n }));
    if (
      ((fe = t.map((n) => n.blob)),
      (Ge = t.map((n) => n.name)),
      (We = []),
      (Le = []),
      Fn++,
      Be++,
      F)
    )
      ee(fe, "own", Ge, a.clipFor);
    else Ce();
    At(),
      await bs(t).catch(() => {}),
      f(
        `\uD83C\uDFAC ${t.length} ${t.length === 1 ? "clipe carregado" : "clipes carregados"}`,
      );
  });
  var Ke = u("input", {
    type: "text",
    placeholder: "Cole a chave (24 letras e números)",
    spellcheck: "false",
    autocomplete: "off",
    "aria-label": "Chave do MediaFlowMZ",
  });
  Ke.addEventListener("keydown", (e) => {
    if ((e.stopPropagation(), e.key !== "Enter" || e.isComposing)) return;
    e.preventDefault(), br(!1);
  });
  Ke.addEventListener("keyup", (e) => e.stopPropagation());
  Ke.addEventListener("keypress", (e) => e.stopPropagation());
  async function br(e) {
    if (a.activating) return;
    (a.activating = !0), (a.activateError = ""), x();
    try {
      let t = await b.activate(e ? void 0 : Ke.value);
      if (!t.ok) {
        a.activateError = t.error;
        return;
      }
      (a.account = t.data.name), (a.screen = "main"), O.play("arm"), Jn();
    } catch (t) {
      a.activateError = `Não deu para ativar (${t instanceof Error ? t.message : String(t)}). Aperte F5 e tente de novo.`;
    } finally {
      (a.activating = !1), x();
    }
  }
  function Un(e) {
    let t = u("button", {
      class: "icon minimize",
      type: "button",
      "aria-label": "Minimizar",
      "data-key": "minimize",
    });
    return (
      (t.onclick = () => to(!0)),
      u(
        "header",
        { title: "Arraste para mover o painel · dois cliques volta ao canto" },
        Kn("span", er, { class: "mark" }),
        u("strong", { class: "wordmark" }, "MediaFlowMZ Live"),
        u("span", { class: "header-end" }, e ?? "", t),
      )
    );
  }
  function Vs(e, t) {
    let n = new Set(t);
    for (let i of [...e.childNodes]) if (!n.has(i)) i.remove();
    let o = e.firstChild;
    for (let i of t)
      if (i === o) o = o.nextSibling;
      else e.insertBefore(i, o);
  }
  var Ui = new Map(),
    On = "";
  function Bn(e, t, n, o) {
    let i = M.activeElement?.dataset?.key;
    try {
      if (On) Ui.set(On, j.scrollTop);
    } catch {}
    j.replaceChildren(...t),
      (oe.dataset.screen = a.screen),
      Vs(oe, [...e.filter((r) => r !== null), j, ...(n ? [n] : [])]);
    try {
      j.scrollTop = Ui.get(o) ?? 0;
    } catch {}
    if (((On = o), i))
      M.querySelector(`[data-key="${CSS.escape(i)}"]`)?.focus({
        preventScroll: !0,
      });
  }
  function Gs() {
    let e = Boolean(a.storedKey),
      t = u(
        "button",
        { class: "btn primary big", type: "button", "data-key": "activate" },
        a.activating ? "Ativando…" : e ? "Reativar neste computador" : "Ativar",
      );
    (t.disabled = a.activating), (t.onclick = () => void br(e));
    let n = u(
        "a",
        { href: Xi, target: "_blank", rel: "noreferrer" },
        "MediaFlowMZ → Configurações",
      ),
      o = u("button", { class: "link", type: "button" }, "Usar outra chave");
    o.onclick = () => {
      (a.storedKey = null), (a.activateError = ""), b.logout(), x();
    };
    let i = e
      ? u(
          "div",
          { class: "activate" },
          u("h2", {}, "Reative sua extensão"),
          u(
            "p",
            {},
            `Sua chave (${a.storedKey.slice(0, 8)}…) continua guardada aqui. Ela abre dois aparelhos ao mesmo tempo: toque abaixo para usá-la neste.`,
          ),
          a.activateError
            ? u("p", { class: "error", role: "alert" }, a.activateError)
            : null,
          t,
          o,
        )
      : u(
          "div",
          { class: "activate" },
          u("h2", {}, "Ative sua extensão"),
          u(
            "p",
            {},
            "Abra ",
            n,
            " neste navegador e toque em Conectar neste navegador. Ou cole aqui a chave que aparece lá.",
          ),
          Ke,
          a.activateError
            ? u("p", { class: "error", role: "alert" }, a.activateError)
            : null,
          t,
        );
    Bn([Un(null), wr()], [i], null, "activate");
  }
  async function Bi() {
    let e = await Promise.resolve()
      .then(b.latest)
      .catch(() => null);
    if (!e?.ok) return;
    Ws(Ri(e.data));
    let t = An(e.data.version, I) ? e.data.version : null;
    if (t && $n)
      Promise.resolve()
        .then(b.updateCheck)
        .catch(() => null);
    if (t === a.update) return;
    if (((a.update = t), t))
      f(
        $n
          ? `⬆️ Versão ${t} a caminho (esta é a ${I}): o Chrome instala sozinho, fora da live.`
          : Zi
            ? `⬆️ Versão ${t} da extensão (esta é a ${I}): baixe de novo em MediaFlowMZ → Assistente de Live, fora da live.`
            : `⬆️ Versão ${t} da extensão na Chrome Web Store (esta é a ${I}).`,
      );
    x();
  }
  function Ws(e) {
    let t = me;
    if (((me = e), Co(e.violationPhrases), e.notice && e.notice !== t.notice))
      f(`\uD83D\uDCE3 ${e.notice}`);
    if (!mt(I, e) && mt(I, t))
      f(
        `⛔ Esta versão (${I}) não pode mais abrir lives. Atualize a extensão.`,
      );
    if (!a.running) return;
    if ((k.update(ve()), e.off.life && !t.off.life))
      Q.stop(),
        f(
          "\uD83D\uDD15 Sons da sala desligados pelo MediaFlowMZ para todas as lives.",
        );
    for (let [n, o] of [
      ["relay", "Modo infinito"],
      ["comments", "Comentários automáticos"],
      ["replies", "Respostas automáticas"],
    ])
      if (e.off[n] && !t.off[n])
        f(`\uD83D\uDD15 ${o} desligado pelo MediaFlowMZ para todas as lives.`);
  }
  function wr() {
    if (a.orphaned)
      return u(
        "div",
        { class: "update", role: "alert" },
        u(
          "div",
          { class: "update-head" },
          u("strong", {}, "Extensão atualizada"),
        ),
        u(
          "p",
          { class: "note" },
          "Aperte ",
          u("strong", {}, "F5"),
          " nesta página para usar a versão nova. Sua chave e seus clipes continuam aqui.",
        ),
      );
    if (a.duplicate)
      return u(
        "div",
        { class: "update", role: "alert" },
        u(
          "div",
          { class: "update-head" },
          u("strong", {}, "Duas MediaFlowMZ Live instaladas"),
        ),
        u(
          "p",
          { class: "note warn" },
          "Abra chrome://extensions e remova a que tem o botão ↻ (recarregar): é a cópia antiga, do .zip. Depois aperte F5 aqui.",
        ),
      );
    if ($n)
      return a.update
        ? u(
            "div",
            { class: "update", role: "status" },
            u(
              "div",
              { class: "update-head" },
              u("strong", {}, "Nova versão a caminho"),
              u(
                "small",
                { title: `Você tem a ${I}; a nova é a ${a.update}` },
                `${I} → ${a.update}`,
              ),
            ),
            u(
              "p",
              { class: "note" },
              "O Chrome instala sozinho, sempre fora da live. Não precisa fazer nada.",
            ),
          )
        : null;
    if (Zi || !Tn) {
      if (!a.update) return null;
      let r = u(
        "a",
        {
          class: "btn small primary",
          href: gs,
          target: "_blank",
          rel: "noreferrer",
        },
        "Baixar de novo",
      );
      return u(
        "div",
        { class: "update", role: "status" },
        u(
          "div",
          { class: "update-head" },
          u("strong", {}, `Nova versão: ${a.update}`),
          u("small", { title: `Você tem a ${I}` }, `${I} → ${a.update}`),
        ),
        u(
          "p",
          { class: "note" },
          "Ela não se atualiza sozinha. Fora da live, baixe de novo no Assistente de Live, substitua a pasta e clique em ↻ em chrome://extensions (no celular, instale de novo). Seus clipes continuam aqui.",
        ),
        r,
      );
    }
    let e = u(
      "button",
      { class: "link", type: "button", "aria-expanded": String(a.updateOpen) },
      a.updateOpen ? "Fechar" : "Como trocar",
    );
    e.onclick = () => {
      (a.updateOpen = !a.updateOpen), x(!0);
    };
    let t = u(
      "div",
      { class: "update-head" },
      u(
        "strong",
        {},
        a.update ? `Nova versão: ${a.update}` : "Agora na Chrome Web Store",
      ),
      e,
    );
    if (!a.updateOpen) return u("div", { class: "update", role: "status" }, t);
    let n = u("button", { class: "btn small", type: "button" }, "Copiar");
    n.onclick = async () => {
      (n.textContent = (await xr("chrome://extensions"))
        ? "Copiado"
        : "Copie à mão"),
        window.setTimeout(() => (n.textContent = "Copiar"), 1600);
    };
    let o = u(
        "a",
        {
          class: "btn small primary",
          href: Tn,
          target: "_blank",
          rel: "noreferrer",
        },
        "Abrir a loja",
      ),
      i = u(
        "a",
        { href: Xi, target: "_blank", rel: "noreferrer" },
        "MediaFlowMZ → Configurações",
      );
    return u(
      "div",
      { class: "update", role: "status" },
      t,
      a.running
        ? u(
            "p",
            { class: "note warn" },
            "Troque depois de encerrar esta live: remover esta cópia derruba a live automática.",
          )
        : null,
      u(
        "ol",
        {},
        u(
          "li",
          {},
          "Na Chrome Web Store, clique em ",
          u("strong", {}, "Usar no Chrome"),
          ". ",
          o,
        ),
        u(
          "li",
          {},
          "Em ",
          i,
          ", desconecte este computador: a cópia nova ocupa a vaga dele.",
        ),
        u(
          "li",
          {},
          "Abra ",
          u("strong", {}, "chrome://extensions"),
          " e remova a MediaFlowMZ Live que tem o botão ",
          u("strong", {}, "↻"),
          ": é esta, a do .zip. ",
          n,
        ),
        u(
          "li",
          {},
          "Volte a esta aba, aperte ",
          u("strong", {}, "F5"),
          " e cole sua chave. Seus clipes continuam aqui.",
        ),
      ),
    );
  }
  var He = null;
  function js() {
    let e = performance.now(),
      t = a.plan?.id ?? null;
    if (!He || He.plan !== t || e - He.at > 900)
      He = {
        pin: a.plan ? ko(document, a.plan.product.title) : "not_found",
        chat: Boolean(Je(document)),
        plan: t,
        at: e,
      };
    return He;
  }
  function yr() {
    let { pin: e, chat: t } = js();
    return [
      {
        key: "clips",
        title: "Clipes da live",
        ok: a.clipNames.length > 0,
        detail: a.clipNames.length
          ? `${wt(a.clipKind ?? "own", a.clipNames.length)}${a.clipFor ? ` de ${a.clipFor.slice(0, 28)}` : ""}, em ordem aleatória`
          : "Os vídeos que você gerou no Google Flow (pode escolher vários).",
      },
      {
        key: "plan",
        title: "Live do MediaFlowMZ",
        ok: m.audio.voiceOn ? a.narrationReady : Boolean(a.plan),
        detail: a.planError
          ? a.planError
          : a.narrationReady
            ? `${a.plan.comments.length} comentários · narração pronta`
            : a.plans.length
              ? "Carregando…"
              : "Crie a live em MediaFlowMZ → Assistente de Live → Live infinita.",
      },
      {
        key: "camera",
        title: "Câmera MediaFlowMZ no TikTok",
        ok: a.cameraInUse,
        detail: a.cameraInUse
          ? "O TikTok está recebendo o vídeo e a voz."
          : "No TikTok, em Câmera escolha “MediaFlowMZ Live (vídeo)” e em Microfone “MediaFlowMZ Live (áudio)”.",
      },
      {
        key: "chat",
        title: "Chat da live",
        ok: t,
        detail: t ? "Pronto para comentar." : "Aparece quando a live começa.",
      },
      {
        key: "product",
        title: "Produto no carrinho da live",
        ok: e !== "not_found",
        detail:
          e === "pinned"
            ? "Fixado."
            : e === "unpinned"
              ? "Na lista — será fixado."
              : "Copie o link e cole em Adicionar produtos → Link do produto.",
      },
    ];
  }
  function Ks() {
    let e = a.plans.length
        ? a.plans.map((o) => ({ value: o.id, label: o.title }))
        : [{ value: "", label: "Nenhuma live criada" }],
      t = ie.trigger({
        label: "Live do MediaFlowMZ",
        value: m.planId ?? "",
        options: e,
        key: "plan",
        className: "wide",
        disabled: a.running || !a.plans.length,
        title: a.running
          ? "Pare a live automática para trocar de live"
          : void 0,
        onChange: (o) => void dr(o),
      }),
      n = Kn("button", Ss, {
        class: "btn icon-btn",
        type: "button",
        title: "Atualizar lista",
        "aria-label": "Atualizar lista de lives",
        "data-key": "refresh-plans",
      });
    return (
      (n.onclick = () => void Jn()), u("div", { class: "plan-pick" }, t, n)
    );
  }
  function Qs(e) {
    if (e.key === "clips") {
      let t = u(
        "button",
        { class: "btn", type: "button", "data-key": "clips" },
        a.clipNames.length ? "Trocar" : "Escolher",
      );
      return (t.onclick = () => xt.click()), t;
    }
    if (e.key === "product" && !e.ok && a.plan?.product.url)
      return Xs(a.plan.product.url);
    return null;
  }
  async function xr(e) {
    try {
      return await navigator.clipboard.writeText(e), !0;
    } catch {
      let t = document.createElement("textarea");
      (t.value = e),
        (t.style.cssText = "position:fixed;opacity:0"),
        document.body.append(t),
        t.select();
      let n = document.execCommand("copy");
      return t.remove(), n;
    }
  }
  function Xs(e) {
    let t = u(
      "button",
      { class: "btn", type: "button", "data-key": "copy-link" },
      "Copiar link",
    );
    return (
      (t.onclick = async () => {
        (t.textContent = (await xr(e)) ? "Copiado" : "Selecione abaixo"),
          window.setTimeout(() => (t.textContent = "Copiar link"), 1600);
      }),
      t
    );
  }
  function Zs(e, t, n, o) {
    let i = u("textarea", {
      class: "words",
      rows: "2",
      spellcheck: "false",
      "data-key": `words:${e}`,
    });
    return (
      (i.value = n),
      (i.oninput = () => {
        o(i.value), H();
      }),
      i.addEventListener("keydown", (r) => r.stopPropagation()),
      u("label", { class: "row stack-row" }, Re(e, t), i)
    );
  }
  function Re(e, t) {
    if (!t) return u("strong", { class: "row-text" }, e);
    return u(
      "span",
      { class: "row-text" },
      u("strong", {}, e),
      u("small", {}, t),
    );
  }
  function pe(e, t, n) {
    let o = t.filter((i) => Boolean(i));
    if (!o.length) return null;
    return u(
      "section",
      { class: "section" },
      e ? u("h3", { class: "section-title" }, e) : null,
      u("div", { class: "group" }, ...o),
      n ? u("p", { class: "caption" }, n) : null,
    );
  }
  function kr() {
    if (!a.running) return;
    k.update(ve()), E.apply(m.audio), Ns();
  }
  function z(e, t, n, o) {
    let i = u("input", {
      type: "checkbox",
      role: "switch",
      "data-key": `toggle:${e}`,
    });
    return (
      (i.checked = n),
      (i.onchange = () => {
        o(i.checked), H(), kr(), Wn(180);
      }),
      u("label", { class: "row toggle" }, Re(e, t), i)
    );
  }
  function J(e, t, n, o) {
    let i = ie.trigger({
        label: e,
        value: t,
        options: n.map(([l, s]) => ({ value: l, label: s })),
        key: `choice:${e}`,
        onChange: (l) => {
          o(l), H(), kr(), Wn(0);
        },
      }),
      r = u("div", { class: "row choice" }, Re(e), i);
    return (
      r.addEventListener("click", (l) => {
        if (!i.contains(l.target)) i.click();
      }),
      r
    );
  }
  function Sr() {
    let e = k.status;
    return `No ar há ${ys(Date.now() - k.startedAt)} · ${e?.commentsSent ?? 0} comentários · ${e?.pins ?? 0} fixações · `;
  }
  function Er() {
    return `${k.sales} vendas`;
  }
  var Vi = null,
    Gi = new Map();
  function Ys() {
    let e = yr(),
      t = e.filter((s) => s.ok).length,
      n = u("div", { class: "progress", "aria-hidden": "true" }, u("i", {})),
      o = n.firstChild,
      i = t / e.length;
    o.style.transform = `scaleX(${i})`;
    let r = Vi;
    if (((Vi = i), r !== null && r !== i && !St()))
      jn.push(() =>
        o.animate(
          [{ transform: `scaleX(${r})` }, { transform: `scaleX(${i})` }],
          { duration: 300, easing: Gn },
        ),
      );
    let l = u(
      "ol",
      { class: "group checks" },
      ...e.map((s, c) => {
        let d = u("span", { class: `dot${s.ok ? " ok" : ""}` });
        if (s.ok) d.append(tr(ks));
        else d.textContent = String(c + 1);
        let p = u(
          "li",
          { class: `check${s.ok ? " ok" : ""}` },
          d,
          Re(s.title, s.detail),
          Qs(s),
          s.key === "plan" ? Ks() : null,
        );
        if (s.ok && Gi.get(s.key) === !1) p.dataset.enter = "";
        return Gi.set(s.key, s.ok), p;
      }),
    );
    return u(
      "section",
      { class: "section" },
      u(
        "div",
        { class: "section-head" },
        u(
          "h3",
          { class: "section-title" },
          t === e.length ? "Tudo pronto" : "Antes de ligar",
        ),
        u(
          "span",
          { class: `section-meta${t === e.length ? " ok" : ""}` },
          `${t} de ${e.length}`,
        ),
      ),
      n,
      l,
    );
  }
  function Js() {
    if (G) {
      let t = G,
        n = u(
          "button",
          { class: "btn", type: "button", "data-key": "offer-down" },
          "Tirar da tela",
        );
      return (
        (n.onclick = () => k.closeFlash()),
        u(
          "div",
          { class: "group" },
          u(
            "div",
            { class: "row" },
            Re(
              "⚡ Oferta relâmpago na tela",
              t.endsAt
                ? `Até ${Xe(t.endsAt)}${t.price ? ` · ${t.price}` : ""}. Sai sozinha no fim.`
                : `${t.price ? `${t.price} · ` : ""}Fica até você tirar.`,
            ),
            n,
          ),
        )
      );
    }
    let e = u(
      "button",
      { class: "btn wide", type: "button", "data-key": "offer" },
      "⚡ Mostrar oferta relâmpago",
    );
    return (e.onclick = () => Es()), e;
  }
  function el() {
    if (!a.running) return [];
    return [
      il(),
      a.nowProduct || a.nowSpeaking
        ? u(
            "div",
            { class: "now" },
            a.nowProduct
              ? u(
                  "p",
                  { class: "now-product" },
                  u("span", { class: "now-label" }, "Vendendo agora"),
                  a.nowProduct,
                )
              : null,
            a.nowSpeaking ? u("p", { class: "speaking" }, a.nowSpeaking) : null,
          )
        : null,
    ].filter((e) => Boolean(e));
  }
  function tl() {
    let e = m.auto;
    return [
      ...el(),
      Js(),
      Ys(),
      pe("Automação", [
        z(
          "Comentários automáticos",
          a.plan
            ? `${a.plan.comments.length} mensagens em ordem aleatória`
            : "Do seu plano no MediaFlowMZ",
          e.comments,
          (t) => (e.comments = t),
        ),
        J("Ritmo dos comentários", e.pace, _o, (t) => (e.pace = t)),
        z(
          "Fixar produto",
          "A cada minuto, sem nunca desfixar",
          e.pin,
          (t) => (e.pin = t),
        ),
        z(
          "Comemorar vendas",
          "Som e fala de comemoração a cada venda",
          e.celebrate,
          (t) => (e.celebrate = t),
        ),
        z(
          "Responder perguntas",
          "Dúvidas em fila, com os dados do produto. Aceita !preco, !tamanho, !cores, !uso, !frete e !produto",
          e.answer,
          (t) => (e.answer = t),
        ),
        z(
          "Dar oi para quem entra",
          "Pelo nome, um por vez, cada vez de um jeito",
          e.greet,
          (t) => (e.greet = t),
        ),
      ]),
      pe("Vídeo", [
        J("Qualidade do vídeo", m.video, Ei, (t) => {
          (m.video = t), ir(!1);
        }),
        J(
          "Vários produtos na mesma live",
          e.rotate,
          [
            [0, "Só o produto do plano"],
            [3, "3 produtos, trocando sozinho"],
            [5, "5 produtos, trocando sozinho"],
            [8, "8 produtos, trocando sozinho"],
          ],
          (t) => (e.rotate = t),
        ),
        z(
          "Vídeos reais do produto",
          "Quando o produto tem vídeos de pessoas reais com ele, entram no lugar dos gerados. Troca na hora, mesmo ao vivo",
          e.realClips,
          (t) => {
            (e.realClips = t), _s();
          },
        ),
        z(
          "Espelhar alguns clipes",
          "Dobra a variedade sem gerar mais vídeo. Cuidado: inverte qualquer texto no quadro",
          e.mirror,
          (t) => {
            (e.mirror = t), D.setMirror(t);
          },
        ),
      ]),
      pe(
        "Proteção",
        [
          z(
            "Bloquear por palavra",
            "Bloqueia quem comentar — ou se chamar — uma destas palavras",
            e.blockOn,
            (t) => (e.blockOn = t),
          ),
          Ae(
            "blockWords",
            e.blockOn
              ? Zs(
                  "Palavras bloqueadas",
                  'Separe por vírgula. IA em maiúsculas: "ia" minúsculo é o verbo (eu ia comprar).',
                  e.blockWords,
                  (t) => (e.blockWords = t),
                )
              : null,
          ),
        ],
        "Sempre ativa: ao primeiro aviso do TikTok, a automação para e tenta encerrar a LIVE. A retomada automática fica bloqueada.",
      ),
      pe("Encerramento", [
        J(
          "Timer de encerramento",
          e.endAfter,
          [
            [0, "Sem timer"],
            [60, "1 hora"],
            [120, "2 horas"],
            [240, "4 horas"],
            [360, "6 horas"],
            [480, "8 horas"],
          ],
          (t) => (e.endAfter = t),
        ),
        J(
          "Modo infinito",
          e.relayAfter,
          [
            [0, "Desligado"],
            [10, "Abrir outra live em 10s"],
            [30, "Abrir outra live em 30s"],
            [60, "Abrir outra live em 1 min"],
          ],
          (t) => (e.relayAfter = t),
        ),
      ]),
    ].filter((t) => Boolean(t));
  }
  var In = null;
  function nl() {
    let e = u(
        "span",
        { class: "btn-label" },
        a.running
          ? "Parar live automática"
          : a.starting
            ? "Ligando…"
            : "Ligar live automática",
      ),
      t = u(
        "button",
        {
          class: `btn big ${a.running ? "stop" : "primary"}`,
          type: "button",
          "data-key": "main",
        },
        e,
      );
    if (
      ((t.disabled = a.starting),
      (t.onclick = () => void (a.running ? Pe("manual") : Fs())),
      In !== null && In !== a.running && !St())
    )
      jn.push(() => {
        e.animate(
          [
            { filter: "blur(4px)", opacity: 0, transform: "scale(0.96)" },
            { filter: "blur(0)", opacity: 1, transform: "none" },
          ],
          { duration: 260, easing: Gn },
        );
      });
    In = a.running;
    let n = a.running
      ? u(
          "p",
          { class: "footer" },
          Sr(),
          u("span", { class: "sale-count" }, Er()),
        )
      : null;
    return u("div", { class: "actionbar" }, n, t);
  }
  function _n(e, t, n, o) {
    let i = u("input", {
      type: "range",
      min: "0",
      max: String(n),
      step: String(n / 100),
      "data-key": `slider:${e}`,
    });
    i.value = String(t);
    let r = u("output", {}),
      l = () => {
        let s = Math.round((Number(i.value) / n) * 100);
        i.style.setProperty("--fill", `${s}%`), (r.textContent = `${s}%`);
      };
    return (
      l(),
      (i.oninput = () => {
        l(), o(Number(i.value)), E.apply(m.audio), H();
      }),
      u(
        "label",
        { class: "row slider" },
        u("span", { class: "row-text" }, u("strong", {}, e), r),
        i,
      )
    );
  }
  function ol() {
    let e = m.audio,
      t = u(
        "button",
        { class: "btn", type: "button", "data-key": "test-celebration" },
        "Testar",
      );
    return (
      (t.disabled = !a.narrationReady || w),
      (t.onclick = () => {
        if (!w) E.previewCelebration();
      }),
      [
        pe(
          "Voz",
          [
            z(
              "Narração",
              "A voz MediaFlowMZ fala por cima dos clipes",
              e.voiceOn,
              (n) => {
                (e.voiceOn = n), E.apply(e), je();
              },
            ),
            Ae(
              "voice",
              e.voiceOn
                ? _n("Volume da voz", e.voice, 1, (n) => (e.voice = n))
                : null,
            ),
            u(
              "div",
              { class: "row" },
              Re("Comemoração", "A fala de quando sai uma venda"),
              t,
            ),
          ],
          "A voz vai só para a live: você não escuta no computador.",
        ),
        pe("Ambiente", [
          z(
            "Som ambiente",
            "Ruído de sala discreto por baixo da voz",
            e.ambientOn,
            (n) => {
              (e.ambientOn = n), E.apply(e);
            },
          ),
          Ae(
            "ambient",
            e.ambientOn
              ? _n("Volume do ambiente", e.ambient, 0.3, (n) => (e.ambient = n))
              : null,
          ),
          J(
            "Pausa programada",
            e.pauseEvery,
            [
              [0, "Desligada"],
              [10, "A cada 10 min"],
              [20, "A cada 20 min"],
              [30, "A cada 30 min"],
            ],
            (n) => (e.pauseEvery = n),
          ),
          Ae(
            "pauseFor",
            e.pauseEvery
              ? J(
                  "Duração da pausa",
                  e.pauseFor,
                  [
                    [10, "10 s"],
                    [20, "20 s"],
                    [40, "40 s"],
                  ],
                  (n) => (e.pauseFor = n),
                )
              : null,
          ),
          J(
            "Sons da sala",
            e.lifeEvery,
            [
              [0, "Desligados"],
              [3, "A cada ~3 min"],
              [6, "A cada ~6 min"],
              [12, "A cada ~12 min"],
            ],
            (n) => {
              if (((e.lifeEvery = n), a.running && !w && !me.off.life))
                Q.start(n, e.lifeSounds);
            },
          ),
          Ae(
            "lifeVolume",
            e.lifeEvery
              ? _n(
                  "Volume da sala",
                  e.lifeVolume,
                  1,
                  (n) => (e.lifeVolume = Q.gain = n),
                )
              : null,
          ),
          Ae("lifeSounds", e.lifeEvery ? rl(e) : null),
        ]),
        pe(
          "Painel",
          [
            z(
              "Sons do painel",
              "Confirmações curtas só para você: ativação, início, venda e erro",
              e.uiSounds,
              (n) => {
                if (((e.uiSounds = n), (O.enabled = n), n)) O.play("arm");
              },
            ),
          ],
          "Os sons do painel saem nas suas caixas, não na live. Se você captura o áudio do computador no OBS, desligue-os.",
        ),
      ].filter((n) => Boolean(n))
    );
  }
  function il() {
    if (!a.running) return null;
    let e = k.panel;
    if (e.items === null && e.orders === null && e.gmvCents === null)
      return null;
    let t = (i) =>
        i === null ? "—" : `R$ ${(i / 100).toFixed(2).replace(".", ",")}`,
      n = (i) => (i === null ? "—" : String(i)),
      o = (i, r) =>
        u(
          "div",
          { class: "stat" },
          u("span", { class: "stat-label" }, i),
          u("strong", { class: "stat-value" }, r),
        );
    return u(
      "div",
      { class: "stats" },
      o("Faturamento", t(e.gmvCents)),
      o("Vendas", n(e.orders)),
      o("Ticket médio", t(Ro(e))),
      o("Itens vendidos", n(e.items)),
    );
  }
  function rl(e) {
    let t = ze.map((n) => {
      let o = e.lifeSounds.includes(n),
        i = u(
          "button",
          {
            class: `chip${o ? " on" : ""}`,
            type: "button",
            "aria-pressed": String(o),
            "data-key": `life:${n}`,
          },
          ai[n],
        );
      return (
        (i.onclick = () => {
          if (
            ((e.lifeSounds = o
              ? e.lifeSounds.filter((r) => r !== n)
              : [...e.lifeSounds, n]),
            !o && !w)
          )
            Q.preview(n);
          if (a.running && !w && !me.off.life)
            Q.start(e.lifeEvery, e.lifeSounds);
          H(),
            i.classList.toggle("on", !o),
            i.setAttribute("aria-pressed", String(!o)),
            Wn(150);
        }),
        i
      );
    });
    return u(
      "div",
      { class: "row chips" },
      u(
        "small",
        {},
        "Toque para ligar ou desligar. Ao ligar, você ouve como é.",
      ),
      u("div", { class: "chip-row" }, ...t),
    );
  }
  var Tr = (e) =>
    u(
      "li",
      {},
      u(
        "time",
        {},
        e.at.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      ),
      u("span", {}, e.text),
    );
  function al() {
    if (!a.log.length)
      return [
        u(
          "p",
          { class: "empty" },
          "Tudo o que a extensão fizer aparece aqui, com horário.",
        ),
      ];
    return [u("ol", { class: "group log" }, ...a.log.map(Tr))];
  }
  function Ae(e, t) {
    if (t) t.dataset.reveal = e;
    return t;
  }
  var Wi = new Set(),
    Nn = null;
  function sl(e) {
    if (St()) return !1;
    let t = [...oe.querySelectorAll("[data-reveal]")].filter(
      (n) => !e.has(n.dataset.reveal) && !("leaving" in n.dataset),
    );
    if (!t.length) return !1;
    for (let n of t) {
      n.dataset.leaving = "";
      let o = parseFloat(getComputedStyle(n.parentElement).rowGap) || 0;
      (n.style.overflow = "clip"),
        n.animate(
          [
            { height: `${n.offsetHeight}px`, opacity: 1 },
            {
              height: "0px",
              paddingTop: "0px",
              paddingBottom: "0px",
              marginTop: `${-o}px`,
              opacity: 0,
            },
          ],
          { duration: 160, easing: Gn, fill: "forwards" },
        );
    }
    return ft(160), x(), !0;
  }
  function Ar() {
    return JSON.stringify([
      a.screen,
      a.account,
      a.activateError,
      a.activating,
      a.planError,
      a.plan?.id,
      a.narrationReady,
      a.clipNames.length,
      a.clipKind,
      a.clipFor,
      a.cameraInUse,
      a.running,
      a.starting,
      w,
      m.tab === "log" && !a.log.length,
      a.nowSpeaking,
      a.nowProduct,
      a.plans.map((e) => e.id),
      m,
      yr().map((e) => e.ok),
      a.update,
      a.updateOpen,
      a.violations,
      yt(a.violations),
    ]);
  }
  var Lr = "",
    kt = 0;
  function Me() {
    if (!kt) kt = window.setTimeout(() => x(), 100);
  }
  var ji = !0;
  function x(e = !1) {
    window.clearTimeout(kt), (kt = 0);
    let t = Dn - performance.now();
    if (!e && t > 0) {
      window.clearTimeout(Ii), (Ii = window.setTimeout(() => x(), t));
      return;
    }
    if (ie.isOpen) {
      if (!e) return;
      ie.close();
    }
    if (((Lr = Ar()), v.dataset.collapsed !== String(m.collapsed)))
      v.dataset.collapsed = String(m.collapsed);
    if (
      (he.replaceChildren(
        Kn("span", er, { class: "mark" }),
        u(
          "span",
          {},
          a.running ? "No ar" : a.update ? "Nova versão" : "MediaFlowMZ Live",
        ),
        ...(a.running
          ? [
              u("span", {
                class: "onair",
                "data-live": "true",
                "aria-hidden": "true",
              }),
            ]
          : []),
      ),
      he.setAttribute(
        "aria-label",
        a.running ? "Abrir MediaFlowMZ Live (no ar)" : "Abrir MediaFlowMZ Live",
      ),
      (he.onclick = () => to(!1)),
      a.screen !== "main")
    )
      Nn = null;
    if (a.screen === "loading")
      return Bn(
        [Un(null)],
        [u("p", { class: "empty" }, "Carregando…")],
        null,
        "loading",
      );
    if (a.screen === "activate") return Gs();
    let n = Math.max(0, Cr.indexOf(m.tab));
    Mr(n), (Pt[2].textContent = ur());
    let o = a.running
        ? u(
            "span",
            { class: "status on" },
            u("span", {
              class: "onair",
              "data-live": "true",
              "aria-hidden": "true",
            }),
            "Ao vivo",
          )
        : a.account
          ? u(
              "span",
              { class: "status", title: a.account },
              a.account.split(" ")[0],
            )
          : null,
      i = m.tab === "audio" ? ol() : m.tab === "log" ? al() : tl(),
      r = u("button", { class: "link", type: "button" }, "Sair desta conta");
    r.onclick = async () => {
      await b.logout(), (a.storedKey = null), eo();
    };
    let l = u(
      "small",
      {
        class: "version",
        title: a.update
          ? `A ${a.update} já está disponível`
          : "Versão instalada",
      },
      `MediaFlowMZ Live ${I}${a.update ? ` · ${a.update} a caminho` : ""}`,
    );
    i.push(u("div", { class: "foot" }, r, l));
    let s = new Map();
    for (let d of i)
      if (d instanceof HTMLElement)
        for (let p of d.querySelectorAll("[data-reveal]"))
          s.set(p.dataset.reveal, p);
    let c = Nn === m.tab;
    if (c && !e && sl(new Set(s.keys()))) return;
    for (let [d, p] of s) if (c && !Wi.has(d)) (p.dataset.enter = ""), ft(200);
    if (((Wi = new Set(s.keys())), (Nn = m.tab), ji && !m.collapsed && !St()))
      (ji = !1), (j.dataset.intro = ""), ft(420);
    else delete j.dataset.intro;
    Bn([Un(o), wr(), ll], i, nl(), m.tab);
    for (let d of jn.splice(0)) d();
  }
  var Cr = ["inicio", "audio", "log"],
    Vn = u("span", { class: "tab-indicator", "aria-hidden": "true" }),
    Pt = Cr.map((e, t) => {
      let n = u(
        "button",
        { role: "tab", type: "button", "data-key": `tab:${e}` },
        ["Início", "Áudio", "Log"][t],
      );
      return (
        (n.onclick = () => {
          if (m.tab === e) return;
          (m.tab = e),
            H(),
            Mr(t),
            requestAnimationFrame(() => window.setTimeout(() => x(!0), 0));
        }),
        n
      );
    }),
    ll = u("div", { class: "tabs", role: "tablist" }, Vn, ...Pt);
  function Mr(e) {
    Pt.forEach((t, n) => t.setAttribute("aria-selected", String(n === e))),
      Vn.style.setProperty("--tab", String(e)),
      cl(Vn, e);
  }
  var Ki = -1;
  function cl(e, t) {
    let n = Ki;
    if (((Ki = t), n === t || n < 0)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.animate(
      [
        { transform: `translateX(${n * 100}%)` },
        { transform: `translateX(${t * 100}%)` },
      ],
      { duration: 435, easing: xs, fill: "none" },
    );
  }
  var ul = 300000,
    Qi = null;
  async function dl() {
    document.documentElement.append(v),
      lo({ doc: document, media: matchMedia(ao) });
    let e = (await chrome.storage.local.get("panelSettings")).panelSettings;
    if (
      ((m = {
        ...Ji,
        ...e,
        auto: { ...Fo(e?.auto), violation: "now", violationGrace: 0 },
        audio: { ...Se, ...e?.audio },
      }),
      ir(!0),
      E.apply(m.audio),
      m.planId)
    )
      At();
    D.setMirror(m.auto.mirror),
      je(),
      (O.enabled = m.audio.uiSounds),
      x(),
      be(),
      Bi(),
      window.setInterval(() => void Bi(), Ci);
    let t = await ws().catch(() => {
      return;
    });
    if (t?.length) {
      if (((fe = t.map((o) => o.blob)), (Ge = t.map((o) => o.name)), !F)) Ce();
    }
    window.setInterval(() => {
      let o = !chrome.runtime?.id,
        i = document.querySelectorAll(`#${v.id}`).length > 1;
      if (o !== a.orphaned || i !== a.duplicate)
        (a.orphaned = o), (a.duplicate = i), x();
      if (a.running) gt();
      let r = a.running ? (k.status?.lastProblem ?? null) : null;
      if (r !== Qi) {
        if (((Qi = r), r)) f(`⚠️ ${r}`);
      }
      let l = M.querySelector(".footer");
      if (l && a.running) {
        if (l.firstChild?.nodeType === Node.TEXT_NODE)
          l.firstChild.textContent = Sr();
        let d = l.querySelector(".sale-count");
        if (d) d.textContent = Er();
      }
      let s = M.activeElement;
      if (
        s?.tagName === "TEXTAREA" ||
        (s?.tagName === "INPUT" &&
          s.type !== "checkbox" &&
          s.type !== "range") ||
        Mt ||
        ie.isOpen
      )
        return;
      if (N || Ar() !== Lr) x();
    }, 1000),
      window.setInterval(() => {
        if (a.screen === "main") b.ping();
      }, ul);
    let n = await b.status();
    if (((a.storedKey = n.ok ? n.data.key : null), !n.ok || !n.data.active))
      return eo(n.ok ? "" : n.error);
    (a.account = n.data.account ?? ""), (a.screen = "main"), x(), await Jn();
  }
  window.addEventListener("pagehide", () => {
    if (a.running && a.sessionId)
      b.endSession(a.sessionId, "closed", { sales: k.sales });
  });
  dl();
})();
