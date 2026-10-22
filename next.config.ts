import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A extensão Chrome chama a API de outra origem (chrome-extension://).
  async headers() {
    return [
      {
        source: "/api/extension/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/central", destination: "/painel" },
      { source: "/dashboard", destination: "/painel?vista=dashboard" },
      { source: "/products", destination: "/painel/catalogo" },
      { source: "/venda", destination: "/painel/catalogo" },
      { source: "/templates", destination: "/painel/influencers" },
      { source: "/radar", destination: "/painel/radar" },
      { source: "/trend-boost", destination: "/painel/roteiros" },
      { source: "/ferramentas/raio-x", destination: "/painel/raio-x" },
      { source: "/ferramentas/live", destination: "/painel/live" },
      { source: "/settings", destination: "/painel/configuracoes" },
      { source: "/profile", destination: "/painel/conta" },
      { source: "/indique", destination: "/painel/indique" },
      { source: "/depoimento", destination: "/painel/depoimento" },
      { source: "/comissoes", destination: "/painel/comissoes" },
      { source: "/admin", destination: "/painel/afiliado" },
    ];
  },
};

export default nextConfig;
