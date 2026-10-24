"use client";

import { useEffect, useState } from "react";

/**
 * true quando o painel roda em modo demonstração (sem banco, fora de produção).
 * Nesse modo as ferramentas mostram as respostas de exemplo do original, sem chamar a IA.
 */
export function useIsDemo() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => setDemo(Boolean(user?.demo)))
      .catch(() => {});
  }, []);
  return demo;
}
