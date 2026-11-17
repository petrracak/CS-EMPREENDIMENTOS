import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Home } from "lucide-react";

import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { GerenciadorImagens } from "@/components/admin/gerenciador-imagens";
import { Etiqueta } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditarEmpreendimento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPerfil();
  const supabase = await createClient();

  const [{ data: item }, { data: tipos }] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select(
        `*,
         caracteristicas:empreendimento_caracteristicas (texto, ordem),
         diferenciais:empreendimento_diferenciais (texto, ordem),
         referencias:empreendimento_referencias (texto, ordem),
         imagens:empreendimento_imagens (id, url, legenda, categoria, ordem)`,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("tipos_empreendimento").select("id, nome").order("ordem"),
  ]);

  if (!item) notFound();

  const ordenar = <T extends { ordem: number }>(l: T[] | null) =>
    [...(l ?? [])].sort((a, b) => a.ordem - b.ordem);

  const dados = {
    ...item,
    caracteristicas: ordenar(item.caracteristicas),
    diferenciais: ordenar(item.diferenciais),
    referencias: ordenar(item.referencias),
  };

  return (
    <>
      <Link
        href="/admin/empreendimentos"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--acento)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Empreendimentos
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-medium">{item.nome}</h1>
            <Etiqueta tom={item.status === "publicado" ? "verde" : "neutro"}>
              {item.status === "publicado" ? "No site" : "Rascunho"}
            </Etiqueta>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-tenue)]">
            /empreendimentos/{item.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/empreendimentos/${item.id}/unidades`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--borda-forte)] px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
          >
            <Home className="h-4 w-4" />
            Unidades
          </Link>
          {item.status === "publicado" ? (
            <Link
              href={`/empreendimentos/${item.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--borda-forte)] px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
            >
              Ver no site
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mt-8">
        <FormEmpreendimento dados={dados} tipos={tipos ?? []} />
      </div>

      <div className="mt-6 space-y-6">
        <GerenciadorImagens
          empreendimentoId={item.id}
          slug={item.slug}
          imagens={item.imagens ?? []}
          categoria="galeria"
          titulo="Galeria"
          apoio="As fotos do projeto. A primeira aparece maior na página."
        />
        <GerenciadorImagens
          empreendimentoId={item.id}
          slug={item.slug}
          imagens={item.imagens ?? []}
          categoria="planta"
          titulo="Plantas"
          apoio="As plantas baixas, mostradas inteiras e sem corte."
        />
      </div>
    </>
  );
}
