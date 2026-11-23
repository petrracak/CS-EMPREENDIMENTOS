import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  DoorOpen,
  MapPin,
  PencilLine,
  Plus,
  Star,
} from "lucide-react";

import { classeBotao } from "@/components/admin/estilos";
import { Cabecalho, Etiqueta, Vazio } from "@/components/admin/ui";
import { Simbolo } from "@/components/site/logo";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SITUACOES } from "@/lib/utils";

/**
 * Os empreendimentos em quadros, no mesmo desenho dos cards do site: a
 * foto manda, e quem procura um projeto reconhece pela imagem antes de
 * ler o nome. O cartão inteiro abre a edição; unidades e "ver no site"
 * ficam numa faixa à parte, para não disputarem o clique.
 */
export default async function ListaEmpreendimentos() {
  await exigirPerfil();
  const supabase = await createClient();

  const { data: itens } = await supabase
    .from("empreendimentos")
    .select(
      `id, slug, nome, status, situacao, destaque, ordem, imagem_principal,
       bairro, unidades (id)`,
    )
    .order("ordem");

  const total = itens?.length ?? 0;
  const noSite = itens?.filter((i) => i.status === "publicado").length ?? 0;

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Empreendimentos"
        descricao={
          total
            ? `${total} ${total === 1 ? "projeto" : "projetos"}, ${noSite} no site. Em rascunho, o projeto fica invisível para quem visita.`
            : "Cada empreendimento ganha a própria página no site, com as unidades dentro dele."
        }
        acoes={
          <Link
            href="/admin/empreendimentos/novo"
            className={classeBotao("principal", "hidden sm:inline-flex")}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Novo empreendimento
          </Link>
        }
      />

      {itens?.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {itens.map((item) => {
            const situacao = SITUACOES[item.situacao as keyof typeof SITUACOES];
            const unidades = Array.isArray(item.unidades) ? item.unidades.length : 0;
            const noAr = item.status === "publicado";

            return (
              <li
                key={item.id}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[var(--borda)] bg-[var(--bg-elevado)] shadow-[var(--sombra-painel)] transition-[box-shadow,transform,border-color] duration-500 [transition-timing-function:var(--ease-lento)] hover:-translate-y-1 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-card)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-verde-900)]">
                  {item.imagem_principal ? (
                    <Image
                      src={item.imagem_principal}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
                      className="object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--color-verde-800)] to-[var(--color-verde-950)]">
                      <Simbolo className="h-14 w-auto text-white/10" />
                    </div>
                  )}

                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent"
                  />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Etiqueta tom="vidro">{noAr ? "No site" : "Rascunho"}</Etiqueta>
                  </div>

                  {item.destaque ? (
                    <span
                      title="Em destaque na página inicial"
                      className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-verde-950)]/80 px-2.5 py-1 text-xs font-medium text-[var(--color-ouro-300)] backdrop-blur-md"
                    >
                      <Star className="h-3 w-3 fill-current" />
                      Destaque
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4 pb-3">
                  <h2 className="font-display text-lg leading-snug font-medium tracking-[-0.01em]">
                    {/* O link cobre o cartão inteiro, menos a faixa de baixo. */}
                    <Link
                      href={`/admin/empreendimentos/${item.id}`}
                      className="after:absolute after:inset-x-0 after:top-0 after:bottom-[3.75rem] focus-visible:outline-none"
                    >
                      {item.nome}
                    </Link>
                  </h2>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[var(--fg-tenue)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {[situacao?.rotulo, item.bairro].filter(Boolean).join(" · ")}
                    </span>
                  </p>
                </div>

                <div className="relative flex items-center gap-1 border-t border-[var(--borda)] px-2 py-2">
                  <Link
                    href={`/admin/empreendimentos/${item.id}/unidades`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-[var(--fg-suave)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
                  >
                    <DoorOpen className="h-4 w-4" strokeWidth={1.7} />
                    <span className="tabular">
                      {unidades} {unidades === 1 ? "unidade" : "unidades"}
                    </span>
                  </Link>

                  <span className="ml-auto flex items-center gap-1">
                    {noAr ? (
                      <Link
                        href={`/empreendimentos/${item.slug}`}
                        target="_blank"
                        aria-label={`Ver ${item.nome} no site`}
                        title="Ver no site"
                        className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
                      >
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/empreendimentos/${item.id}`}
                      aria-label={`Editar ${item.nome}`}
                      title="Editar"
                      className="grid h-10 w-10 place-items-center rounded-full bg-[var(--bg-fundo)] text-[var(--color-verde-900)] transition-colors hover:bg-[var(--color-verde-900)] hover:text-[var(--color-ouro-300)]"
                    >
                      <PencilLine className="h-4 w-4" strokeWidth={1.8} />
                    </Link>
                  </span>
                </div>
              </li>
            );
          })}

          {/* O último quadro é o convite para o próximo. */}
          <li className="min-w-0">
            <Link
              href="/admin/empreendimentos/novo"
              className="group flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-[var(--borda-forte)] p-6 text-center transition-colors duration-300 hover:border-[var(--color-verde-700)] hover:bg-[var(--bg-elevado)]/60"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-verde-900)] text-[var(--color-ouro-300)] transition-transform duration-500 group-hover:rotate-90">
                <Plus className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="font-display text-base font-medium">Novo empreendimento</span>
              <span className="max-w-[26ch] text-sm text-[var(--fg-tenue)]">
                Comece pelo nome. Fotos e unidades entram depois.
              </span>
            </Link>
          </li>
        </ul>
      ) : (
        <Vazio
          icone={<Building2 className="h-6 w-6" strokeWidth={1.5} />}
          titulo="Nenhum empreendimento ainda"
          texto="Cadastre o primeiro projeto para ele ganhar uma página no site."
          acao={
            <Link href="/admin/empreendimentos/novo" className={classeBotao()}>
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Novo empreendimento
            </Link>
          }
        />
      )}
    </div>
  );
}
