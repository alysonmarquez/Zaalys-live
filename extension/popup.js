const $ = (id) => document.getElementById(id);
const send = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, r));

function show(text, ok) {
  $("status").textContent = text;
  $("status").className = `status ${ok ? "ok" : "err"}`;
}

async function refresh() {
  const r = await send({ type: "state" });
  if (!r?.ok) return;
  $("v").textContent = `Versão ${r.data.version}`;
  const on = r.data.activated && r.data.licenseKey;
  $("form").hidden = !!on;
  $("disconnect").hidden = !on;
  $("help").hidden = !!on;
  if (on) show(`Conectada · ${r.data.deviceLabel || "este navegador"}`, true);
}

$("activate").onclick = async () => {
  const key = $("key").value.trim();
  if (!/^[A-F0-9]{24}$/i.test(key)) return show("A chave tem 24 letras e números.", false);
  $("activate").disabled = true;
  const r = await send({ type: "connect", key, label: "Chrome" });
  $("activate").disabled = false;
  if (!r?.ok) return show(r?.error || "Não foi possível conectar.", false);
  refresh();
};

$("disconnect").onclick = async () => {
  await send({ type: "disconnect" });
  show("Desconectada.", false);
  refresh();
};

refresh();
