import type { Metadata, Viewport } from "next";
import "./globals.css";

const name = process.env.NEXT_PUBLIC_APP_NAME ?? "MediaFlow";

export const metadata: Metadata = {
  title: { default: `${name} — live e vídeos para o TikTok Shop`, template: `%s · ${name}` },
  description:
    "Deixe sua live do TikTok Shop rodando com seus clipes, comentários e produto fixado, e prepare roteiros e prompts de vídeo com IA.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#0c0e22", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
