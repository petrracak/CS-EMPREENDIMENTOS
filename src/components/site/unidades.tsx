"use client";

import Link from "next/link";
import { ArrowRight, Ruler, LandPlot, Layers } from "lucide-react";
import { useMemo, useState } from "react";

import { Selo } from "@/components/site/ui";
import { SITUACOES_UNIDADE, cn, formatarValor, textoUtil } from "@/lib/utils";

export type Unidade = {
  id: string;
  identificacao: string;
  andar: string | null;
  area_construida: string | null;
  terreno_dimensoes: string | null;
  terreno_area: string | null;
  valor: number | null;
  situacao: "disponivel" | "reservada" | "vendida";
  observacao: string | null;
  tipo: { nome: string } | null;
};

/**
 * Catálogo de unidades do empreendimento.
 *
 * O valor só aparece quando existe de verdade: enquanto a CS não
 * confirmar o preço, o campo inteiro some, em vez de virar "R$ 0,00".
 * Unidade disponível leva ao cadastro já com empreendimento e unidade
 * preenchidos, que é o que a ata pede para o atendimento.
 */
export function Unidades({
  unidades,
  slugEmpreendimento,
  observacao,
}: {
  unidades: Unidade[];
  slugEmpreendimento: string;
  observacao?: string | null;
}) {
  const [filtro, setFiltro] = useState<string>("todas");

  const contagem = useMemo(
    () => ({
      todas: unidades.length,
      disponivel: unidades.filter((u) => u.situacao === "disponivel").length,
      reservada: unidades.filter((u) => u.situacao === "reservada").length,
      vendida: unidades.filter((u) => u.situacao === "vendida").length,
    }),
    [unidades],
  );

  const visiveis = useMemo(
    () =>
      filtro === "todas"
        ? unidades
        : unidades.filter((u) => u.situacao === filtro),
    [unidades, filtro],
  );

  if (!unidades.length) return null;

  const nenhumaDisponivel = contagem.disponivel === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[
          { valor: "todas", rotulo: "Todas" },
          { valor: "disponivel", rotulo: "Disponíveis" },
          { valor: "reservada", rotulo: "Reservadas" },
          { valor: "vendida", rotulo: "Vendidas" },
        ]
          // Um filtro que não tem nenhuma unidade atrás dele não aparece.
          .filter((o) => contagem[o.valor as keyof typeof contagem] > 0)
          .map((opcao) => {
            const ativo = filtro === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setFiltro(opcao.valor)}
                aria-pressed={ativo}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-all duration-500",
                  ativo
                    ? "bg-[var(--color-verde-800)] text-white"
                    : "border border-[var(--borda)] text-[var(--fg-suave)] hover:border-[var(--borda-forte)] hover:text-[var(--fg)]",
                )}
              >
                {opcao.rotulo}
                <span className="tabular ml-1.5 opacity-60">
                  {contagem[opcao.valor as keyof typeof contagem]}
                </span>
              </button>
            );
          })}
      </div>

      {nenhumaDisponivel ? (
        <p className="mt-6 rounded-xl border border-[var(--borda)] bg-[var(--bg-fundo)] px-5 py-4 text-sm text-[var(--fg-suave)]">
          Todas as unidades deste empreendimento foram vendidas. Deixe seus
          dados para saber dos próximos lançamentos.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((unidade, i) => {
          const valor = formatarValor(unidade.valor);
          const terreno =
            textoUtil(unidade.terreno_dimensoes) ??
            textoUtil(unidade.terreno_area);
          const disponivel = unidade.situacao === "disponivel";

          return (
            <div
              key={unidade.id}
              data-revelar
              style={{ "--atraso": `${(i % 3) * 70}ms` } as React.CSSProperties}
              className={cn(
                "flex flex-col rounded-xl border p-5 transition-colors duration-500",
                disponivel
                  ? "border-[var(--borda)] bg-[var(--bg-elevado)] hover:border-[var(--color-verde-300)]"
                  : "border-[var(--borda)] bg-[var(--bg-fundo)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-medium">
                    {unidade.identificacao}
                  </h3>
                  {unidade.tipo?.nome ? (
                    <p className="mt-0.5 text-xs text-[var(--fg-tenue)]">
                      {unidade.tipo.nome}
                      {unidade.andar ? ` · ${unidade.andar} andar` : ""}
                    </p>
                  ) : null}
                </div>
                <Selo tipo={unidade.situacao}>
                  {SITUACOES_UNIDADE[unidade.situacao].rotulo}
                </Selo>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                {textoUtil(unidade.area_construida) ? (
                  <Linha
                    Icone={Ruler}
                    rotulo="Área construída"
                    valor={unidade.area_construida!}
                  />
                ) : null}
                {terreno ? (
                  <Linha Icone={LandPlot} rotulo="Terreno" valor={terreno} />
                ) : null}
                {unidade.andar ? (
                  <Linha Icone={Layers} rotulo="Andar" valor={unidade.andar} />
                ) : null}
              </dl>

              {/* Valor ausente não vira "sob consulta": some. */}
              {valor ? (
                <p className="font-display tabular mt-4 text-xl font-medium">
                  {valor}
                </p>
              ) : null}

              {disponivel ? (
                <Link
                  prefetch={false}
                  href={`/cadastro?empreendimento=${slugEmpreendimento}&unidade=${unidade.id}`}
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--acento)]"
                >
                  Tenho interesse nesta unidade
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>

      {observacao ? (
        <p className="mt-6 text-sm text-[var(--fg-tenue)]">{observacao}</p>
      ) : null}
    </div>
  );
}

function Linha({
  Icone,
  rotulo,
  valor,
}: {
  Icone: React.ComponentType<{ className?: string }>;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icone className="h-3.5 w-3.5 shrink-0 text-[var(--fg-tenue)]" />
      <dt className="sr-only">{rotulo}</dt>
      <dd className="text-[var(--fg-suave)]">{valor}</dd>
    </div>
  );
}
