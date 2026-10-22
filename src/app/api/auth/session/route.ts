import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "zaalys_session";

interface ZaalysSessionUser {
  userId: string;
  email: string;
  name: string;
  handle: string;
  active: boolean;
  plan: "monthly" | "lifetime";
  createdAt: string;
}

function buildHandle(email: string, name?: string): string {
  const base = (email.split("@")[0] || name || "criador")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");
  return base || "criador";
}

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = JSON.parse(decodeURIComponent(raw)) as ZaalysSessionUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = String(body.email ?? "").trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const emailPrefix = rawEmail.split("@")[0] || "Criador";
    const defaultName = emailPrefix
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const cleanName = String(body.name ?? "").trim() || defaultName || "Criador Zaalys";
    const cleanHandle = buildHandle(rawEmail, cleanName);
    const plan: "monthly" | "lifetime" = body.plan === "monthly" ? "monthly" : "lifetime";

    const sessionUser: ZaalysSessionUser = {
      userId: String(body.userId || crypto.randomUUID()),
      email: rawEmail,
      name: cleanName,
      handle: cleanHandle,
      active: true,
      plan,
      createdAt: new Date().toISOString(),
    };

    const encoded = encodeURIComponent(JSON.stringify(sessionUser));
    const res = NextResponse.json({ ok: true, user: sessionUser });
    res.cookies.set(SESSION_COOKIE, encoded, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível iniciar a sessão." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
}
