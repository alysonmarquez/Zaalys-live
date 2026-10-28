import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import "./landing.css";

// Fontes servidas pelo próprio site (sem esperar o Google Fonts no carregamento).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap", weight: ["500", "600", "700", "800"] });

const name = process.env.NEXT_PUBLIC_APP_NAME ?? "MediaFlowMZ";

export const metadata: Metadata = {
  title: {
    default: `${name} — Faça live e vídeos para o TikTok Shop`,
    template: `%s · ${name}`,
  },
  description:
    "Deixe sua live do TikTok Shop no ar — com você na câmera ou em loop com seus clipes — e crie vídeos de produto sem aparecer.",
  applicationName: "MediaFlowMZ",
  manifest: "/manifest.webmanifest",
  icons: {
    // NEXT_PUBLIC_FAVICON troca o favicon por máquina (ex.: apresentações), definido em .env.local.
    icon: process.env.NEXT_PUBLIC_FAVICON
      ? [{ url: process.env.NEXT_PUBLIC_FAVICON }]
      : [{ url: "/favicon/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "MediaFlowMZ — Faça live e vídeos para o TikTok Shop",
    description:
      "Deixe sua live do TikTok Shop no ar — com você na câmera ou em loop com seus clipes — e crie vídeos de produto sem aparecer.",
    siteName: "MediaFlowMZ",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#110f0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${geist.variable} ${geistMono.variable} ${hanken.variable}`} suppressHydrationWarning>
      <body className="min-h-svh bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
