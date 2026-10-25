// Empacota a extensão Zaalys Live apontando para o domínio do painel.
// Uso: NEXT_PUBLIC_APP_URL=https://mediaflow-gamma.vercel.app npm run extension:zip
// Gera public/downloads/zaalys-live.zip (pasta zaalys-live/, para "Carregar sem compactação")
// e public/downloads/zaalys-live.crx (para Orion e Quetta no celular), se houver a chave de assinatura
// em EXTENSION_KEY_PATH (padrão: .extension-key.pem, fora do git).
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const api = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
if (!/^https:\/\/[^/]+$/.test(api)) {
  console.error("Defina NEXT_PUBLIC_APP_URL com o domínio https do painel (ex.: https://mediaflow-gamma.vercel.app).");
  process.exit(1);
}

const tmp = join(root, ".extension-build");
const out = join(tmp, "zaalys-live");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp);
cpSync(join(root, "extension"), out, { recursive: true });

// Troca o endereço de desenvolvimento pelo do painel em todos os arquivos que o usam.
for (const f of ["background.js", "manifest.json"]) {
  const p = join(out, f);
  writeFileSync(p, readFileSync(p, "utf8").replaceAll("http://localhost:3000", api));
}

const dl = join(root, "public", "downloads");
mkdirSync(dl, { recursive: true });
const zip = join(dl, "zaalys-live.zip");
rmSync(zip, { force: true });
execFileSync("zip", ["-r", "-q", "-X", zip, "zaalys-live"], { cwd: tmp });
console.log(`zip: public/downloads/zaalys-live.zip → ${api}`);

const keyPath = process.env.EXTENSION_KEY_PATH || join(root, ".extension-key.pem");
const crx = join(dl, "zaalys-live.crx");
if (existsSync(keyPath)) {
  rmSync(crx, { force: true });
  execFileSync("npx", ["-y", "crx3@2.0.0", "-p", keyPath, "-o", crx, "--", out], { stdio: "inherit" });
  console.log("crx: public/downloads/zaalys-live.crx");
} else {
  console.warn(`Sem chave em ${keyPath}: o .crx não foi gerado.`);
}
rmSync(tmp, { recursive: true, force: true });
