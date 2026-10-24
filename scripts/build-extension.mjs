// Empacota a extensão apontando para o domínio de produção.
// Uso: NEXT_PUBLIC_APP_URL=https://www.zaalys.com npm run extension:zip
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const api = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
if (!/^https:\/\/[^/]+$/.test(api)) {
  console.error("Defina NEXT_PUBLIC_APP_URL com o domínio https de produção (ex.: https://www.zaalys.com).");
  process.exit(1);
}

const out = join(root, ".extension-build");
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(join(root, "extension"), out, { recursive: true });

const bg = join(out, "background.js");
writeFileSync(bg, readFileSync(bg, "utf8").replace(/const DEFAULT_API = "[^"]*";/, `const DEFAULT_API = "${api}";`));

const manifestPath = join(out, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.host_permissions = manifest.host_permissions.map((h) =>
  h.startsWith("http://localhost") ? `${api}/*` : h,
);
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const zip = join(root, "public", "zaalys-extensao.zip");
rmSync(zip, { force: true });
execFileSync("zip", ["-r", "-q", zip, "."], { cwd: out });
rmSync(out, { recursive: true, force: true });
console.log(`Extensão gerada em public/zaalys-extensao.zip apontando para ${api}`);
