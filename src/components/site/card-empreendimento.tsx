import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Selo } from "@/components/site/ui";
import { Simbolo } from "@/components/site/logo";
import type { CardEmpreendimento } from "@/lib/queries";
import { SITUACOES, cn } from "@/lib/utils";

/**
 * Card de empreendimento.
 *
 * A foto é descoberta de baixo para cima na entrada (data-quadro) e dá um
 * passo de zoom no hover — o mesmo gesto da referência, sem exagero.
 *
 * Sem foto, o card não quebra: mostra um bloco no verde da marca com o
 * símbolo marcado d'água. É o caso dos empreendimentos entregues, que a
 * CS ainda vai fotografar, e evita o card com buraco branco no meio.
 */
export function CardEmpreendimento({
  item,
  atraso = 0,
  className,
}: {
  item: CardEmpreendimento;
  atraso?: number;
  className?: string;
}) {
  const situacao = SITUACOES[item.situacao];
  const local = [item.endereco, item.bairro].filter(Boolean).join(", ");

  return (
    <Link
      href={`/empreendimentos/${item.slug}`}
      data-revelar
      style={{ "--atraso": `${atraso}ms` } as React.CSSProperties}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl",
        "border border-[var(--borda)] bg-[var(--bg-elevado)]",
        "transition-all duration-700 [transition-timing-function:var(--ease-suave)]",
        "hover:-translate-y-1.5 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-alta)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-verde-900)]">
        {item.imagem_principal ? (
          <Image
            src={item.imagem_principal}
            alt={item.nome}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-quadro
            className="object-cover transition-transform duration-[1100ms] [transition-timing-function:var(--ease-suave)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--color-verde-800)] to-[var(--color-verde-950)]">
            <Simbolo className="h-16 w-auto text-white/10" />
          </div>
        )}

        {/* Véu que sobe no hover: dá peso ao card sob o cursor sem
            precisar mover nada na foto. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/45 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />

        <div className="absolute top-4 left-4">
          <Selo tipo={item.situacao}>{situacao.rotulo}</Selo>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-balance transition-colors duration-500 group-hover:text-[var(--acento)]">
          {item.nome}
        </h3>

        {item.linha_card ? (
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-suave)]">
            {item.linha_card}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          {local ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-tenue)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {local}
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--acento)]">
            Ver detalhes
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
