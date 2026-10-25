"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Conversa com a extensão Zaalys Live instalada neste navegador (ponte site-connect.js).
 * `version` vem preenchida quando a extensão está instalada; `connect(key)` ativa sem copiar a chave.
 */
export function useExtension() {
  const [version, setVersion] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setVersion(document.documentElement.dataset.zaalysLive || null);
    read();
    const onMsg = (e: MessageEvent) => {
      if (e.source !== window || e.data?.source !== "zaalys-live") return;
      if (e.data.type === "here") setVersion(e.data.version);
      if (e.data.type === "connected") {
        setStatus(e.data.ok ? "connected" : "error");
        setError(e.data.ok ? null : e.data.error || "Não foi possível conectar.");
      }
    };
    window.addEventListener("message", onMsg);
    window.postMessage({ source: "zaalys-site", type: "ping" }, location.origin);
    const t = setTimeout(read, 800);
    return () => {
      window.removeEventListener("message", onMsg);
      clearTimeout(t);
    };
  }, []);

  const connect = useCallback((key: string) => {
    setStatus("connecting");
    setError(null);
    window.postMessage({ source: "zaalys-site", type: "connect", key }, location.origin);
  }, []);

  return { version, installed: !!version, status, error, connect };
}
