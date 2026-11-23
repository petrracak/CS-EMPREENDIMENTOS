import { notFound } from "next/navigation";

import { GerenciadorUnidades } from "@/components/admin/gerenciador-unidades";
import { Cabecalho } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PaginaUnidades({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPerfil();
  const supabase = await createClient();

  const [{ data: item }, { data: unidades }, { data: tipos }] =
    await Promise.all([
      supabase
        .from("empreendimentos")
        .select("id, nome, slug")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("unidades")
        .select("*")
        .eq("empreendimento_id", id)
        .order("ordem"),
      supabase.from("tipos_unidade").select("id, nome").order("ordem"),
    ]);

  if (!item) notFound();

  return (
    <div className="space-y-8">
      <Cabecalho
        voltar={{ href: `/admin/empreendimentos/${item.id}`, rotulo: item.nome }}
        titulo="Unidades"
        descricao="As casas, apartamentos ou lotes deste empreendimento. No site, cada unidade disponível leva o interessado ao cadastro já preenchido."
      />
      <GerenciadorUnidades
        empreendimentoId={item.id}
        unidades={unidades ?? []}
        tipos={tipos ?? []}
      />
    </div>
  );
}
