import type { ComponentProps, ReactNode } from "react";

import { BotaoNovo } from "@/components/site/botao-novo";
import { Palavras } from "@/components/site/palavras";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- botões */

/**
 * Os botões do site são os do topo do Figma (ver BotaoNovo e .botao-novo
 * em globals.css). Aqui ficam os nomes de sempre, para as páginas:
 *
 *   solido     o principal, com o gradiente da marca e a seta
 *   contorno   o secundário, claro, com o texto em gradiente
 *   claro      o mesmo secundário, pensado para fundo escuro
 *
 * O ícone segue o destino (WhatsApp leva o do WhatsApp) e pode ser
 * forçado por `icone`. O texto vai como filho, sem ícone junto.
 */

type Aparencia = "solido" | "contorno" | "claro";

const TIPO = { solido: "primario", contorno: "secundario", claro: "secundario" } as const;

export function BotaoLink({
  aparencia = "solido",
  href,
  icone,
  className,
  children,
}: {
  aparencia?: Aparencia;
  href: string;
  icone?: "seta" | "zap";
  className?: string;
  children: ReactNode;
}) {
  return (
    <BotaoNovo
      href={href}
      tipo={TIPO[aparencia]}
      icone={icone}
      className={cn(aparencia === "claro" && "sobre-escuro", className)}
    >
      {children}
    </BotaoNovo>
  );
}

/** Link para fora do site (WhatsApp, mapa): abre em outra aba. */
export const BotaoExterno = BotaoLink;

/** Botão de formulário, no desenho do principal. */
export function Botao({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button className={cn("botao-novo botao-novo-primario", className)} {...props}>
      <span>{children}</span>
    </button>
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
