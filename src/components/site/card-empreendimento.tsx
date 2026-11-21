import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

import { CartaoVivo } from "@/components/site/cartao-vivo";
import { Selo } from "@/components/site/ui";
import { Simbolo } from "@/components/site/logo";
import type { CardEmpreendimento } from "@/lib/queries";
import { SITUACOES, cn } from "@/lib/utils";

/**
 * Card de empreendimento.
 *
 * REGRA DE ESTRUTURA — vale para qualquer card do site: a animação de
 * entrada (data-revelar, data-quadro) e o hover NUNCA ficam no mesmo
 * elemento. As regras de entrada definem `transition` inteira; num
 * elemento que também tem hover, elas apagam a transição do hover, e o
 * zoom e a sombra passam a trocar de uma vez, sem animação. Foi o "corte
 * seco" que sobreviveu a três rodadas de ajuste de tempo, porque o tempo
 * nunca chegava a ser aplicado.
 *
 * Então são três camadas:
 *   div[data-revelar]   entra quando a pessoa rola até ele
 *   CartaoVivo          sobe, ganha sombra e a borda acende no cursor
 *   Link                o conteúdo, com a foto e o texto
 *
 * E o data-quadro (a foto abrindo de baixo para cima) fica na moldura
 * da foto, não na foto: a foto é quem dá o zoom no hover.
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
    <div
      data-revelar
      style={{ "--atraso": `${atraso}ms` } as React.CSSProperties}
      className={cn("h-full", className)}
    >
      <CartaoVivo className="h-full">
        <Link
          href={`/empreendimentos/${item.slug}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)]"
        >
          <div
            data-quadro
            className="relative aspect-[4/3] overflow-hidden bg-[var(--color-verde-900)]"
          >
            {item.imagem_principal ? (
              <Image
                src={item.imagem_principal}
                alt={item.nome}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                /* A foto anda mais devagar que o cartão (1,4 s contra
                   0,8 s) e menos. Dois tempos dão profundidade. */
                className="object-cover transition-[transform,filter] duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.06] group-hover:brightness-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--color-verde-800)] to-[var(--color-verde-950)]">
                <Simbolo className="h-16 w-auto text-white/10" />
              </div>
            )}

            {/* Véu que sobe de baixo no hover, para o botão redondo
                assentar sobre ele. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/55 via-[var(--color-verde-950)]/5 to-transparent opacity-0 transition-opacity duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:opacity-100"
            />

            <div className="absolute top-4 left-4">
              <Selo tipo={item.situacao}>{situacao.rotulo}</Selo>
            </div>

            {/* O botão redondo nasce do canto: cresce, gira um oitavo de
                volta e aparece. É o convite do hover, em vez de só a
                foto dar zoom. */}
            <span
              aria-hidden
              className="absolute right-4 bottom-4 grid h-11 w-11 scale-75 -rotate-45 place-items-center rounded-full bg-white text-[var(--color-verde-900)] opacity-0 shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-[transform,opacity] duration-[800ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100"
            >
              <ArrowUpRightIcon size={18} weight="bold" />
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-xl font-medium text-balance transition-colors duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:text-[var(--acento)]">
              {item.nome}
            </h3>

            {/* Fio que corre sob o nome, da esquerda para a direita. */}
            <span
              aria-hidden
              className="mt-3 block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--color-acento)] via-[var(--color-ouro-300)] to-transparent transition-transform duration-[1100ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-x-100"
            />

            {item.linha_card ? (
              <p className="mt-3.5 text-sm leading-relaxed text-[var(--fg-suave)]">
                {item.linha_card}
              </p>
            ) : null}

            <div className="mt-auto flex items-end justify-between gap-4 pt-6">
              {local ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-tenue)]">
                  <MapPinIcon size={14} weight="duotone" className="shrink-0" />
                  {local}
                </span>
              ) : (
                <span />
              )}

              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--acento)]">
                Ver detalhes
                <ArrowUpRightIcon
                  size={16}
                  weight="bold"
                  className="transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </span>
            </div>
          </div>
        </Link>
      </CartaoVivo>
    </div>
  );
}
