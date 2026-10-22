"use client";
import { useState } from "react";

// Pede o e-mail (o acesso é liberado para ele) e manda para o checkout do gateway.
export function CheckoutForm({ plan, label, primary }: { plan: "monthly" | "lifetime"; label: string; primary?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Não foi possível abrir o pagamento. Tente de novo.");
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <label className="sr-only" htmlFor={`email-${plan}`}>
        E-mail para receber o acesso
      </label>
      <input
        id={`email-${plan}`}
        type="email"
        required
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field"
      />
      <button className={`${primary ? "btn-primary" : "btn-ghost"} w-full`} disabled={loading}>
        {loading ? "Abrindo pagamento..." : label}
      </button>
      {error && <p className="text-sm text-onair">{error}</p>}
    </form>
  );
}
