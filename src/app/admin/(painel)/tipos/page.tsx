import { Cabecalho } from "@/components/admin/ui";
import { GerenciadorTipos } from "@/components/admin/gerenciador-tipos";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PaginaTipos() {
  await exigirPerfil();
  const supabase = await createClient();

  const [{ data: deEmpreendimento }, { data: deUnidade }] = await Promise.all([
    supabase.from("tipos_empreendimento").select("id, nome").order("ordem"),
    supabase.from("tipos_unidade").select("id, nome").order("ordem"),
  ]);

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Tipos"
        descricao="Os tipos de empreendimento viram os filtros da página de listagem; os de unidade aparecem no catálogo de cada projeto."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GerenciadorTipos
          grupo="empreendimento"
          titulo="Tipos de empreendimento"
          apoio="Ex.: Condomínio, Prédio, Casas, Loteamento."
          tipos={deEmpreendimento ?? []}
        />
        <GerenciadorTipos
          grupo="unidade"
          titulo="Tipos de unidade"
          apoio="Ex.: Casa, Apartamento, Terreno."
          tipos={deUnidade ?? []}
        />
      </div>
    </div>
  );
}
