"use client";

import { useMemo, useState } from "react";

import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { BotaoLink } from "@/components/site/ui";
import type { CardEmpreendimento as Item } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Tipo = { id: string; nome: string; slug: string };

/**
 * Listagem com filtros.
 *
 * A filtragem acontece no navegador: são pouco mais de uma dezena de
 * empreendimentos, e trazer todos de uma vez evita ida ao servidor a cada
 * clique. Se um dia a CS passar das dezenas, isto vira consulta.
 */
export function FiltrosEmpreendimentos({
  itens,
  tipos,
}: {
  itens: Item[];
  tipos: Tipo[];
}) {
  const [situacao, setSituacao] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");

  // Só mostra os tipos que algum empreendimento publicado realmente usa:
  // um filtro que nunca devolve nada é só ruído.
  const tiposEmUso = useMemo(() => {
    const usados = new Set(itens.map((i) => i.tipo?.slug).filter(Boolean));
    return tipos.filter((t) => usados.has(t.slug));
  }, [itens, tipos]);

  const filtrados = useMemo(() => {
    return itens.filter((item) => {
      const porSituacao =
        situacao === "todos" ||
        (situacao === "em_obra" && item.situacao !== "entregue") ||
        (situacao === "entregue" && item.situacao === "entregue");
      const porTipo = tipo === "todos" || item.tipo?.slug === tipo;
      return porSituacao && porTipo;
    });
  }, [itens, situacao, tipo]);

  return (
    <>
      <div
        data-revelar
        className="mt-10 flex flex-col gap-5 border-y border-[var(--borda)] py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <Grupo
          rotulo="Situação"
          valor={situacao}
          aoMudar={setSituacao}
          opcoes={[
            { valor: "todos", rotulo: "Todos" },
            { valor: "em_obra", rotulo: "Em construção" },
            { valor: "entregue", rotulo: "Entregues" },
          ]}
        />

        {tiposEmUso.length > 1 ? (
          <Grupo
            rotulo="Tipo"
            valor={tipo}
            aoMudar={setTipo}
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              ...tiposEmUso.map((t) => ({ valor: t.slug, rotulo: t.nome })),
            ]}
          />
        ) : null}
      </div>

      {/* Título para leitor de tela: entre o h1 da página e o h3 de cada
          card não pode faltar um h2. */}
      <h2 className="sr-only">Lista de empreendimentos</h2>
      {filtrados.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((item, i) => (
            <CardEmpreendimento
              key={item.id}
              item={item}
              atraso={(i % 3) * 90}
              prioridade={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--borda-forte)] px-6 py-16 text-center">
          <p className="text-[var(--fg-suave)]">
            Não encontramos empreendimentos com esses filtros. Limpe os filtros
            ou fale com a gente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSituacao("todos");
                setTipo("todos");
              }}
              className="rounded-full border border-[var(--borda-forte)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
            >
              Limpar filtros
            </button>
            <BotaoLink href="/cadastro">Falar com a gente</BotaoLink>
          </div>
        </div>
      )}
    </>
  );
}

function Grupo({
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold tracking-[0.12em] text-[var(--fg-tenue)] uppercase">
        {rotulo}
      </span>
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => aoMudar(opcao.valor)}
            aria-pressed={ativo}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-all duration-500",
              "[transition-timing-function:var(--ease-saida)]",
              ativo
                ? "bg-[var(--color-verde-800)] text-white"
                : "border border-[var(--borda)] text-[var(--fg-suave)] hover:border-[var(--borda-forte)] hover:text-[var(--fg)]",
            )}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
