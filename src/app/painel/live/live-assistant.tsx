"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LiveScript } from "@/lib/ai/prompts";
import { postJSON } from "@/lib/fetch-json";

type Saved = { id: string; title: string; script: LiveScript };
type ProductRow = { name: string; price: string; details: string };

const emptyProduct = (): ProductRow => ({ name: "", price: "", details: "" });

export function LiveAssistant({ saved }: { saved: Saved[] }) {
  const [tab, setTab] = useState<"preparar" | "chat">("preparar");
  const [script, setScript] = useState<LiveScript | null>(saved[0]?.script ?? null);
  const [presenting, setPresenting] = useState(false);

  return (
    <>
      <div role="tablist" className="mb-6 flex gap-2">
        {(
          [
            ["preparar", "Roteiro da live"],
            ["chat", "Responder o chat"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={tab === id ? "btn-primary" : "btn-ghost"}>
            {label}
          </button>
        ))}
      </div>

      {tab === "preparar" ? (
        <Prepare saved={saved} script={script} onScript={setScript} onPresent={() => setPresenting(true)} />
      ) : (
        <ChatHelper products={script?.products.map((p) => p.name) ?? []} />
      )}

      {presenting && script && <Presenter script={script} onClose={() => setPresenting(false)} />}
    </>
  );
}

// ---------- Preparar o roteiro ----------

function Prepare({
  saved,
  script,
  onScript,
  onPresent,
}: {
  saved: Saved[];
  script: LiveScript | null;
  onScript: (s: LiveScript) => void;
  onPresent: () => void;
}) {
  const [products, setProducts] = useState<ProductRow[]>([emptyProduct()]);
  const [minutes, setMinutes] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (i: number, field: keyof ProductRow, value: string) =>
    setProducts((list) => list.map((p, j) => (j === i ? { ...p, [field]: value } : p)));

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { script } = await postJSON<{ script: LiveScript }>("/api/ai/live-script", {
        products: products
          .filter((p) => p.name.trim())
          .map((p) => ({ name: p.name, price: p.price || undefined, details: p.details || undefined })),
        minutesPerProduct: minutes,
      });
      onScript(script);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <form onSubmit={generate} className="panel h-fit space-y-5 p-5">
        <h2 className="text-lg font-bold">Produtos da live (até 5)</h2>
        {products.map((p, i) => (
          <fieldset key={i} className="space-y-2 rounded-xl border border-line p-3">
            <legend className="px-1 text-sm font-semibold">Produto {i + 1}</legend>
            <input aria-label="Nome do produto" required={i === 0} value={p.name} onChange={(e) => update(i, "name", e.target.value)} className="field" placeholder="Nome" />
            <input aria-label="Preço" value={p.price} onChange={(e) => update(i, "price", e.target.value)} className="field" placeholder="Preço" />
            <textarea aria-label="Detalhes" value={p.details} onChange={(e) => update(i, "details", e.target.value)} rows={2} className="field" placeholder="Detalhes e diferenciais" />
            {products.length > 1 && (
              <button type="button" className="text-sm text-muted hover:text-onair" onClick={() => setProducts((l) => l.filter((_, j) => j !== i))}>
                Remover
              </button>
            )}
          </fieldset>
        ))}
        {products.length < 5 && (
          <button type="button" className="btn-ghost w-full" onClick={() => setProducts((l) => [...l, emptyProduct()])}>
            Adicionar produto
          </button>
        )}
        <div>
          <label className="label" htmlFor="minutes">Minutos por produto</label>
          <input id="minutes" type="number" min={2} max={30} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="field" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Montando roteiro..." : "Gerar roteiro da live"}
        </button>
        {error && <p className="text-sm text-onair">{error}</p>}

        {saved.length > 0 && (
          <div>
            <label className="label" htmlFor="saved">Ou abra um roteiro salvo</label>
            <select id="saved" className="field" onChange={(e) => { const s = saved.find((x) => x.id === e.target.value); if (s) onScript(s.script); }}>
              {saved.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        )}
      </form>

      <section aria-live="polite">
        {!script ? (
          <div className="panel flex h-full min-h-64 items-center justify-center p-8 text-center text-muted">
            Gere o roteiro para ver as etapas e abrir o modo live.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">Roteiro pronto</h2>
              <button onClick={onPresent} className="btn-primary">Abrir modo live</button>
            </div>
            <p><span className="font-semibold text-violet">Abertura:</span> {script.opening}</p>
            {script.products.map((p) => (
              <div key={p.name} className="panel p-5">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <ol className="mt-3 space-y-3">
                  {p.steps.map((s, i) => (
                    <li key={i}>
                      <p className="font-semibold">{s.title} <span className="text-sm font-normal text-muted">· {Math.round(s.seconds / 60 * 10) / 10} min</span></p>
                      <p className="text-sm text-muted">Mostrar: {s.showOnCamera}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            <p><span className="font-semibold text-violet">Encerramento:</span> {script.closing}</p>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Modo live em tela cheia ----------

type Stage = { product: string | null; title: string; seconds: number; show?: string; points: string[] };

function flatten(script: LiveScript): Stage[] {
  return [
    { product: null, title: "Abertura", seconds: 40, points: [script.opening] },
    ...script.products.flatMap((p) =>
      p.steps.map((s) => ({ product: p.name, title: s.title, seconds: s.seconds, show: s.showOnCamera, points: s.talkingPoints })),
    ),
    { product: null, title: "Encerramento", seconds: 60, points: [script.closing] },
  ];
}

const mmss = (s: number) => `${s < 0 ? "-" : ""}${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

function Presenter({ script, onClose }: { script: LiveScript; onClose: () => void }) {
  const stages = useMemo(() => flatten(script), [script]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(stages[0].seconds);
  const stage = stages[index];
  const faq = script.products.find((p) => p.name === stage.product)?.faq ?? [];

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(stages.length - 1, to));
      setIndex(next);
      setLeft(stages[next].seconds);
    },
    [stages],
  );

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(index - 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, onClose]);

  useEffect(() => () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }, []);

  const next = stages[index + 1];

  return (
    <div role="dialog" aria-modal="true" aria-label="Modo live" className="fixed inset-0 z-50 flex flex-col bg-night text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="onair-dot inline-block size-3 rounded-full bg-onair" />
          <span className="font-semibold">{stage.product ?? "Live"}</span>
          <span className="text-white/50">Etapa {index + 1} de {stages.length}</span>
        </div>
        <button onClick={onClose} className="rounded-full border border-white/30 px-4 py-1.5 text-sm">Sair (Esc)</button>
      </div>

      <div className="grid flex-1 gap-8 overflow-auto p-6 lg:grid-cols-[1fr_340px] lg:p-10">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-4xl font-extrabold lg:text-6xl">{stage.title}</h2>
            <span className={`font-display text-5xl font-bold tabular-nums lg:text-7xl ${left < 0 ? "text-onair" : left <= 15 ? "text-warn" : ""}`}>
              {mmss(left)}
            </span>
          </div>
          {stage.show && <p className="mt-4 text-xl text-white/70">Mostrar na câmera: {stage.show}</p>}
          <ul className="mt-8 space-y-5">
            {stage.points.map((p, i) => (
              <li key={i} className="text-2xl leading-snug lg:text-3xl">{p}</li>
            ))}
          </ul>
        </div>
        <aside className="space-y-6">
          {next && (
            <div className="rounded-2xl border border-white/15 p-5">
              <p className="text-sm text-white/50">A seguir</p>
              <p className="mt-1 text-lg font-semibold">{next.title}</p>
              {next.product && next.product !== stage.product && <p className="text-sm text-white/60">{next.product}</p>}
            </div>
          )}
          {faq.length > 0 && (
            <div className="rounded-2xl border border-white/15 p-5">
              <p className="mb-3 text-sm text-white/50">Perguntas prováveis</p>
              <ul className="space-y-3">
                {faq.map((f, i) => (
                  <li key={i}>
                    <p className="font-semibold">{f.question}</p>
                    <p className="text-sm text-white/70">{f.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <button onClick={() => go(index - 1)} disabled={index === 0} className="rounded-full border border-white/30 px-5 py-2 disabled:opacity-30">Anterior (←)</button>
        <div className="mx-4 h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-violet" style={{ width: `${((index + 1) / stages.length) * 100}%` }} />
        </div>
        <button onClick={() => go(index + 1)} disabled={index === stages.length - 1} className="rounded-full bg-violet px-5 py-2 font-semibold disabled:opacity-30">Próxima (→)</button>
      </div>
    </div>
  );
}

// ---------- Ajuda com o chat ----------

function ChatHelper({ products }: { products: string[] }) {
  const [product, setProduct] = useState(products[0] ?? "");
  const [details, setDetails] = useState("");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ question: string; reply: string; buyer: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !product.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await postJSON<{ isPurchaseQuestion: boolean; reply: string }>("/api/ai/chat-reply", {
        question,
        product: { name: product, details: details || undefined },
      });
      setHistory((h) => [{ question, reply: r.reply, buyer: r.isPurchaseQuestion }, ...h]);
      setQuestion("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={ask} className="panel h-fit space-y-4 p-5">
        <div>
          <label className="label" htmlFor="product">Produto em destaque</label>
          <input id="product" list="live-products" value={product} onChange={(e) => setProduct(e.target.value)} className="field" required />
          <datalist id="live-products">
            {products.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="pdetails">Detalhes (opcional)</label>
          <input id="pdetails" value={details} onChange={(e) => setDetails(e.target.value)} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="question">Mensagem do chat</label>
          <textarea id="question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} className="field" placeholder="Cole a pergunta de quem está na live" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Pensando..." : "Sugerir resposta"}</button>
        {error && <p className="text-sm text-onair">{error}</p>}
      </form>

      <ul className="space-y-3" aria-live="polite">
        {history.length === 0 && <li className="panel p-8 text-center text-muted">As respostas sugeridas aparecem aqui, das mais novas para as mais antigas.</li>}
        {history.map((h, i) => (
          <li key={i} className={`panel p-5 ${h.buyer ? "border-violet" : ""}`}>
            <p className="text-sm text-muted">
              {h.buyer && <span className="mr-2 rounded-full bg-violet-soft px-2 py-0.5 font-semibold text-violet">Quer comprar</span>}
              {h.question}
            </p>
            <p className="mt-2 text-lg">{h.reply}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
