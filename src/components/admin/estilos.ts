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
  principal:
    "bg-[var(--color-verde-900)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_6px_16px_-8px_rgb(1_38_22/0.7)] hover:bg-[var(--color-verde-800)]",
  neutro:
    "border border-[var(--borda)] bg-[var(--bg-elevado)] text-[var(--fg)] shadow-[0_1px_0_rgb(1_38_22/0.04)] hover:border-[var(--borda-forte)] hover:bg-[var(--bg)]",
  suave:
    "text-[var(--fg-suave)] hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]",
  perigo:
    "border border-[var(--color-acento-forte)]/40 text-[var(--color-acento-forte)] hover:bg-[var(--color-acento)]/10",
};

export const BASE_BOTAO =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 " +
  "text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

/** As classes do botão, para um Link que precisa parecer botão. */
export function classeBotao(tom: TomBotao = "principal", className?: string) {
  return cn(BASE_BOTAO, TOM_BOTAO[tom], className);
}
