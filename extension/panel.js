// MediaFlowMZ Live — painel na página de LIVE (mundo isolado).
// Itens iguais aos do passo a passo do site: Conta conectada, Clipes da live, Live do MediaFlowMZ,
// Câmera MediaFlowMZ no TikTok, Produto no carrinho e o botão Ligar/Parar live automática.
(() => {
  if (window.__zaalysPanel) return;
  window.__zaalysPanel = true;

  // ---------- Página do TikTok (os mesmos pontos funcionam no Estúdio de LIVE do clone) ----------
  const DEFAULT_SELECTORS = {
    commentInput: '[data-tid="m4b_input_textarea"]',
    pinText: "^(fixar|pin)$",
    unpinText: "fixado|desfixar|desafixar|pinned|unpin",
    startText: "^iniciar live$|^go live$",
    systemText:
      "entrou|joined|curtiu|enviou|liked|seguiu|começou a seguir|comecou a seguir|started following|compartilhou|shared|boas-vindas|welcome to tiktok|diretrizes da comunidade|community guidelines|comprou|adicionou o produto",
  };
  let SEL = { ...DEFAULT_SELECTORS };
  const re = (s) => new RegExp(s, "i");
  const norm = (t) => (t || "").replace(/\s+/g, " ").trim();

  function commentBox() {
    const el = document.querySelector(SEL.commentInput);
    if (el) return el.matches("textarea, input") ? el : el.querySelector("textarea, input");
    return [...document.querySelectorAll("textarea, input[type=text]")].find((n) => /digite|coment|say something|add comment/i.test(n.placeholder || "")) || null;
  }

  function typeComment(text) {
    const box = commentBox();
    if (!box) throw new Error("Não encontrei a caixa de comentário da live.");
    if (box.disabled) throw new Error("A caixa de comentário só libera com a live no ar.");
    box.focus();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(box), "value")?.set;
    setter ? setter.call(box, text.slice(0, 100)) : (box.value = text.slice(0, 100));
    box.dispatchEvent(new Event("input", { bubbles: true }));
    box.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
  }

  // Botão de fixar (ou "Fixado") da linha do produto na lista da live.
  function findProductPin(name) {
    const key = norm(name).toLowerCase().slice(0, 24);
    const pinRe = re(SEL.pinText);
    const unpinRe = re(SEL.unpinText);
    for (const b of document.querySelectorAll("button, [role=button]")) {
      const t = norm(b.innerText);
      if (!pinRe.test(t) && !unpinRe.test(t)) continue;
      let row = b.parentElement;
      for (let i = 0; i < 6 && row; i++, row = row.parentElement) {
        if (norm(row.innerText).toLowerCase().includes(key)) return { button: b, pinned: unpinRe.test(t) };
      }
    }
    return null;
  }

  function startButton() {
    return [...document.querySelectorAll("button")].find((b) => re(SEL.startText).test(norm(b.innerText))) || null;
  }

  // ---------- Estado ----------
  const S = {
    account: false,
    deviceLabel: "",
    clips: [],
    lives: [],
    live: null, // { id, title, productUrl, comments: [] }
    cam: false,
    productListed: false,
    running: false,
    sessionId: null,
    timers: [],
    deck: [],
    lastComment: 0,
    lastAnswer: 0,
    greeted: new Set(),
    seen: new WeakSet(),
    pace: 90,
  };

  const bg = (msg) =>
    new Promise((resolve, reject) =>
      chrome.runtime.sendMessage(msg, (r) => (r?.ok ? resolve(r.data) : reject(new Error(r?.error || "A extensão não respondeu.")))),
    );
  const api = (path, init) => bg({ type: "api", path, init });
  const toPage = (type, payload) => window.postMessage({ source: "zaalys-ext", type, payload }, location.origin);
  const event = (kind, detail) =>
    S.sessionId && api("/api/extension/event", { method: "POST", body: { sessionId: S.sessionId, kind, detail } }).catch(() => {});

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.source !== "zaalys-cam") return;
    if (e.data.type === "cam-requested" && e.data.detail?.video) {
      S.cam = true;
      log("A página escolheu a câmera MediaFlowMZ Live.");
      render();
    }
    if (e.data.type === "cam-ended" && S.running) {
      log("O vídeo da live parou.", true);
      event("drop", { reason: "track ended" });
    }
    if (e.data.type === "preview" && ui) ui.preview.src = e.data.detail.dataUrl;
  });

  // Comentários de reserva, se a IA do painel não estiver disponível.
  function fallbackComments(title) {
    const n = title.split(/[-|,(]/)[0].trim();
    return [
      `Quem já conhece o ${n}? Conta aqui!`,
      `O ${n} está no carrinho laranja, é só clicar!`,
      `Corre que o ${n} está com preço especial na live!`,
      `Dúvida sobre o ${n}? Manda aqui que eu respondo.`,
      `Chegou agora? Estamos mostrando o ${n} ao vivo!`,
      `O link do ${n} está fixado aqui embaixo!`,
      `Segue a live pra não perder as próximas ofertas!`,
      `Comenta EU QUERO se você quer o ${n}!`,
    ];
  }

  function nextComment() {
    const list = S.live?.comments || [];
    if (!list.length) return null;
    if (!S.deck.length) S.deck = [...list].sort(() => Math.random() - 0.5);
    return S.deck.shift();
  }

  // ---------- Ações ----------
  async function loadAccount() {
    const st = await bg({ type: "state" });
    S.account = st.activated && !!st.licenseKey;
    S.deviceLabel = st.deviceLabel;
    if (S.account) {
      try {
        SEL = { ...DEFAULT_SELECTORS, ...((await api("/api/extension/config")).selectors || {}) };
        S.lives = (await api("/api/extension/preps")).preps || [];
      } catch (err) {
        S.account = false;
        log(err.message, true);
      }
    }
    render();
  }

  async function connectWithKey(key) {
    try {
      await bg({ type: "connect", key, label: deviceLabel() });
      log("Extensão conectada à sua conta.");
      await loadAccount();
    } catch (err) {
      log(err.message, true);
    }
  }

  async function chooseLive(id) {
    const live = S.lives.find((l) => l.id === id);
    if (!live) return;
    S.live = { ...live, comments: [] };
    render();
    try {
      const r = await api("/api/extension/comments", { method: "POST", body: { product: { name: live.title.slice(0, 200) }, count: 15 } });
      S.live.comments = r.comments || [];
    } catch {
      S.live.comments = fallbackComments(live.title);
    }
    S.deck = [];
    log(`Live escolhida: ${live.title.slice(0, 60)} (${S.live.comments.length} comentários).`);
    render();
  }

  function setClips(files) {
    S.clips = [...files].filter((f) => f.type.startsWith("video/"));
    toPage("set-clips", { files: S.clips });
    log(S.clips.length ? `${S.clips.length} clipes carregados. A câmera MediaFlowMZ Live já aparece na lista do TikTok.` : "Nenhum vídeo escolhido.");
    render();
  }

  function checkProduct() {
    S.productListed = !!(S.live && findProductPin(S.live.title));
    return S.productListed;
  }

  function pin() {
    if (!S.live) return;
    const found = findProductPin(S.live.title);
    if (!found) {
      S.productListed = false;
      return log("O produto não está na lista da live. Adicione-o no TikTok.", true);
    }
    S.productListed = true;
    if (found.pinned) return; // já está fixado
    found.button.click();
    log("Produto fixado.");
    event("pin", { product: S.live.title.slice(0, 120) });
  }

  function comment() {
    if (!S.running || Date.now() - S.lastComment < 8000) return;
    const text = nextComment();
    if (!text) return;
    try {
      typeComment(text);
      S.lastComment = Date.now();
      log(`Comentou: ${text}`);
      event("comment", { text });
    } catch (err) {
      log(err.message, true);
    }
  }

  const QUESTION = /\?|^(quanto|qual|quais|tem |serve|como|pode|entrega|frete|cor|tamanho|funciona|vale)/i;
  let chatObserver = null;
  function watchChat() {
    const sys = re(SEL.systemText);
    chatObserver = new MutationObserver((muts) => {
      for (const m of muts)
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement) || S.seen.has(n) || n.closest?.("[data-zaalys-panel]")) continue;
          S.seen.add(n);
          const text = norm(n.innerText);
          if (!text || text.length > 200) continue;
          const [user, ...rest] = text.split(/[:：]\s*|\n/);
          const msg = rest.join(" ").trim();
          if (sys.test(text)) {
            if (/entrou|joined/i.test(text) && user && !S.greeted.has(user) && S.greeted.size < 5000) {
              S.greeted.add(user);
              setTimeout(() => S.running && safeSay(`Oi, ${user}! Que bom ter você aqui.`), 1500);
              event("greeting", { user });
            }
            continue;
          }
          if (msg && QUESTION.test(msg) && Date.now() - S.lastAnswer > 20000 && S.live) {
            S.lastAnswer = Date.now();
            api("/api/extension/answer", { method: "POST", body: { question: msg.slice(0, 400), product: { name: S.live.title.slice(0, 200) } } })
              .then((r) => r?.reply && safeSay(`@${user} ${r.reply}`))
              .catch(() => {});
          }
        }
    });
    chatObserver.observe(document.body, { childList: true, subtree: true });
  }
  function safeSay(t) {
    try {
      typeComment(t);
      S.lastComment = Date.now();
    } catch {}
  }

  async function start() {
    if (!S.account) return log("Conecte a extensão à sua conta primeiro.", true);
    if (!S.clips.length) return log("Escolha os clipes da live.", true);
    if (!S.live) return log("Escolha a live do MediaFlowMZ.", true);
    try {
      S.sessionId = (await api("/api/extension/event", { method: "POST", body: { kind: "start", products: [{ name: S.live.title.slice(0, 120) }] } })).sessionId;
    } catch (err) {
      return log(err.message, true);
    }
    S.running = true;
    chrome.runtime.sendMessage({ type: "live-started", sessionId: S.sessionId });
    watchChat();
    const jitter = (s) => Math.floor(s * (0.75 + Math.random() * 0.5) * 1000);
    const loopComment = () => {
      comment();
      S.timers.push(setTimeout(loopComment, jitter(S.pace)));
    };
    S.timers.push(setTimeout(loopComment, 4000));
    S.timers.push(setInterval(pin, 60000));
    S.timers.push(setInterval(() => toPage("preview-request"), 3000));
    S.timers.push(setInterval(() => !navigator.onLine && event("drop", { reason: "offline" }), 15000));
    pin();
    const go = startButton();
    const off = go && (go.disabled || go.getAttribute("aria-disabled") === "true" || /(^|\s)(arco-btn-disabled|is-disabled)(\s|$)/.test(go.className));
    if (go && !off) {
      go.click();
      log("Cliquei em Iniciar LIVE no TikTok.");
    } else log("Se a live ainda não começou, clique em Iniciar LIVE no próprio TikTok e deixe o painel ligado.");
    render();
  }

  function stop(reason = "manual") {
    if (!S.running) return;
    S.running = false;
    S.timers.forEach((t) => (clearTimeout(t), clearInterval(t)));
    S.timers = [];
    chatObserver?.disconnect();
    event("end", { reason });
    chrome.runtime.sendMessage({ type: "live-stopped" });
    S.sessionId = null;
    log("Live automática parada.");
    render();
  }

  function deviceLabel() {
    const ua = navigator.userAgent;
    const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : "Linux";
    const browser = /Orion/.test(ua) ? "Orion" : /Quetta/.test(ua) ? "Quetta" : /Edg\//.test(ua) ? "Edge" : "Chrome";
    return `${browser} · ${os}`;
  }

  // ---------- Painel ----------
  let ui = null;
  const logs = [];
  function log(text, err = false) {
    logs.unshift({ text: `${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ${text}`, err });
    logs.length = Math.min(logs.length, 40);
    if (ui) renderLog();
  }

  const CSS = `
    :host{all:initial}
    *{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
    .box{width:320px;background:#fff;color:#161616;border-radius:14px;border:1px solid #e6e6e6;box-shadow:0 16px 48px -12px rgba(0,0,0,.35);overflow:hidden}
    .head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer}
    .brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px}
    .z{display:grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#ade74e;color:#0f1a01;font-weight:900;font-size:13px}
    .min{border:0;background:none;font-size:18px;color:#999;cursor:pointer;line-height:1}
    .body{padding:6px 12px 12px;max-height:70vh;overflow:auto}
    .item{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #f4f4f4}
    .dot{width:10px;height:10px;border-radius:50%;background:#d9d9d9;margin-top:4px;flex:none}
    .dot.ok{background:#22c55e}
    .t{font-size:13px;font-weight:600}
    .s{font-size:12px;color:#777;margin-top:2px;word-break:break-word}
    .act{margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .b{border:1px solid #ddd;background:#fff;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;color:#161616}
    button.b:disabled{opacity:.5;cursor:default}
    input.k,select{width:100%;border:1px solid #ddd;border-radius:8px;padding:6px 8px;font-size:12px}
    .go{width:100%;margin-top:10px;border:0;border-radius:10px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;background:#ade74e;color:#0f1a01}
    .go.stop{background:#222;color:#fff}
    .go:disabled{background:#e8e8e8;color:#999;cursor:default}
    .log{margin-top:10px;background:#fafafa;border-radius:8px;padding:6px 8px;font-size:11px;color:#555;max-height:110px;overflow:auto}
    .log p{margin:2px 0}.log .e{color:#d43}
    img.preview{width:44px;height:78px;object-fit:cover;border-radius:6px;background:#111;float:right;margin-left:8px}
    .collapsed .body{display:none}
  `;

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function build() {
    const host = document.createElement("div");
    host.setAttribute("data-zaalys-panel", "");
    host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${CSS}</style><div class="box"><div class="head"><span class="brand"><span class="z">M</span>MediaFlowMZ Live</span><button class="min" title="Minimizar">–</button></div><div class="body"></div></div>`;
    document.documentElement.appendChild(host);
    ui = { root, box: root.querySelector(".box"), body: root.querySelector(".body"), preview: null };
    root.querySelector(".head").onclick = () => ui.box.classList.toggle("collapsed");
    render();
  }

  function item(ok, title, sub, action = "") {
    return `<div class="item"><span class="dot ${ok ? "ok" : ""}"></span><div style="flex:1;min-width:0"><div class="t">${title}</div><div class="s">${sub}</div>${action ? `<div class="act">${action}</div>` : ""}</div></div>`;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function render() {
    if (!ui) return;
    if (S.live) checkProduct();
    const ready = S.account && S.clips.length && S.live;
    ui.body.innerHTML =
      item(
        S.account,
        "Conta conectada",
        S.account ? esc(S.deviceLabel || "Este navegador") : "Cole a chave das Configurações do MediaFlowMZ",
        S.account ? "" : `<input class="k" placeholder="Sua chave (24 letras e números)" spellcheck="false"><button class="b connect">Conectar</button>`,
      ) +
      item(
        S.clips.length > 0,
        "Clipes da live",
        S.clips.length ? `${S.clips.length} clipes em ordem aleatória` : "Os vídeos do produto (MP4)",
        `<label class="b" style="display:inline-block">Escolher<input type="file" class="clips" accept="video/*" multiple hidden></label>`,
      ) +
      item(
        !!S.live,
        "Live do MediaFlowMZ",
        S.live ? esc(S.live.title) + (S.live.comments.length ? " · pronta" : " · preparando…") : S.account ? "Escolha a live" : "Conecte a conta para ver suas lives",
        S.account
          ? `<select class="live"><option value="">Live ▾</option>${S.lives.map((l) => `<option value="${l.id}" ${S.live?.id === l.id ? "selected" : ""}>${esc(l.title.slice(0, 70))}</option>`).join("")}</select>`
          : "",
      ) +
      item(S.cam, "Câmera MediaFlowMZ no TikTok", S.cam ? "Recebendo o vídeo e a voz" : "Escolha “MediaFlowMZ Live (vídeo)” e “MediaFlowMZ Live (áudio)” no TikTok") +
      item(
        S.productListed,
        "Produto no carrinho",
        S.productListed ? "Na lista, será fixado" : "Copie o link e cole em Adicionar produtos",
        S.live?.productUrl ? `<button class="b copy">Copiar link</button>` : "",
      ) +
      `<img class="preview" alt="" ${S.running ? "" : 'style="display:none"'}>` +
      `<button class="go ${S.running ? "stop" : ""}" ${!S.running && !ready ? "disabled" : ""}>${S.running ? "■ Parar live automática" : "Ligar live automática"}</button>` +
      `<div class="log"></div>`;
    ui.preview = ui.body.querySelector(".preview");
    const q = (s) => ui.body.querySelector(s);
    q(".connect") && (q(".connect").onclick = () => connectWithKey(q(".k").value));
    q(".clips").onchange = (e) => setClips(e.target.files);
    q(".live") && (q(".live").onchange = (e) => chooseLive(e.target.value));
    q(".copy") &&
      (q(".copy").onclick = () => {
        navigator.clipboard.writeText(S.live.productUrl).then(() => {
          q(".copy").textContent = "Copiado";
          setTimeout(render, 1500);
        });
      });
    q(".go").onclick = () => (S.running ? stop("manual") : start());
    renderLog();
  }

  function renderLog() {
    const box = ui?.body.querySelector(".log");
    if (box) box.innerHTML = logs.map((l) => `<p class="${l.err ? "e" : ""}">${esc(l.text)}</p>`).join("") || "<p>Pronta.</p>";
  }

  chrome.storage.onChanged.addListener((c) => {
    if (c.activated || c.licenseKey) loadAccount();
  });

  build();
  loadAccount();
  setInterval(() => !S.running && S.live && render(), 5000); // confere se o produto entrou na lista
})();
