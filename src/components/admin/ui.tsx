"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * Peças do painel.
 *
 * O painel é mais denso e mais quadrado que o site: cantos menores,
 * espaçamento menor, nada de animação de entrada. Quem trabalha aqui
 * repete a mesma tarefa dezenas de vezes e não quer esperar transição.
 */

/* -------------------------------------------------------- superfícies */

export function Cartao({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--borda)] bg-[var(--bg-elevado)]",
        className,
      )}
      {...props}
    />
  );
}

export function TituloBloco({
  children,
  apoio,
}: {
  children: ReactNode;
  apoio?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-lg font-medium">{children}</h2>
      {apoio ? (
        <p className="mt-1 text-sm leading-relaxed text-[var(--fg-tenue)]">
          {apoio}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ campos */

export function Campo({
  rotulo,
  apoio,
  className,
  children,
}: {
  rotulo: string;
  apoio?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-[var(--fg)]">{rotulo}</span>
      {apoio ? (
        <span className="mt-0.5 block text-xs leading-relaxed text-[var(--fg-tenue)]">
          {apoio}
        </span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const ENTRADA =
  "w-full rounded-lg border border-[var(--borda)] bg-[var(--bg)] px-3.5 py-2.5 " +
  // 16 px no celular: abaixo disso o Safari do iPhone dá zoom na página
  // ao tocar no campo, e a Carolina pode editar o site pelo telefone.
  "text-base sm:text-sm transition-colors duration-200 placeholder:text-[var(--fg-tenue)] " +
  "focus:border-[var(--acento)] focus:outline-none";

export function Entrada({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(ENTRADA, className)} {...props} />;
}

export function Area({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={4}
      className={cn(ENTRADA, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Selecao({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(ENTRADA, className)} {...props} />;
}

/* ------------------------------------------------------------ botões */

type Tom = "principal" | "neutro" | "perigo";

const TOM: Record<Tom, string> = {
  principal:
    "bg-[var(--acento)] text-white hover:bg-[var(--acento-hover)]",
  neutro:
    "border border-[var(--borda-forte)] text-[var(--fg)] hover:border-[var(--acento)] hover:text-[var(--acento)]",
  perigo:
    "border border-[var(--color-acento-forte)]/50 text-[var(--color-acento-forte)] hover:bg-[var(--color-acento)]/10",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 " +
  "text-sm font-medium transition-colors duration-200 " +
  "disabled:pointer-events-none disabled:opacity-50";

export function Botao({
  tom = "principal",
  className,
  ...props
}: ComponentProps<"button"> & { tom?: Tom }) {
  return <button className={cn(BASE, TOM[tom], className)} {...props} />;
}

/** Botão de envio que mostra sozinho que está salvando. */
export function Salvar({
  children = "Salvar",
  tom = "principal",
  className,
}: {
  children?: ReactNode;
  tom?: Tom;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(BASE, TOM[tom], className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Salvando…" : children}
    </button>
  );
}

/* ------------------------------------------------------------- avisos */

export function Aviso({
  tipo = "info",
  children,
}: {
  tipo?: "info" | "erro" | "ok";
  children: ReactNode;
}) {
  const cores = {
    info: "border-[var(--borda)] bg-[var(--bg-fundo)] text-[var(--fg-suave)]",
    erro: "border-[var(--color-acento-forte)]/40 bg-[var(--color-acento)]/10 text-[var(--fg)]",
    ok: "border-[var(--color-verde-200)] bg-[var(--color-verde-50)] text-[var(--color-verde-900)]",
  };
  return (
    <p className={cn("rounded-lg border px-4 py-3 text-sm", cores[tipo])}>
      {children}
    </p>
  );
}

export function Etiqueta({
  tom = "neutro",
  children,
}: {
  tom?: "neutro" | "verde" | "ouro";
  children: ReactNode;
}) {
  const cores = {
    neutro:
      "bg-[var(--bg-fundo)] text-[var(--fg-suave)] border border-[var(--borda)]",
    verde: "bg-[var(--color-verde-800)] text-white",
    ouro: "bg-[var(--color-ouro-600)] text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase",
        cores[tom],
      )}
    >
      {children}
    </span>
  );
}
