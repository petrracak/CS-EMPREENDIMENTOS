import { Cabecalho } from "@/components/admin/ui";
import { FormConta } from "@/components/admin/form-conta";
import { exigirPerfil } from "@/lib/auth";

export default async function PaginaConta() {
  const perfil = await exigirPerfil();

  return (
    <div className="space-y-8">
      <Cabecalho titulo="Minha conta" descricao={perfil.email ?? undefined} />

      <div>
        <FormConta nome={perfil.nome} />
      </div>
    </div>
  );
}
