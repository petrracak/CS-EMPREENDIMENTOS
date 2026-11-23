import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Palavras } from "@/components/site/palavras";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- botões */

type Aparencia = "solido" | "contorno" | "claro" | "texto";

/**
 * O hover de cada aparência muda três coisas ao mesmo tempo — cor, sombra
 * e um milímetro de altura. Mudar só a cor é o que deixa o botão seco: o
 * dedo não sente resposta, só vê outra tinta.
 */
const APARENCIA: Record<Aparencia, string> = {
  // O verde da marca cheio. A ação principal de cada bloco.
  solido:
    "bg-[var(--acento)] text-white hover:bg-[var(--acento-hover)] " +
    "shadow-[0_1px_2px_rgb(1_38_22/0.12)] " +
    "hover:shadow-[0_10px_28px_rgb(1_38_22/0.22)] hover:-translate-y-0.5",
  // Sobre papel: contorno discreto que ganha fundo e cor no hover.
  contorno:
    "border border-[var(--borda-forte)] text-[var(--fg)] " +
    "hover:border-[var(--acento)] hover:text-[var(--acento)] " +
    "hover:bg-[var(--color-verde-50)] hover:-translate-y-0.5",
  // Sobre foto ou sobre o verde escuro.
  claro:
    "bg-white/95 text-[var(--color-verde-900)] hover:bg-white backdrop-blur-sm " +
    "hover:shadow-[0_12px_32px_rgb(0_0_0/0.28)] hover:-translate-y-0.5",
  texto:
    "text-[var(--acento)] hover:text-[var(--acento-hover)] underline-offset-4 hover:underline px-0",
};

const BASE_BOTAO =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 " +
  "text-sm font-medium transition-all duration-500 " +
  "[transition-timing-function:var(--ease-suave)] " +
  // Clique devolve o botão ao lugar: o gesto fecha onde começou.
  "active:translate-y-0 active:duration-100 " +
  "disabled:opacity-50 disabled:pointer-events-none";

export function Botao({
  aparencia = "solido",
  className,
  ...props
}: ComponentProps<"button"> & { aparencia?: Aparencia }) {
  return (
    <button
      className={cn(BASE_BOTAO, APARENCIA[aparencia], className)}
      {...props}
    />
  );
}

export function BotaoLink({
  aparencia = "solido",
  className,
  ...props
}: ComponentProps<typeof Link> & { aparencia?: Aparencia }) {
  // Os links vêm do painel, e a CS pode apontar um botão para fora do
  // site. Esses abrem em outra aba, para o visitante não perder a página.
  const externo =
    typeof props.href === "string" && /^(https?:|mailto:|tel:)/.test(props.href);
  return (
    <Link
      className={cn(BASE_BOTAO, APARENCIA[aparencia], className)}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}

export function BotaoExterno({
  aparencia = "contorno",
  className,
  ...props
}: ComponentProps<"a"> & { aparencia?: Aparencia }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(BASE_BOTAO, APARENCIA[aparencia], className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------- seções */

/** A linha miúda em caixa alta que abre cada seção. */
export function Olho({ children }: { children: ReactNode }) {
  return <span className="olho">{children}</span>;
}

export function Secao({
  children,
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={cn("px-5 py-20 sm:px-8 md:py-28", className)} {...props}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Título de seção com uma palavra em gradiente.
 *
 * O destaque substitui a serifada itálica das referências: a palavra que
 * carrega o sentido da frase ganha o verde da marca em gradiente, e o
 * resto fica em tinta.
 */
export function Titulo({
  antes,
  destaque,
  depois,
  html,
  nivel = "h2",
  modo = "rolagem",
  atraso = 0,
  className,
}: {
  antes?: string;
  destaque?: string;
  depois?: string;
  /** Título gravado pelo painel, com o destaque marcado onde a CS quis. */
  html?: string;
  nivel?: "h1" | "h2" | "h3";
  /** "entrada" para a primeira dobra, que não espera o observador. */
  modo?: "entrada" | "rolagem";
  atraso?: number;
  className?: string;
}) {
  return (
    <Palavras
      como={nivel}
      modo={modo}
      atraso={atraso}
      html={html}
      segmentos={
        html === undefined
          ? [
              { texto: antes ?? "" },
              { texto: destaque ?? "", destaque: "verde" },
              { texto: depois ?? "" },
            ]
          : undefined
      }
      className={cn(
        "font-display text-display-sm sm:text-display-md",
        "text-balance font-medium",
        className,
      )}
    />
  );
}

/* --------------------------------------------------------------- selos */

const CORES_SELO: Record<string, string> = {
  em_construcao: "bg-[var(--color-verde-800)] text-white",
  em_acabamento: "bg-[var(--color-ouro-600)] text-white",
  entregue: "bg-[var(--bg-fundo)] text-[var(--fg-suave)] border border-[var(--borda-forte)]",
  disponivel: "bg-[var(--color-verde-800)] text-white",
  reservada: "bg-[var(--color-ouro-600)] text-white",
  vendida: "bg-[var(--bg-fundo)] text-[var(--fg-tenue)] border border-[var(--borda-forte)]",
};

export function Selo({
  tipo,
  children,
  className,
}: {
  tipo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1",
        "text-[0.6875rem] font-semibold tracking-wide uppercase",
        CORES_SELO[tipo] ?? CORES_SELO.entregue,
        className,
      )}
    >
      {children}
    </span>
  );
}
