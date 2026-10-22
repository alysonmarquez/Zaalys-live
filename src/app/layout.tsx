import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./landing.css";

const name = process.env.NEXT_PUBLIC_APP_NAME ?? "Zaalys";

export const metadata: Metadata = {
  title: {
    default: `${name} — Faça live e vídeos para o TikTok Shop`,
    template: `%s · ${name}`,
  },
  description:
    "Deixe sua live do TikTok Shop no ar — com você na câmera ou em loop com seus clipes — e crie vídeos de produto sem aparecer.",
  applicationName: "Zaalys",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Zaalys — Faça live e vídeos para o TikTok Shop",
    description:
      "Deixe sua live do TikTok Shop no ar — com você na câmera ou em loop com seus clipes — e crie vídeos de produto sem aparecer.",
    siteName: "Zaalys",
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
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="min-h-svh bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
