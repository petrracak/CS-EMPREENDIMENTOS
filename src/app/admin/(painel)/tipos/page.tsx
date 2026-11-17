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
    <>
      <header>
        <h1 className="font-display text-2xl font-medium">Tipos</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
          Os tipos de empreendimento viram os filtros da página de
          listagem. Os de unidade aparecem no catálogo de cada projeto.
          Você pode criar novos quando precisar.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
    </>
  );
}
