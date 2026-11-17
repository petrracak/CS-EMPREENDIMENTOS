import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { GerenciadorUnidades } from "@/components/admin/gerenciador-unidades";
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
    <>
      <Link
        href={`/admin/empreendimentos/${item.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--acento)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {item.nome}
      </Link>

      <h1 className="font-display mt-4 text-2xl font-medium">Unidades</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
        As casas, apartamentos ou lotes deste empreendimento. No site, cada
        unidade disponível leva o interessado ao cadastro já preenchido.
      </p>

      <div className="mt-8">
        <GerenciadorUnidades
          empreendimentoId={item.id}
          unidades={unidades ?? []}
          tipos={tipos ?? []}
        />
      </div>
    </>
  );
}
