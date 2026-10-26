"use client";

import { createContext, useContext } from "react";

// Conta de demonstração (ver isShowcaseEmail em lib/access): vem do servidor pelos layouts do Painel e
// do Estúdio, então as telas já nascem sabendo se mostram os dados de exemplo ou os dados reais.
const ShowcaseContext = createContext(false);

export function ShowcaseProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <ShowcaseContext.Provider value={value}>{children}</ShowcaseContext.Provider>;
}

export const useShowcase = () => useContext(ShowcaseContext);
