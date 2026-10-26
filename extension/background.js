// MediaFlowMZ Live — service worker.
// Fala com a API do painel (evita CORS no content script), guarda a ativação e vigia a live.

const DEFAULT_API = "http://localhost:3000";

async function getState() {
  const s = await chrome.storage.local.get(["apiUrl", "licenseKey", "deviceId", "activated", "deviceLabel"]);
  if (!s.deviceId) {
    s.deviceId = crypto.randomUUID();
    await chrome.storage.local.set({ deviceId: s.deviceId });
  }
  return {
    apiUrl: s.apiUrl || DEFAULT_API,
    licenseKey: s.licenseKey || "",
    deviceId: s.deviceId,
    activated: !!s.activated,
    deviceLabel: s.deviceLabel || "",
    version: chrome.runtime.getManifest().version,
  };
}

async function api(path, { method = "GET", body } = {}) {
  const st = await getState();
  if (!st.licenseKey) throw new Error("Conecte a extensão à sua conta primeiro.");
  const res = await fetch(`${st.apiUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", authorization: `License ${st.licenseKey}:${st.deviceId}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    await chrome.storage.local.set({ activated: false });
    throw new Error(data.error || "Chave inválida ou conectada em outro aparelho.");
  }
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

async function activate(key, label) {
  const st = await getState();
  const clean = String(key).trim().toUpperCase();
  const res = await fetch(`${st.apiUrl}/api/extension/activate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key: clean, deviceId: st.deviceId, label }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  await chrome.storage.local.set({ licenseKey: clean, activated: true, deviceLabel: label || "" });
  return data;
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    try {
      if (msg.type === "state") return reply({ ok: true, data: await getState() });
      if (msg.type === "activate" || msg.type === "connect") return reply({ ok: true, data: await activate(msg.key, msg.label) });
      if (msg.type === "disconnect") {
        await chrome.storage.local.set({ licenseKey: "", activated: false });
        return reply({ ok: true, data: {} });
      }
      if (msg.type === "api") return reply({ ok: true, data: await api(msg.path, msg.init) });
      if (msg.type === "live-started" && sender.tab) {
        await chrome.storage.local.set({ liveSession: { id: msg.sessionId, tabId: sender.tab.id } });
        chrome.alarms.create("heartbeat", { periodInMinutes: 1 });
        return reply({ ok: true });
      }
      if (msg.type === "live-stopped") {
        await chrome.storage.local.remove("liveSession");
        chrome.alarms.clear("heartbeat");
        return reply({ ok: true });
      }
      reply({ ok: false, error: "Mensagem desconhecida" });
    } catch (err) {
      reply({ ok: false, error: err.message });
    }
  })();
  return true;
});

// Se a aba da live fechar com a automação ligada, avisa o painel como queda (vira alerta no celular).
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "heartbeat") return;
  const { liveSession } = await chrome.storage.local.get("liveSession");
  if (!liveSession) return chrome.alarms.clear("heartbeat");
  const alive = await chrome.tabs.get(liveSession.tabId).catch(() => null);
  if (!alive) {
    await api("/api/extension/event", {
      method: "POST",
      body: { sessionId: liveSession.id, kind: "drop", detail: { reason: "aba fechada" } },
    }).catch(() => {});
    await chrome.storage.local.remove("liveSession");
    chrome.alarms.clear("heartbeat");
  } else {
    api("/api/extension/event", { method: "POST", body: { sessionId: liveSession.id, kind: "heartbeat" } }).catch(() => {});
  }
});
