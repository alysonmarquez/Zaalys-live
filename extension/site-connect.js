// MediaFlowMZ Live — ponte com o site do MediaFlowMZ.
// Marca a página com a versão instalada (o site mostra "Conectar neste navegador") e,
// quando a pessoa toca no botão, ativa a extensão com a chave da conta, sem copiar nada.
(() => {
  const version = chrome.runtime.getManifest().version;
  document.documentElement.dataset.zaalysLive = version;
  const reply = (data) => window.postMessage({ source: "zaalys-live", ...data }, location.origin);
  reply({ type: "here", version });

  const label = () => {
    const ua = navigator.userAgent;
    const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : "Linux";
    const browser = /Orion/.test(ua) ? "Orion" : /Quetta/.test(ua) ? "Quetta" : /Edg\//.test(ua) ? "Edge" : "Chrome";
    return `${browser} · ${os}`;
  };

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.origin !== location.origin) return;
    const d = e.data;
    if (d?.source !== "zaalys-site") return;
    if (d.type === "ping") return reply({ type: "here", version });
    if (d.type === "connect" && typeof d.key === "string") {
      chrome.runtime.sendMessage({ type: "connect", key: d.key, label: label() }, (r) =>
        reply({ type: "connected", ok: !!r?.ok, error: r?.ok ? undefined : r?.error || "A extensão não respondeu.", label: label() }),
      );
    }
  });
})();
