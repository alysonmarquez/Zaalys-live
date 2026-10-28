import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { ChatReply, LoopComments, chatReplyPrompt, loopCommentsPrompt } from "@/lib/ai/prompts";
import { notifyUser } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/server";
import { ZAALYS_PRODUCTS } from "@/lib/zaalys-data";

// API da extensão MediaFlowMZ Live (painel completo, versão 4). Cada chamada é POST /api/live-ext/<nome>
// com corpo { json: entrada } e devolve { json: saída }; erro vem com status HTTP e { json: { message } }.
// A extensão manda a chave em x-mf-key, o id do aparelho em x-mf-device e a versão em x-mf-version.

const EXT_VERSION = "4.1.0";
const DEMO_USER = "00000000-0000-0000-0000-000000000000";

const ok = (data: unknown) => NextResponse.json({ json: data ?? null });
const err = (status: number, message: string) => NextResponse.json({ json: { message } }, { status });

type Auth = { userId: string; demo: boolean };

const DEMO_PREPS = [
  "Creme Gel Regenerador Facial Gota de Colágeno Kokeshi",
  "Hidrabene Protetor solar facial fps 70 Uniformizador",
  "BIORE UV AQUA RICH WATERY ESSENCE 50g",
  "Mounjarin Psyllium 60/90 e 120 Caps - Etron",
];

const productOf = (id: number | null | undefined, title?: string) =>
  ZAALYS_PRODUCTS.find((p) => p.id === id) ??
  (title ? ZAALYS_PRODUCTS.find((p) => p.title.toLowerCase().startsWith(title.toLowerCase().slice(0, 20))) : undefined);

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Comentários do anfitrião quando a IA não responde: lembretes honestos, sem fingir ser cliente. */
function fallbackComments(title: string) {
  // Nome curto (as primeiras palavras), para o comentário não ficar enorme.
  const short = title.split(/[-–|,(]/)[0]!.trim().split(/\s+/).slice(0, 4).join(" ");
  return [
    `O ${short} está no carrinho laranja aqui embaixo 🧡`,
    `Ficou com dúvida sobre o ${short}? Pergunta aqui no chat que eu respondo!`,
    `Toca no carrinho para ver preço e frete do ${short}`,
    `Quem acabou de chegar: o produto da live é o ${short} 👇`,
    `Dúvida de tamanho, uso ou entrega? Manda no chat`,
    `Confere as avaliações do ${short} direto no carrinho`,
    `Aproveita o preço da live, ele está fixado no carrinho`,
    `Segue o perfil para não perder as próximas lives ✨`,
    `Quer ver de novo como funciona? Fica comigo que eu mostro`,
    `O link do ${short} está aqui no carrinho laranja`,
  ];
}

async function authFrom(req: Request): Promise<Auth | null> {
  const key = (req.headers.get("x-mf-key") ?? "").trim().toUpperCase();
  const device = (req.headers.get("x-mf-device") ?? "").trim();
  if (!/^[A-F0-9]{24}$/.test(key) || !/^[\w-]{8,64}$/.test(device)) return null;
  if (isDemoMode()) return { userId: DEMO_USER, demo: true };
  const db = createAdminClient();
  const { data: lic } = await db.from("licenses").select("user_id, device_id").eq("key", key).maybeSingle();
  if (!lic || lic.device_id !== device) return null;
  return (await hasAccess(lic.user_id)) ? { userId: lic.user_id, demo: false } : null;
}

async function hasAccess(userId: string) {
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("email").eq("id", userId).maybeSingle();
  const email = profile?.email?.toLowerCase();
  const cols = "plan, expires_at";
  const [byUser, byEmail] = await Promise.all([
    db.from("subscriptions").select(cols).eq("status", "active").eq("user_id", userId),
    email ? db.from("subscriptions").select(cols).eq("status", "active").eq("email", email) : Promise.resolve({ data: [] }),
  ]);
  return [...(byUser.data ?? []), ...(byEmail.data ?? [])].some(
    (s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > Date.now()),
  );
}

async function activate(req: Request, input: unknown) {
  const key = (req.headers.get("x-mf-key") ?? "").trim().toUpperCase();
  const device = (req.headers.get("x-mf-device") ?? "").trim();
  const label = z.object({ deviceLabel: z.string().max(60).optional() }).safeParse(input ?? {}).data?.deviceLabel ?? null;
  if (!/^[A-F0-9]{24}$/.test(key)) return err(400, "Essa chave não é do MediaFlowMZ. Copie a chave em Configurações, no site.");
  if (!/^[\w-]{8,64}$/.test(device)) return err(400, "Não identifiquei este aparelho. Atualize a extensão e tente de novo.");
  if (isDemoMode()) return ok({ name: "Criador MediaFlowMZ", release: null });

  const db = createAdminClient();
  const { data: lic } = await db.from("licenses").select("id, user_id").eq("key", key).maybeSingle();
  if (!lic) return err(404, "Não encontramos essa chave. Confira em Configurações, no site do MediaFlowMZ.");
  if (!(await hasAccess(lic.user_id))) return err(403, "Seu acesso ao MediaFlowMZ não está ativo. Confira seu plano no site.");
  // Um aparelho por conta: ativar aqui desconecta o anterior.
  await db.from("licenses").update({ device_id: device, device_label: label, activated_at: new Date().toISOString() }).eq("id", lic.id);
  const { data: profile } = await db.from("profiles").select("name, email").eq("id", lic.user_id).maybeSingle();
  const name = profile?.name || profile?.email?.split("@")[0] || "Criador";
  return ok({ name, release: null });
}

type PlanRow = { id: string; title: string; product_id: number; comment_texts: string[] | null };

async function loadPlan(auth: Auth, id: string) {
  if (auth.demo) {
    const i = Number(id.replace("demo-", ""));
    const title = DEMO_PREPS[i];
    if (!title) return null;
    return { id, title, product_id: productOf(null, title)?.id ?? 0, comment_texts: null } as PlanRow;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await createAdminClient()
    .from("live_preps")
    .select("id, title, product_id, comment_texts")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  return (data as PlanRow | null) ?? null;
}

async function commentsFor(auth: Auth, row: PlanRow) {
  if (Array.isArray(row.comment_texts) && row.comment_texts.length >= 5) return row.comment_texts;
  const p = productOf(row.product_id, row.title);
  let comments = fallbackComments(row.title);
  try {
    const out = await generateObject(
      LoopComments,
      loopCommentsPrompt({
        product: { name: row.title, price: p ? brl(p.priceCents) : undefined, details: p?.facts.join("; ") },
        count: 20,
      }),
    );
    const clean = out.comments.map((c) => c.trim()).filter((c) => c.length > 3 && c.length <= 150);
    if (clean.length >= 5) comments = clean;
  } catch (e) {
    console.warn("[live-ext] comentários pela IA indisponíveis:", (e as Error).message);
  }
  if (!auth.demo) await createAdminClient().from("live_preps").update({ comment_texts: comments }).eq("id", row.id);
  return comments;
}

async function handle(path: string, req: Request, input: unknown) {
  if (path === "activate") return activate(req, input);
  if (path === "latest") {
    return ok({ version: EXT_VERSION, minVersion: "0.0.0", off: {}, violationPhrases: [], notice: null });
  }

  const auth = await authFrom(req);
  if (!auth) return err(401, "Este computador foi desconectado. Ative a extensão de novo com sua chave.");

  switch (path) {
    case "ping":
      return ok(null);

    case "plans": {
      if (auth.demo) return ok(DEMO_PREPS.map((title, i) => ({ id: `demo-${i}`, title })));
      const { data, error } = await createAdminClient()
        .from("live_preps")
        .select("id, title")
        .eq("user_id", auth.userId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) return err(500, "Não consegui carregar suas lives agora. Tente de novo.");
      return ok((data ?? []).map((r) => ({ id: r.id, title: r.title })));
    }

    case "plan": {
      const id = z.object({ id: z.string().min(1).max(64) }).safeParse(input).data?.id;
      const row = id ? await loadPlan(auth, id) : null;
      if (!row) return err(404, "Não encontrei essa live. Crie de novo em MediaFlowMZ → Assistente de Live.");
      const p = productOf(row.product_id, row.title);
      return ok({
        id: row.id,
        title: row.title,
        product: {
          id: p?.id ?? row.product_id ?? 0,
          title: p?.title ?? row.title,
          priceCents: p?.priceCents ?? null,
          url: p?.affiliateUrl ?? null,
        },
        comments: await commentsFor(auth, row),
        commentEvery: { min: 60, max: 120 },
      });
    }

    // Narração por produto e clipes gerados ficam no navegador: a extensão usa a voz e os clipes dela.
    case "voiceLines":
      return ok({ base: null, voiceBase: null, clipBase: null });

    case "liveBoard":
      return ok({ products: [] });

    case "chatToken":
      return err(503, "Leitura do chat pelo servidor indisponível; o painel lê o chat pela tela.");

    case "violationStatus":
      return ok({ lockedUntil: null, release: null });

    case "direct":
      return ok(null);

    case "answer": {
      const b = z
        .object({ planId: z.string(), question: z.string().min(1).max(500), productId: z.number().optional() })
        .safeParse(input);
      if (!b.success) return err(400, "Pergunta inválida.");
      const row = await loadPlan(auth, b.data.planId);
      const p = productOf(b.data.productId ?? row?.product_id, row?.title);
      const name = p?.title ?? row?.title ?? "produto da live";
      try {
        const r = await generateObject(
          ChatReply,
          chatReplyPrompt({ question: b.data.question, product: { name, price: p ? brl(p.priceCents) : undefined, details: p?.facts.join("; ") } }),
        );
        if (!r.isPurchaseQuestion || !r.reply.trim()) return ok({ skipped: true, answer: "", productId: p?.id });
        return ok({ skipped: false, answer: r.reply.trim().slice(0, 220), productId: p?.id });
      } catch {
        return err(503, "A IA não respondeu agora.");
      }
    }

    case "startSession": {
      const planId = z.object({ planId: z.string() }).safeParse(input).data?.planId;
      if (auth.demo) return ok({ sessionId: crypto.randomUUID() });
      const row = planId ? await loadPlan(auth, planId) : null;
      const { data, error } = await createAdminClient()
        .from("live_sessions")
        .insert({ user_id: auth.userId, mode: "infinite", products: row ? [{ name: row.title }] : [] })
        .select("id")
        .single();
      if (error || !data) return err(500, "Não consegui registrar a live. Tente de novo.");
      return ok({ sessionId: data.id });
    }

    case "event":
    case "endSession": {
      const b = z
        .object({ sessionId: z.string().uuid(), event: z.unknown().optional(), reason: z.string().max(40).optional(), stats: z.record(z.string(), z.unknown()).optional() })
        .safeParse(input);
      if (!b.success || auth.demo) return ok(null);
      const db = createAdminClient();
      const { data: s } = await db.from("live_sessions").select("id, user_id").eq("id", b.data.sessionId).maybeSingle();
      if (!s || s.user_id !== auth.userId) return err(404, "Sessão não encontrada.");

      if (path === "event") {
        const ev = (b.data.event ?? {}) as { kind?: string; text?: string };
        const kind = ev.kind === "violation" || ev.kind === "blocked" ? "warning" : String(ev.kind ?? "event").slice(0, 30);
        await db.from("live_events").insert({ session_id: s.id, kind, detail: b.data.event as object });
        if (kind === "warning") {
          await db.from("live_sessions").update({ status: "warning" }).eq("id", s.id);
          await notifyUser(auth.userId, { title: "Aviso na sua live", body: ev.text ? String(ev.text).slice(0, 120) : "O TikTok mostrou um aviso na live.", url: "/painel/live" });
        }
        return ok(null);
      }

      const reason = b.data.reason ?? "manual";
      const status = /drop|video|lost/.test(reason) ? "dropped" : "ended";
      await db.from("live_events").insert({ session_id: s.id, kind: "end", detail: { reason, ...(b.data.stats ?? {}) } });
      await db.from("live_sessions").update({ status, ended_at: new Date().toISOString() }).eq("id", s.id);
      await notifyUser(auth.userId, {
        title: status === "dropped" ? "Sua live caiu" : "Live encerrada",
        body: status === "dropped" ? "A live automática parou de transmitir. Confira o computador." : "Sua live automática terminou.",
        url: "/painel/live",
      });
      return ok(null);
    }
  }
  return err(404, "Função não encontrada. Atualize a extensão.");
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const body = (await req.json().catch(() => null)) as { json?: unknown } | null;
  try {
    return await handle(path, req, body?.json ?? null);
  } catch (e) {
    console.error(`[live-ext] ${path}:`, e);
    return err(500, "O MediaFlowMZ não respondeu agora. Tente de novo em instantes.");
  }
}

// Endereço aberto pelo Chrome quando a extensão é desinstalada.
export async function GET(req: Request, { params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  return NextResponse.redirect(new URL(path === "released" ? "/painel/live" : "/", req.url));
}
