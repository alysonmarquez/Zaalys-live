"use client";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { postJSON } from "@/lib/fetch-json";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const STEPS = [
  "Baixe a extensão e descompacte a pasta.",
  "No Chrome, abra chrome://extensions e ligue o Modo do desenvolvedor.",
  "Clique em Carregar sem compactação e escolha a pasta da extensão.",
  "Abra a extensão, cole sua chave e clique em Ativar.",
  "Abra a página de LIVE do TikTok Shop, carregue os clipes e os produtos no painel da extensão e ligue.",
];

export function AccountTools({ initialKey, activatedAt, vapidKey }: { initialKey: string | null; activatedAt: string | null; vapidKey: string }) {
  const [key, setKey] = useState(initialKey);
  const [activated, setActivated] = useState(activatedAt);
  const [pushState, setPushState] = useState<"idle" | "on" | "denied" | "unsupported" | "error">("idle");
  const [busy, setBusy] = useState(false);

  async function createKey() {
    setBusy(true);
    const r = await postJSON<{ key: string }>("/api/license/reset", {});
    setKey(r.key);
    setBusy(false);
  }

  async function unbind() {
    setBusy(true);
    await postJSON("/api/license/reset?unbind=1", {});
    setActivated(null);
    setBusy(false);
  }

  async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapidKey) return setPushState("unsupported");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return setPushState("denied");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) });
      await postJSON("/api/push/subscribe", sub.toJSON());
      setPushState("on");
    } catch {
      setPushState("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-6">
        <h2 className="text-lg font-bold">Sua chave</h2>
        {key ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <code className="rounded-lg bg-paper px-3 py-2 text-lg font-semibold tracking-wider">{key}</code>
              <CopyButton text={key} />
            </div>
            <p className="mt-4 text-sm text-muted">
              {activated
                ? `Ativa em um computador desde ${new Date(activated).toLocaleString("pt-BR")}. Ativar em outro desconecta este.`
                : "Ainda não ativada em nenhum computador."}
            </p>
            {activated && (
              <button onClick={unbind} disabled={busy} className="btn-ghost mt-4">Desconectar computador</button>
            )}
          </>
        ) : (
          <button onClick={createKey} disabled={busy} className="btn-primary mt-4">Gerar minha chave</button>
        )}
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-bold">Alertas no celular</h2>
        <p className="mt-2 text-sm text-muted">
          Receba um aviso quando a live cair, tiver aviso de violação ou terminar. No celular, abra o painel pelo navegador
          e adicione à tela inicial antes de ativar.
        </p>
        <button onClick={enablePush} disabled={pushState === "on"} className="btn-primary mt-4">
          {pushState === "on" ? "Alertas ativados neste aparelho" : "Ativar alertas neste aparelho"}
        </button>
        {pushState === "denied" && <p className="mt-2 text-sm text-onair">As notificações estão bloqueadas nas configurações do navegador.</p>}
        {pushState === "unsupported" && <p className="mt-2 text-sm text-onair">Este navegador não aceita alertas. No iPhone, adicione o site à tela inicial primeiro.</p>}
        {pushState === "error" && <p className="mt-2 text-sm text-onair">Não foi possível ativar. Tente de novo.</p>}
      </section>

      <section className="panel p-6 lg:col-span-2">
        <h2 className="text-lg font-bold">Instalar a extensão</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <a href="/zaalys-extensao.zip" className="btn-primary mt-5" download>Baixar extensão Zaalys Live</a>
      </section>
    </div>
  );
}
