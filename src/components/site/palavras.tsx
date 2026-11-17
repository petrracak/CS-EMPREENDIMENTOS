import { Fragment } from "react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Texto que entra palavra por palavra, saindo de um desfoque.
 *
 * É o efeito das referências, e a razão de ele existir como componente é
 * a divisão: cada palavra precisa do próprio elemento para ter o próprio
 * atraso. O desenho fica todo no CSS (ver [data-palavras] em
 * globals.css) — aqui só se decide o que é palavra e quando ela entra.
 *
 * O modo escolhe quem dispara:
 *   entrada   anima no carregamento, para a primeira dobra
 *   rolagem   espera o observador, para o resto da página
 *
 * O passo é curto de propósito. Acima de uns 70 ms por palavra a frase
 * deixa de entrar junto e passa a ser lida letreiro, uma palavra atrás
 * da outra, o que cansa num título de oito palavras.
 */

export type Segmento = {
  texto: string;
  /** Aplica o gradiente da marca na palavra. */
  destaque?: "verde" | "ouro";
};

export function Palavras({
  segmentos,
  modo = "rolagem",
  atraso = 0,
  passo = 55,
  como: Tag = "span",
  className,
}: {
  segmentos: Segmento[];
  modo?: "entrada" | "rolagem";
  atraso?: number;
  passo?: number;
  como?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
}) {
  // Um segmento vazio (campo que a CS ainda não preencheu) não deve
  // virar palavra nenhuma, senão sobra espaço duplo no meio da frase.
  const palavras = segmentos.flatMap((segmento) =>
    segmento.texto
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((texto) => ({ texto, destaque: segmento.destaque })),
  );

  if (!palavras.length) return null;

  return (
    <Tag data-palavras={modo} className={className}>
      {palavras.map((palavra, i) => (
        <Fragment key={i}>
          <span
            style={{ "--atraso": `${atraso + i * passo}ms` } as CSSProperties}
            className={cn(
              palavra.destaque === "ouro" && "destaque-ouro",
              palavra.destaque === "verde" && "destaque",
            )}
          >
            {palavra.texto}
          </span>
          {/* O espaço fica fora do span: assim a linha quebra entre
              palavras como em texto comum, e não em bloco. */}
          {i < palavras.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
