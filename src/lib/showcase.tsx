"use client";

import { createContext, useContext, useEffect } from "react";

// Conta de demonstração (ver isShowcaseEmail em lib/access): vem do servidor pelos layouts do Painel e
// do Estúdio, então as telas já nascem sabendo se mostram os dados de exemplo ou os dados reais.
const ShowcaseContext = createContext(false);

export function ShowcaseProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <ShowcaseContext.Provider value={value}>{children}</ShowcaseContext.Provider>;
}

export const useShowcase = () => useContext(ShowcaseContext);

// Quem aprova afiliados e muda comissões (ver isAdminEmail em lib/access).
const AdminContext = createContext(false);

export function AdminProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);

// Marca de apresentação (logo e favicon do TikTok Shop) só nas contas de demonstração, para mostrar a ideia
// em sala; as demais contas veem a marca MediaFlowMZ.
export const PRESENTATION_LOGO = "/presentation/tiktok-shop-logo.png";
const PRESENTATION_FAVICON = "/presentation/tiktok-favicon.png";

export function usePresentationFavicon(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const links = [...document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']")];
    const before = links.map((l) => [l.href, l.type] as const);
    for (const l of links) (l.href = PRESENTATION_FAVICON), (l.type = "image/png");
    if (!links.length) {
      const l = document.createElement("link");
      (l.rel = "icon"), (l.href = PRESENTATION_FAVICON), document.head.append(l);
      return () => l.remove();
    }
    return () => links.forEach((l, i) => ((l.href = before[i]![0]), (l.type = before[i]![1])));
  }, [active]);
}

// Quem pode abrir o Estúdio de LIVE (ver Access.studio em lib/access).
const StudioContext = createContext(false);

export function StudioProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export const useStudioAccess = () => useContext(StudioContext);
