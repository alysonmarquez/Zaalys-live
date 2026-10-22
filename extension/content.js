// MediaFlow Live — painel e automação na página de LIVE do TikTok Shop (mundo isolado).
(() => {
  if (window.__mediaflowPanel) return;
  window.__mediaflowPanel = true;

  const MAX_PRODUCTS = 8;
  const MIN_GAP_MS = 8000; // intervalo mínimo entre dois comentários do anfitrião
  const QUESTION = /\?|^(quanto|qual|quais|tem |serve|como|pode|entrega|frete|cor|tamanho|funciona|vale)/i;
  const SALE = /comprou|purchased|bought/i;

  const settings = {
    commentEverySec: 90,
    pinEverySec: 60,
    rotateMinutes: 10,
    greet: true,
    answer: true,
    celebrate: true,
  };
  let products = []; // { name, price, details, files: File[], comments: string[] }
  let narration = null;
  let selectors = {};
  let running = false;
  let sessionId = null;
  let current = 0;
  let timers = [];
  let observer = null;
  const seen = new WeakSet();
  const queue = [];
  let lastComment = 0;
  let lastAnswer = 0;
  const greeted = new Set();

  // ---------- Comunicação ----------
  const bg = (msg) =>
    new Promise((resolve, reject) =>
      chrome.runtime.sendMessage(msg, (r) => (r?.ok ? resolve(r.data) : reject(new Error(r?.error || "Sem resposta da extensão")))),
    );
  const api = (path, init) => bg({ type: "api", path, init });
  const cam = (type, payload) => window.postMessage({ source: "mediaflow-ext", type, payload }, location.origin);
  const event = (kind, detail) =>
    sessionId && api("/api/extension/event", { method: "POST", body: { sessionId, kind, detail } }).catch(() => {});

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.source !== "mediaflow-cam") return;
    if (e.data.type === "cam-requested") log("A página pegou a câmera do MediaFlow.");
    if (e.data.type === "cam-ended" && running) { log("A transmissão de vídeo parou.", true); event("drop", { reason: "track ended" }); }
    if (e.data.type === "preview" && ui) ui.preview.src = e.data.detail.dataUrl;
  });

  // ---------- Página ----------
  const $ = (sel, root = document) => (sel ? root.querySelector(sel) : null);
  const $$ = (sel, root = document) => (sel ? [...root.querySelectorAll(sel)] : []);

  function typeComment(text) {
    const input = $(selectors.commentInput);
    if (!input) throw new Error("Campo de comentário não encontrado (seletor commentInput).");
    input.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text.slice(0, 150));
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const send = $(selectors.commentSend);
    if (send) send.click();
    else input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
  }

  // Fila com intervalo mínimo, para não parecer spam nem atropelar mensagens.
  function say(text, priority = false) {
    priority ? queue.unshift(text) : queue.push(text);
    if (queue.length > 6) queue.length = 6;
  }
  function drain() {
    if (!running || !queue.length || Date.now() - lastComment < MIN_GAP_MS) return;
    const text = queue.shift();
    try {
      typeComment(text);
      lastComment = Date.now();
      log(`Comentou: ${text}`);
      event("comment", { text });
    } catch (err) {
      log(err.message, true);
    }
  }

  function pinProduct() {
    const buttons = $$(selectors.pinButton);
    const btn = buttons[current] || buttons[0];
    if (!btn) return log("Botão de fixar produto não encontrado (seletor pinButton).", true);
    btn.click();
    event("pin", { product: products[current]?.name });
  }

  function hostComment() {
    const p = products[current];
    if (!p?.comments?.length) return;
    say(p.comments[Math.floor(Math.random() * p.comments.length)]);
  }

  function rotate() {
    if (products.length < 2) return;
    current = (current + 1) % products.length;
    cam("set-clips", { files: products[current].files });
    log(`Produto agora: ${products[current].name}`);
    pinProduct();
  }

  async function handleChat(node) {
    if (seen.has(node)) return;
    seen.add(node);
    const user = $(selectors.chatUser, node)?.textContent?.trim();
    const text = $(selectors.chatText, node)?.textContent?.trim() || "";

    if (node.matches?.(selectors.joinItem)) {
      if (settings.greet && user && !greeted.has(user) && greeted.size < 5000) {
        greeted.add(user);
        say(`Oi, @${user}! Que bom ter você aqui.`);
        event("greeting", { user });
      }
      return;
    }
    if (!user || !text) return;

    if (settings.celebrate && SALE.test(text)) {
      say(`Obrigado pela compra, @${user}!`, true);
      return event("sale", { user });
    }

    if (settings.answer && QUESTION.test(text) && Date.now() - lastAnswer > 20000) {
      lastAnswer = Date.now();
      try {
        const p = products[current];
        const r = await api("/api/extension/answer", { method: "POST", body: { question: text, product: { name: p.name, price: p.price, details: p.details } } });
        say(`@${user} ${r.reply}`, true);
        event("answer", { user, question: text });
      } catch (err) {
        log(err.message, true);
      }
    }
  }

  function watchChat() {
    observer = new MutationObserver(() => {
      $$(`${selectors.chatItem}, ${selectors.joinItem}`).slice(-15).forEach(handleChat);
      if ($(selectors.liveEndedMarker)) stop("end");
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // O que já está na tela não é respondido.
    $$(`${selectors.chatItem}, ${selectors.joinItem}`).forEach((n) => seen.add(n));
  }

  // ---------- Ligar e desligar ----------
  async function start() {
    readForm();
    const ready = products.filter((p) => p.name && p.files.length);
    if (!ready.length) return log("Adicione ao menos um produto com nome e clipes.", true);
    products = ready;
    setStatus("Preparando...");
    try {
      selectors = (await api("/api/extension/config")).selectors || {};
      for (const p of products) {
        log(`Gerando comentários para ${p.name}...`);
        p.comments = (await api("/api/extension/comments", { method: "POST", body: { product: { name: p.name, price: p.price, details: p.details }, count: 15 } })).comments;
      }
      sessionId = (await api("/api/extension/event", { method: "POST", body: { kind: "start", products: products.map((p) => ({ name: p.name })) } })).sessionId;
    } catch (err) {
      setStatus("Parada");
      return log(err.message, true);
    }

    current = 0;
    running = true;
    cam("set-clips", { files: products[0].files });
    cam("set-narration", { file: narration });
    cam("enable");
    chrome.runtime.sendMessage({ type: "live-started", sessionId });

    watchChat();
    timers = [
      setInterval(drain, 1000),
      setInterval(hostComment, settings.commentEverySec * 1000),
      setInterval(pinProduct, settings.pinEverySec * 1000),
      setInterval(rotate, settings.rotateMinutes * 60 * 1000),
      setInterval(() => { if (!navigator.onLine) event("drop", { reason: "offline" }); }, 15000),
      setInterval(() => cam("preview-request"), 3000),
    ];
    pinProduct();
    setStatus("Ligada");
    log("Câmera do MediaFlow pronta. Agora inicie a live na página: escolha a câmera e o microfone do MediaFlow, se pedir.");
  }

  function stop(reason = "manual") {
    if (!running) return;
    running = false;
    timers.forEach(clearInterval);
    timers = [];
    observer?.disconnect();
    queue.length = 0;
    cam("disable");
    event("end", { reason });
    chrome.runtime.sendMessage({ type: "live-stopped" });
    sessionId = null;
    setStatus("Parada");
    log(reason === "end" ? "A live terminou na página." : "Live desligada.");
  }

  // ---------- Painel (shadow DOM, não interfere no CSS da página) ----------
  let ui = null;

  function buildPanel() {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647";
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `
      <style>
        :host{all:initial}
        *{box-sizing:border-box;font-family:system-ui,sans-serif}
        .fab{width:52px;height:52px;border-radius:50%;border:0;background:#7c5cff;color:#fff;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.6)}
        .panel{display:none;position:absolute;right:0;bottom:64px;width:380px;max-height:80vh;overflow:auto;background:#161937;color:#eef0ff;border-radius:16px;border:1px solid #2a2e55;box-shadow:0 24px 60px -20px rgba(0,0,0,.7);padding:16px}
        .panel.open{display:block}
        h2{font-size:18px;margin:0}
        .row{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .status{font-size:13px;font-weight:700}
        .on{color:#2fd3a0}.off{color:#9aa0c3}
        fieldset{border:1px solid #2a2e55;border-radius:12px;padding:10px;margin:10px 0}
        legend{font-size:13px;font-weight:700;padding:0 4px}
        input,textarea{width:100%;border:1px solid #2a2e55;border-radius:8px;padding:7px 9px;font-size:13px;margin:3px 0;background:#0c0e22;color:#eef0ff}
        input[type=file]{border:0;padding:3px 0}
        input[type=checkbox]{width:auto;margin:0 6px 0 0}
        label{font-size:12px;color:#9aa0c3;display:block;margin-top:6px}
        label.check{display:flex;align-items:center;color:#eef0ff;font-size:13px}
        .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
        button.btn{border:0;border-radius:999px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer}
        .primary{background:#7c5cff;color:#fff}.ghost{background:#2a2e55;color:#eef0ff}.danger{background:#ff4d68;color:#fff}
        .log{background:#0c0e22;border-radius:10px;padding:8px;font-size:12px;max-height:140px;overflow:auto;margin-top:10px}
        .log p{margin:2px 0}.err{color:#ff4d68}
        img.preview{width:72px;height:128px;object-fit:cover;border-radius:8px;background:#000}
      </style>
      <button class="fab" title="MediaFlow Live">MF</button>
      <div class="panel" role="dialog" aria-label="MediaFlow Live">
        <div class="row"><h2>Live infinita</h2><span class="status off">Parada</span></div>
        <div class="products"></div>
        <button class="btn ghost add">Adicionar produto</button>
        <fieldset><legend>Narração (opcional)</legend>
          <input type="file" class="narration" accept="audio/*">
          <label>Áudio em loop no lugar do microfone. Sem narração, vai o som dos clipes.</label>
        </fieldset>
        <fieldset><legend>Ritmo</legend>
          <div class="grid">
            <div><label>Comentar a cada (s)</label><input type="number" min="30" class="commentEverySec"></div>
            <div><label>Fixar a cada (s)</label><input type="number" min="30" class="pinEverySec"></div>
            <div><label>Trocar produto (min)</label><input type="number" min="2" class="rotateMinutes"></div>
          </div>
          <label class="check"><input type="checkbox" class="greet">Dar oi para quem entra</label>
          <label class="check"><input type="checkbox" class="answer">Responder perguntas</label>
          <label class="check"><input type="checkbox" class="celebrate">Comemorar vendas</label>
        </fieldset>
        <div class="row">
          <img class="preview" alt="Prévia da câmera">
          <div style="display:flex;gap:6px"><button class="btn primary start">Ligar</button><button class="btn danger stop">Desligar</button></div>
        </div>
        <div class="log" aria-live="polite"></div>
      </div>`;
    document.documentElement.appendChild(host);

    ui = {
      root,
      panel: root.querySelector(".panel"),
      products: root.querySelector(".products"),
      status: root.querySelector(".status"),
      log: root.querySelector(".log"),
      preview: root.querySelector(".preview"),
    };
    root.querySelector(".fab").onclick = () => ui.panel.classList.toggle("open");
    root.querySelector(".add").onclick = () => addProductRow();
    root.querySelector(".start").onclick = start;
    root.querySelector(".stop").onclick = () => stop("manual");
    root.querySelector(".narration").onchange = (e) => { narration = e.target.files[0] || null; if (running) cam("set-narration", { file: narration }); };
    for (const k of ["commentEverySec", "pinEverySec", "rotateMinutes"]) root.querySelector(`.${k}`).value = settings[k];
    for (const k of ["greet", "answer", "celebrate"]) root.querySelector(`.${k}`).checked = settings[k];

    chrome.storage.local.get(["products", "settings"], (s) => {
      Object.assign(settings, s.settings || {});
      for (const k of ["commentEverySec", "pinEverySec", "rotateMinutes"]) root.querySelector(`.${k}`).value = settings[k];
      for (const k of ["greet", "answer", "celebrate"]) root.querySelector(`.${k}`).checked = settings[k];
      const saved = s.products?.length ? s.products : [{}];
      saved.forEach((p) => addProductRow(p));
    });
  }

  function addProductRow(p = {}) {
    if (ui.products.children.length >= MAX_PRODUCTS) return log(`Máximo de ${MAX_PRODUCTS} produtos.`, true);
    const fs = document.createElement("fieldset");
    fs.innerHTML = `<legend>Produto ${ui.products.children.length + 1}</legend>
      <input class="name" placeholder="Nome do produto">
      <input class="price" placeholder="Preço">
      <textarea class="details" rows="2" placeholder="Detalhes (a IA usa para comentar e responder)"></textarea>
      <label>Clipes do produto (vídeos curtos, verticais)</label>
      <input type="file" class="files" accept="video/*" multiple>
      <button class="btn ghost remove" style="margin-top:4px">Remover</button>`;
    fs.querySelector(".name").value = p.name || "";
    fs.querySelector(".price").value = p.price || "";
    fs.querySelector(".details").value = p.details || "";
    fs.querySelector(".remove").onclick = () => fs.remove();
    ui.products.appendChild(fs);
  }

  function readForm() {
    const r = ui.root;
    for (const k of ["commentEverySec", "pinEverySec", "rotateMinutes"]) settings[k] = Math.max(k === "rotateMinutes" ? 2 : 30, Number(r.querySelector(`.${k}`).value) || settings[k]);
    for (const k of ["greet", "answer", "celebrate"]) settings[k] = r.querySelector(`.${k}`).checked;
    products = [...ui.products.children].map((fs) => ({
      name: fs.querySelector(".name").value.trim(),
      price: fs.querySelector(".price").value.trim(),
      details: fs.querySelector(".details").value.trim(),
      files: [...fs.querySelector(".files").files],
      comments: [],
    }));
    // Os vídeos não ficam salvos (o navegador não permite); nome, preço e detalhes sim.
    chrome.storage.local.set({ settings, products: products.map(({ name, price, details }) => ({ name, price, details })) });
  }

  function setStatus(text) {
    if (!ui) return;
    ui.status.textContent = text;
    ui.status.className = `status ${text === "Ligada" ? "on" : "off"}`;
  }

  function log(text, error = false) {
    if (!ui) return console.log("[MediaFlow]", text);
    const p = document.createElement("p");
    p.textContent = `${new Date().toLocaleTimeString("pt-BR")} ${text}`;
    if (error) p.className = "err";
    ui.log.prepend(p);
    while (ui.log.children.length > 60) ui.log.lastChild.remove();
  }

  // Só mostra o painel nas páginas de LIVE.
  const isLivePage = () => /live/i.test(location.pathname + location.hostname);
  if (isLivePage()) buildPanel();
  else {
    let last = location.href;
    new MutationObserver(() => {
      if (location.href !== last) {
        last = location.href;
        if (!ui && isLivePage()) buildPanel();
      }
    }).observe(document, { childList: true, subtree: true });
  }
})();
