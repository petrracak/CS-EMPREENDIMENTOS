import { Cabecalho } from "@/components/admin/ui";
import { FormConta } from "@/components/admin/form-conta";
import { exigirPerfil } from "@/lib/auth";
import { ehEmailInterno } from "@/lib/equipe";
import { NIVEIS } from "@/lib/permissoes";

export default async function PaginaConta() {
  const perfil = await exigirPerfil();

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Minha conta"
        descricao={[
          perfil.usuario ? `Usuário: ${perfil.usuario}` : null,
          perfil.email && !ehEmailInterno(perfil.email) ? perfil.email : null,
          `${NIVEIS[perfil.role]?.rotulo ?? perfil.role}${perfil.principal ? " · conta principal" : ""}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      />

      <div>
        <FormConta nome={perfil.nome} />
      </div>
    </div>
  );
}
