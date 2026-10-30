"use client";

import Link from "next/link";
import React, { useState } from "react";
import { DesempenhoEditor } from "@/components/desempenho-editor";
import { useShowcase } from "@/lib/showcase";
import { LivePerformance } from "./live-performance";
import { LiveTools } from "./live-tools";

// Configurações da LIVE: Estúdio, desempenho, comentários automáticos e OBS. Para quem aprova afiliados ficam no Admin
// (a tela do Assistente de Live aparece nas apresentações); para os afiliados aprovados, no próprio Assistente.
export function LiveConfig({ openPerf = false }: { openPerf?: boolean }) {
  const showcase = useShowcase();
  const [showTools, setShowTools] = useState(false);
  const [showObs, setShowObs] = useState(false);
  const [showPerf, setShowPerf] = useState(openPerf);
  return (
    <div className="space-y-2">
      <div>
        <Link
          href="/estudio/console"
          target="_blank"
          className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Abrir o Estúdio de LIVE
        </Link>
        <p className="text-xs text-muted-foreground">Console e desempenho das transmissões, numa janela própria.</p>
      </div>
      <div>
        <button
          type="button"
          onClick={() => setShowPerf((v) => !v)}
          className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
        >
          {showPerf ? "Fechar desempenho da LIVE" : "Editar desempenho da LIVE"}
        </button>
        <p className="text-xs text-muted-foreground">
          {showcase ? "Pedidos caindo em tempo real no Painel de LIVE do Estúdio, no padrão do TikTok." : "Ajuste os números da sua LIVE no Estúdio de LIVE."}
        </p>
        {showPerf && (
          <div className="space-y-3 pt-3">
            <LivePerformance />
            <DesempenhoEditor initial="hoje" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setShowTools((v) => !v)}
        className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
      >
        {showTools ? "Fechar comentários automáticos" : "Editar comentários automáticos"}
      </button>
      <div>
        <button
          type="button"
          onClick={() => setShowObs((v) => !v)}
          className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
        >
          Transmitir pelo OBS ou LIVE Studio
        </button>
        <p className="text-xs text-muted-foreground">
          Só se o seu computador não transmite pelo navegador. Por esse caminho a extensão não comenta, não fixa o produto e não
          bloqueia ninguém.
        </p>
        {showObs && (
          <p className="mt-2 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
            No OBS, adicione os clipes como fonte de mídia em loop e use a chave de transmissão do LIVE Studio. Comentários,
            produto fixado e respostas ficam por sua conta.
          </p>
        )}
      </div>
      {showTools && (
        <div className="pt-4">
          <LiveTools />
        </div>
      )}
    </div>
  );
}
