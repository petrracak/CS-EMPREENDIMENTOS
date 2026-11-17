import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Home, Plus, Star } from "lucide-react";

import { Cartao, Etiqueta } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SITUACOES } from "@/lib/utils";

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

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">
            Empreendimentos
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
            Cada empreendimento tem a própria página no site, com as unidades
            dentro dele. Em rascunho, ele fica invisível para quem visita.
          </p>
        </div>
        <Link
          href="/admin/empreendimentos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--acento)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--acento-hover)]"
        >
          <Plus className="h-4 w-4" />
          Novo empreendimento
        </Link>
      </header>

      <div className="mt-8 space-y-3">
        {itens?.map((item) => {
          const situacao = SITUACOES[item.situacao as keyof typeof SITUACOES];
          const unidades = Array.isArray(item.unidades)
            ? item.unidades.length
            : 0;

          return (
            <Cartao key={item.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--color-verde-900)]">
                  {item.imagem_principal ? (
                    <Image
                      src={item.imagem_principal}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[0.625rem] text-white/40">
                      sem foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/empreendimentos/${item.id}`}
                      className="font-display truncate text-base font-medium hover:text-[var(--acento)]"
                    >
                      {item.nome}
                    </Link>
                    {item.destaque ? (
                      <Star className="h-3.5 w-3.5 fill-[var(--color-ouro-500)] text-[var(--color-ouro-500)]" />
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Etiqueta
                      tom={item.status === "publicado" ? "verde" : "neutro"}
                    >
                      {item.status === "publicado" ? "No site" : "Rascunho"}
                    </Etiqueta>
                    <span className="text-xs text-[var(--fg-tenue)]">
                      {situacao?.rotulo}
                      {item.bairro ? ` · ${item.bairro}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/empreendimentos/${item.id}/unidades`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--borda)] px-3 py-2 text-xs font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
                  >
                    <Home className="h-3.5 w-3.5" />
                    {unidades} unidade{unidades === 1 ? "" : "s"}
                  </Link>

                  {item.status === "publicado" ? (
                    <Link
                      href={`/empreendimentos/${item.slug}`}
                      target="_blank"
                      aria-label="Ver no site"
                      className="rounded-lg border border-[var(--borda)] p-2 text-[var(--fg-tenue)] transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </Cartao>
          );
        })}
      </div>
    </>
  );
}
