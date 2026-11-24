import Link from "next/link";
import type { ReactNode } from "react";

import { Whatsapp } from "@/components/icones-sociais";
import { cn } from "@/lib/utils";

/**
 * O botão do redesenho (home nova), no modelo dos botões do topo do Figma.
 *
 *   primario     gradiente da marca correndo devagar, seta num círculo
 *                menta; no hover um brilho atravessa e a seta gira
 *   secundario   cinza claro com borda fina e texto em gradiente; no
 *                hover a borda fica verde e o gradiente desliza
 *
 * O ícone acompanha o destino: link do WhatsApp leva o ícone do WhatsApp
 * na frente do texto; o resto, a seta depois dele. O desenho todo fica em
 * globals.css (.botao-novo), e o tamanho é ajustado por quem usa.
 */
export function BotaoNovo({
  href,
  children,
  tipo = "primario",
  icone,
  className,
}: {
  href: string;
  children: ReactNode;
  tipo?: "primario" | "secundario";
  /** Sem valor, decide pelo endereço: wa.me e api.whatsapp viram "zap". */
  icone?: "seta" | "zap";
  className?: string;
}) {
  const ehZap = icone ? icone === "zap" : /wa\.me|whatsapp\.com/.test(href);
  const externo = /^(https?:|mailto:|tel:)/.test(href);
  const classes = cn("botao-novo", `botao-novo-${tipo}`, className);

  const conteudo = (
    <>
      {ehZap ? <Whatsapp className="botao-novo-zap" /> : null}
      <span className={tipo === "secundario" ? "botao-novo-gradiente" : undefined}>
        {children}
      </span>
      {ehZap ? null : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/home-nova/seta.svg" alt="" width={24} height={24} className="botao-novo-seta" />
      )}
    </>
  );

  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {conteudo}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {conteudo}
    </Link>
  );
}
