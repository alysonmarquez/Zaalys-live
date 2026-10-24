// Zaalys Live — service worker.
// Faz as chamadas à API do Zaalys (evita CORS no content script) e guarda a ativação.

const DEFAULT_API = "http://localhost:3000";

async function getState() {
  const s = await chrome.storage.local.get(["apiUrl", "licenseKey", "deviceId", "activated"]);
  if (!s.deviceId) {
    s.deviceId = crypto.randomUUID();
    await chrome.storage.local.set({ deviceId: s.deviceId });
  }
  return { apiUrl: s.apiUrl || DEFAULT_API, licenseKey: s.licenseKey || "", deviceId: s.deviceId, activated: !!s.activated };
}

async function api(path, { method = "GET", body } = {}) {
  const st = await getState();
  if (!st.licenseKey) throw new Error("Extensão não ativada. Abra o ícone da extensão e cole sua chave.");
  const res = await fetch(`${st.apiUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `License ${st.licenseKey}:${st.deviceId}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    await chrome.storage.local.set({ activated: false });
    throw new Error(data.error || "Chave inválida ou ativada em outro computador.");
  }
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

async function activate(key, apiUrl) {
  const st = await getState();
  const url = (apiUrl || st.apiUrl).replace(/\/$/, "");
  const res = await fetch(`${url}/api/extension/activate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key: key.trim().toUpperCase(), deviceId: st.deviceId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  await chrome.storage.local.set({ apiUrl: url, licenseKey: key.trim().toUpperCase(), activated: true });
  return data;
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  (async () => {
    try {
      if (msg.type === "state") return reply({ ok: true, data: await getState() });
      if (msg.type === "activate") return reply({ ok: true, data: await activate(msg.key, msg.apiUrl) });
      if (msg.type === "api") return reply({ ok: true, data: await api(msg.path, msg.init) });
      reply({ ok: false, error: "Mensagem desconhecida" });
    } catch (err) {
      reply({ ok: false, error: err.message });
    }
  })();
  return true; // resposta assíncrona
});

// Batimento enquanto há live: se a aba fechar, o content script para de bater e o servidor pode alertar.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "heartbeat") return;
  const { liveSession } = await chrome.storage.local.get("liveSession");
  if (!liveSession) return chrome.alarms.clear("heartbeat");
  const tabs = await chrome.tabs.query({ url: "https://*.tiktok.com/*" });
  if (!tabs.some((t) => t.id === liveSession.tabId)) {
    // A aba da live sumiu: avisa como queda.
    await api("/api/extension/event", { method: "POST", body: { sessionId: liveSession.id, kind: "drop", detail: { reason: "aba fechada" } } }).catch(() => {});
    await chrome.storage.local.remove("liveSession");
    chrome.alarms.clear("heartbeat");
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "live-started" && sender.tab) {
    chrome.storage.local.set({ liveSession: { id: msg.sessionId, tabId: sender.tab.id } });
    chrome.alarms.create("heartbeat", { periodInMinutes: 1 });
  }
  if (msg.type === "live-stopped") {
    chrome.storage.local.remove("liveSession");
    chrome.alarms.clear("heartbeat");
  }
});
