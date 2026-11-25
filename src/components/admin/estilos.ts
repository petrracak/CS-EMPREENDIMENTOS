import { cn } from "@/lib/utils";

/**
 * Classes dos botões do painel, fora do arquivo "use client" de ui.tsx.
 *
 * Função exportada de um módulo de cliente não pode ser chamada numa
 * página do servidor (ela chega lá como referência, não como função).
 * As páginas usam classeBotao() em links que precisam parecer botão,
 * então ela mora aqui, num módulo neutro que os dois lados importam.
 */

export type TomBotao = "principal" | "neutro" | "perigo" | "suave";

export const TOM_BOTAO: Record<TomBotao, string> = {
  // O principal do site: o gradiente da marca, que desliza no hover.
  principal:
    "border border-white/10 bg-[linear-gradient(100deg,#004527_0%,#00ab61_50%,#004527_100%)] bg-[length:200%_100%] bg-left text-white shadow-[0_8px_20px_-14px_rgb(0_69_39/0.7)] transition-[background-position,box-shadow,transform] duration-700 hover:bg-right hover:shadow-[0_14px_28px_-14px_rgb(0_171_97/0.6)]",
  neutro:
    "border border-[rgb(11_11_11/0.14)] bg-[#f4f4f4] text-[var(--color-verde-800)] hover:border-[#00ab61]/50 hover:bg-white",
  suave:
    "text-[var(--fg-suave)] hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]",
  perigo:
    "border border-[var(--color-acento-forte)]/40 text-[var(--color-acento-forte)] hover:bg-[var(--color-acento)]/10",
};

export const BASE_BOTAO =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[0.66rem] px-5 " +
  "text-sm font-normal tracking-[-0.03em] whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

/** As classes do botão, para um Link que precisa parecer botão. */
export function classeBotao(tom: TomBotao = "principal", className?: string) {
  return cn(BASE_BOTAO, TOM_BOTAO[tom], className);
}
