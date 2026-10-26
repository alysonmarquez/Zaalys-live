"use client";

import { useEffect } from "react";
import { LIVE_SIM_CONFIG_EVENT, loadLiveSim, saveLiveSim, type LiveSimConfig } from "@/lib/estudio-live-sim";
import { OVERRIDES_EVENT, loadOverrides, saveOverrides, type MetricOverrides } from "@/lib/estudio-lives";

/**
 * Sincroniza os números editados da LIVE com a conta (rota /api/live/settings): ao abrir, traz o que foi salvo
 * em outro aparelho; ao editar, envia. O navegador continua guardando uma cópia, então tudo funciona offline
 * ou antes da migração do banco.
 */
export function useLiveSettingsSync() {
  useEffect(() => {
    let applying = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    fetch("/api/live/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { settings?: { sim?: Partial<LiveSimConfig>; overrides?: MetricOverrides } | null } | null) => {
        const s = d?.settings;
        if (!s) return;
        applying = true;
        if (s.sim) saveLiveSim({ ...loadLiveSim(), ...s.sim });
        if (s.overrides) saveOverrides(s.overrides);
        applying = false;
      })
      .catch(() => {});

    const push = () => {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fetch("/api/live/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sim: loadLiveSim(), overrides: loadOverrides() }),
        }).catch(() => {});
      }, 800);
    };
    window.addEventListener(LIVE_SIM_CONFIG_EVENT, push);
    window.addEventListener(OVERRIDES_EVENT, push);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(LIVE_SIM_CONFIG_EVENT, push);
      window.removeEventListener(OVERRIDES_EVENT, push);
    };
  }, []);
}
