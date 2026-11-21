import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Headset com ondas saindo dele, em laço.
 *
 * Desenhado aqui, e não tirado de biblioteca, porque o que faz o
 * desenho funcionar é a animação: três arcos que nascem no centro,
 * abrem e somem, um a cada segundo e meio. Ícone de biblioteca é uma
 * forma parada, e parado isto seria só mais um ícone.
 *
 * O ciclo é de 4,5 s e as ondas nunca passam de 55% de opacidade. É o
 * que separa "a linha está aberta" de "banner piscando".
 */
export function IconeAtendimento({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={cn("atendimento h-16 w-16 sm:h-20 sm:w-20", className)}
      {...props}
    >
      {/* As ondas ficam atrás, saindo de trás do headset. */}
      <g className="ondas" stroke="currentColor">
        <circle cx="48" cy="48" r="30" />
        <circle cx="48" cy="48" r="30" />
        <circle cx="48" cy="48" r="30" />
      </g>

      <g
        className="fone"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* O arco por cima da cabeça. */}
        <path d="M30 52v-5a18 18 0 0 1 36 0v5" />
        {/* As duas conchas. */}
        <rect x="22" y="49" width="11" height="17" rx="5.5" />
        <rect x="63" y="49" width="11" height="17" rx="5.5" />
        {/* A haste que desce até o microfone. */}
        <path d="M68.5 66v2.5a7.5 7.5 0 0 1-7.5 7.5h-5.5" />
        <circle cx="51" cy="76" r="2.75" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
