import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, DoorOpen } from "lucide-react";

import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { GerenciadorImagens } from "@/components/admin/gerenciador-imagens";
import { GerenciadorVideos } from "@/components/admin/gerenciador-videos";
import type { TipoVideo } from "@/lib/videos";
import { classeBotao } from "@/components/admin/estilos";
import { Cabecalho, Etiqueta } from "@/components/admin/ui";
import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditarEmpreendimento({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba } = await searchParams;
  await exigirArea("obras");
  const supabase = await createClient();

  const [{ data: item }, { data: tipos }] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select(
        `*,
         caracteristicas:empreendimento_caracteristicas (texto, ordem),
         diferenciais:empreendimento_diferenciais (texto, ordem),
         referencias:empreendimento_referencias (texto, ordem),
         imagens:empreendimento_imagens (id, url, legenda, categoria, ordem),
         videos:empreendimento_videos (id, tipo, url, capa, titulo, ordem)`,
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

  const noAr = item.status === "publicado";

  return (
    <div className="space-y-8">
      <Cabecalho
        voltar={{ href: "/admin/empreendimentos", rotulo: "Empreendimentos" }}
        titulo={item.nome}
        selo={
          <Etiqueta tom={noAr ? "verde" : "neutro"}>
            {noAr ? "No site" : "Rascunho"}
          </Etiqueta>
        }
        descricao={`/empreendimentos/${item.slug}`}
        acoes={
          <>
            <Link
              href={`/admin/empreendimentos/${item.id}/unidades`}
              className={classeBotao("neutro")}
            >
              <DoorOpen className="h-4 w-4" strokeWidth={1.8} />
              Unidades
            </Link>
            {noAr ? (
              <Link
                href={`/empreendimentos/${item.slug}`}
                target="_blank"
                className={classeBotao("neutro")}
              >
                Ver no site
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            ) : null}
          </>
        }
      />

      <FormEmpreendimento
        dados={dados}
        tipos={tipos ?? []}
        abaInicial={aba}
        midia={
          <>
            <GerenciadorImagens
              empreendimentoId={item.id}
              slug={item.slug}
              imagens={item.imagens ?? []}
              categoria="galeria"
              titulo="Galeria de fotos"
              apoio="As fotos do projeto, num carrossel na página. A legenda aparece embaixo de cada uma; as setas mudam a ordem."
            />
            <GerenciadorImagens
              empreendimentoId={item.id}
              slug={item.slug}
              imagens={item.imagens ?? []}
              categoria="planta"
              titulo="Plantas"
              apoio="As plantas baixas do projeto, mostradas inteiras e sem corte, num carrossel no fundo verde. Use a legenda para dizer qual é (ex.: Planta da casa de 56 m²)."
            />
            <GerenciadorVideos
              empreendimentoId={item.id}
              slug={item.slug}
              videos={[...(item.videos ?? [])]
                .sort((a, b) => a.ordem - b.ordem)
                .map((v) => ({ ...v, tipo: v.tipo as TipoVideo }))}
            />
          </>
        }
      />
    </div>
  );
}
