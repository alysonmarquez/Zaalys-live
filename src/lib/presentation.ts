import type { Metadata } from "next";

// Marca de apresentação (logo e favicon do TikTok Shop) só nas contas de demonstração, para mostrar a ideia
// em sala; as demais contas veem a marca MediaFlowMZ.
export const PRESENTATION_LOGO = "/presentation/tiktok-shop-logo.png";
export const PRESENTATION_FAVICON = "/presentation/tiktok-favicon.png";

/** Favicon do TikTok na metadata da página quando a conta é de demonstração (vale para a aba já no primeiro carregamento). */
export const presentationMetadata = (showcase?: boolean): Metadata =>
  showcase ? { icons: { icon: [{ url: PRESENTATION_FAVICON, type: "image/png" }] } } : {};
