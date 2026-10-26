import { z } from "zod";
import { fail, json } from "@/lib/http";
import { getAccess } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { isSupabaseServerConfigured } from "@/lib/radar";

const Body = z.object({
  topic: z.enum(["Dúvida sobre ferramenta", "Extensão / Live", "Pagamento ou plano", "Sugestão ou bug"]),
  message: z.string().trim().min(5).max(4000),
  page: z.string().max(200).optional(),
});

// Chamado de suporte aberto pelo painel. Grava no banco e avisa a caixa do suporte.
export async function POST(req: Request) {
  try {
    const access = await getAccess();
    if (!access) return json({ error: "Faça login para abrir um chamado" }, 401);
    const { topic, message, page } = Body.parse(await req.json());

    let ticketId: string | null = null;
    if (isSupabaseServerConfigured() && !access.demo) {
      const { data, error } = await createAdminClient()
        .from("support_tickets")
        .insert({ user_id: access.userId, email: access.email, topic, message, page })
        .select("id")
        .single();
      if (error) throw error;
      ticketId = data.id;
    }

    const inbox = process.env.SUPPORT_INBOX ?? "suporte@mediaflowmz.com";
    const ref = ticketId ? ` #${ticketId.slice(0, 8)}` : "";
    await sendEmail({
      to: inbox,
      replyTo: access.email,
      subject: `[Suporte${ref}] ${topic} — ${access.email}`,
      text: `De: ${access.email} (${access.plan ?? "sem plano"})\nPágina: ${page ?? "-"}\nAssunto: ${topic}\n\n${message}`,
      html: emailLayout(
        `Novo chamado${ref}`,
        `<p><strong>De:</strong> ${escapeHtml(access.email)} (${escapeHtml(access.plan ?? "sem plano")})<br>
<strong>Página:</strong> ${escapeHtml(page ?? "-")}<br><strong>Assunto:</strong> ${escapeHtml(topic)}</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      ),
    });

    return json({ ok: true, ticketId });
  } catch (err) {
    return fail(err);
  }
}
