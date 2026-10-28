"use client";

import { createContext, useContext } from "react";

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

export { PRESENTATION_LOGO } from "@/lib/presentation";

// Quem pode abrir o Estúdio de LIVE (ver Access.studio em lib/access).
const StudioContext = createContext(false);

export function StudioProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export const useStudioAccess = () => useContext(StudioContext);
