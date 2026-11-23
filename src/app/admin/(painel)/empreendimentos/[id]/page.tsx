import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, DoorOpen } from "lucide-react";

import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { GerenciadorImagens } from "@/components/admin/gerenciador-imagens";
import { classeBotao } from "@/components/admin/estilos";
import { Cabecalho, Etiqueta } from "@/components/admin/ui";
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

  const noAr = item.status === "publicado";

  return (
    <div className="space-y-8">
      <Cabecalho
        voltar={{ href: "/admin/empreendimentos", rotulo: "Empreendimentos" }}
        titulo={item.nome}
        selo={<Etiqueta tom={noAr ? "verde" : "neutro"}>{noAr ? "No site" : "Rascunho"}</Etiqueta>}
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

      <FormEmpreendimento dados={dados} tipos={tipos ?? []} />

      <div className="space-y-5">
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
    </div>
  );
}
