import { redirect } from "next/navigation";

// A aprovação de afiliados fica no Painel do Afiliado, aba Afiliados.
export default function AprovarAfiliadosPage() {
  redirect("/painel/afiliado?aba=afiliados");
}
