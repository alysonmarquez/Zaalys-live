const $ = (id) => document.getElementById(id);
const send = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, r));

function show(text, ok) {
  $("status").textContent = text;
  $("status").className = `status ${ok ? "ok" : "err"}`;
}

(async () => {
  const r = await send({ type: "state" });
  if (r?.ok) {
    $("api").value = r.data.apiUrl;
    $("key").value = r.data.licenseKey;
    if (r.data.activated) show("Ativada neste computador.", true);
  }
})();

$("activate").onclick = async () => {
  const key = $("key").value.trim();
  const apiUrl = $("api").value.trim().replace(/\/$/, "");
  if (!/^[A-F0-9]{24}$/i.test(key)) return show("A chave tem 24 letras e números.", false);

  // Pede permissão para falar com o domínio do painel, se ainda não tiver.
  if (apiUrl && !apiUrl.startsWith("http://localhost")) {
    const granted = await chrome.permissions.request({ origins: [`${apiUrl}/*`] });
    if (!granted) return show("Sem permissão para acessar o painel.", false);
  }

  $("activate").disabled = true;
  const r = await send({ type: "activate", key, apiUrl });
  $("activate").disabled = false;
  if (!r?.ok) return show(r?.error || "Não foi possível ativar.", false);
  show(r.data.replacedOtherDevice ? "Ativada. O outro computador foi desconectado." : "Ativada neste computador.", true);
};
