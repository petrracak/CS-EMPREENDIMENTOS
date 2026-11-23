import { Cabecalho } from "@/components/admin/ui";
import { LinhaUsuario, NovoUsuario, type Usuario } from "@/components/admin/usuarios";
import { exigirArea } from "@/lib/auth";
import { ehEmailInterno } from "@/lib/equipe";
import { ehNivel, NIVEIS, ORDEM_NIVEIS } from "@/lib/permissoes";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Usuários" };

export default async function PaginaUsuarios() {
  const eu = await exigirArea("usuarios");
  const admin = createAdminClient();

  // O último acesso mora no Auth, não no perfil.
  const [{ data: perfis }, { data: contas }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, nome, email, usuario, role, ativo, principal, created_at")
      .order("principal", { ascending: false })
      .order("created_at"),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const acessos = new Map(
    (contas?.users ?? []).map((c) => [c.id, c.last_sign_in_at ?? null]),
  );

  const usuarios: Usuario[] = (perfis ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    usuario: p.usuario,
    email: ehEmailInterno(p.email) ? null : p.email,
    role: ehNivel(p.role) ? p.role : "editor",
    ativo: p.ativo,
    principal: p.principal,
    ultimoAcesso: acessos.get(p.id) ?? null,
  }));

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Usuários"
        descricao="Quem entra no painel e o que cada pessoa pode fazer. Cada uma entra com o próprio usuário ou e-mail."
      />

      <NovoUsuario />

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <LinhaUsuario key={u.id} u={u} eu={u.id === eu.id} />
        ))}
      </ul>

      {/* O que cada nível faz, para consulta. */}
      <section aria-labelledby="niveis" className="rounded-[1.25rem] border border-dashed border-[var(--borda-forte)] p-5 sm:p-6">
        <h2 id="niveis" className="text-[0.6875rem] font-semibold tracking-[0.12em] text-[var(--fg-tenue)] uppercase">
          Os níveis de acesso
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {ORDEM_NIVEIS.map((n) => (
            <div key={n}>
              <dt className="text-sm font-medium">{NIVEIS[n].rotulo}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--fg-tenue)]">
                {NIVEIS[n].resumo}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
