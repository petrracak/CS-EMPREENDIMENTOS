import type { ReactNode } from "react";

import { lerPecas, type Peca } from "@/lib/texto-rico";
import { cn } from "@/lib/utils";

/**
 * Texto do painel com negrito, itálico, sublinhado e destaque, já como
 * elementos React (o HTML gravado nunca é injetado: ver lib/texto-rico).
 *
 * `Trecho` é para uma frase dentro de um <p> que a página já tem.
 * `TextoRico` é para texto de vários parágrafos: o editor grava cada um
 * num <p>; texto antigo, de caixa comum, separa por linha em branco.
 */
export function Trecho({
  html,
  forte,
}: {
  html: string | null | undefined;
  /** Classe do negrito, para fundo escuro (ex.: "text-white"). */
  forte?: string;
}) {
  return <>{lerPecas(html).map((peca, i) => montar(peca, i, forte))}</>;
}

export function TextoRico({
  html,
  className,
  forte,
}: {
  html: string | null | undefined;
  className?: string;
  forte?: string;
}) {
  const paragrafos = separarParagrafos(html);
  if (!paragrafos.length) return null;
  return (
    <div className={cn("space-y-4", className)}>
      {paragrafos.map((p, i) => (
        <p key={i}>
          <Trecho html={p} forte={forte} />
        </p>
      ))}
    </div>
  );
}

export function separarParagrafos(html: string | null | undefined) {
  const texto = (html ?? "").trim();
  if (!texto) return [];
  const partes = /<p[\s>]/i.test(texto)
    ? texto.split(/<\/p>|<p[^>]*>/i)
    : texto.split(/\r?\n\s*\r?\n/);
  return partes.map((p) => p.trim()).filter(Boolean);
}

function montar(peca: Peca, chave: number, forte?: string): ReactNode {
  let no: ReactNode = peca.texto;
  if (peca.destaque) no = <span className="destaque">{no}</span>;
  if (peca.sublinhado) no = <u>{no}</u>;
  if (peca.italico) no = <em>{no}</em>;
  if (peca.negrito) no = <strong className={forte}>{no}</strong>;
  return <span key={chave}>{no}</span>;
}
