// E-mails que nunca são de gente de verdade (domínios reservados para testes, RFC 2606/6761).
// Postbacks e inscrições com eles são descartados antes de tocar no banco ou mandar e-mail.
const RESERVED_TLD = /\.(invalid|test|example|localhost|local)$/i;
const RESERVED_DOMAIN = /@(example\.(com|net|org)|mailinator\.com)$/i;

export function isJunkEmail(email: string | null | undefined) {
  const e = (email ?? "").trim().toLowerCase();
  return !e || RESERVED_TLD.test(e) || RESERVED_DOMAIN.test(e);
}
