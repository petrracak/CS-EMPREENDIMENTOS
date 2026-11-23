import { CascaPainel } from "@/components/admin/navegacao";
import { exigirPerfil } from "@/lib/auth";
import { pode } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";

export default async function LayoutDoPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  // Os cadastros ainda não atendidos viram o selo do menu: quem abre o
  // painel já vê se tem alguém esperando resposta. Em paralelo com o
  // perfil, que não depende disto.
  const supabase = await createClient();
  const [perfil, { count }] = await Promise.all([
    exigirPerfil(),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("situacao", "novo"),
  ]);

  return (
    <CascaPainel
      nome={perfil.nome}
      // Quem entra por usuário tem um e-mail interno, que não diz nada.
      email={perfil.email ?? (perfil.usuario ? `@${perfil.usuario}` : null)}
      nivel={perfil.role}
      novos={pode(perfil.role, "cadastros") ? (count ?? 0) : 0}
    >
      {children}
    </CascaPainel>
  );
}
