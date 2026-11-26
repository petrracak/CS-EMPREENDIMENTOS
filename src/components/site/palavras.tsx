import { Fragment } from "react";
import type { CSSProperties } from "react";

import {
  lerPalavras,
  lerPecas,
  type Palavra,
  type Peca,
} from "@/lib/texto-rico";
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
 *
 * O texto chega de dois jeitos: em segmentos (títulos fixos no código) ou
 * como o HTML mínimo que o painel grava (ver lib/texto-rico.ts), com
 * negrito, itálico, sublinhado e destaque onde a CS marcou.
 */

export type Segmento = {
  texto: string;
  /** Aplica o gradiente da marca na palavra. */
  destaque?: "verde" | "ouro";
};

export type Tom = "verde" | "ouro";

/** As classes de um pedaço de palavra. O tom é o do gradiente. */
export function classesDaPeca(peca: Omit<Peca, "texto">, tom: Tom) {
  return cn(
    peca.negrito && "font-bold",
    peca.italico && "italic",
    peca.sublinhado &&
      "underline decoration-[0.06em] underline-offset-[0.16em]",
    // Texto em gradiente é transparente, e o sublinhado herdaria isso.
    peca.sublinhado &&
      peca.destaque &&
      (tom === "ouro"
        ? "decoration-[var(--color-ouro-300)]"
        : "decoration-[var(--color-verde-700)]"),
    peca.destaque && (tom === "ouro" ? "destaque-ouro" : "destaque"),
  );
}

function dosSegmentos(segmentos: Segmento[]): {
  palavras: Palavra[];
  tom: Tom;
} {
  const tom = segmentos.find((s) => s.destaque)?.destaque ?? "verde";
  // Um segmento vazio (campo que a CS ainda não preencheu) não deve
  // virar palavra nenhuma, senão sobra espaço duplo no meio da frase.
  const palavras = segmentos.flatMap((segmento) =>
    segmento.texto
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((texto) => [{ texto, destaque: !!segmento.destaque }]),
  );
  return { palavras, tom };
}

export function Palavras({
  segmentos,
  html,
  tom: tomHtml = "verde",
  modo = "rolagem",
  atraso = 0,
  passo = 55,
  como: Tag = "span",
  className,
}: {
  segmentos?: Segmento[];
  /** Título gravado pelo painel. */
  html?: string;
  /** Cor do destaque quando o texto vem do painel. */
  tom?: Tom;
  modo?: "entrada" | "rolagem";
  atraso?: number;
  passo?: number;
  como?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
}) {
  const { palavras, tom } =
    html !== undefined
      ? { palavras: lerPalavras(html), tom: tomHtml }
      : dosSegmentos(segmentos ?? []);

  if (!palavras.length) return null;

  return (
    <Tag data-palavras={modo} className={className}>
      {palavras.map((palavra, i) => {
        const estilo = {
          "--atraso": `${atraso + i * passo}ms`,
        } as CSSProperties;
        const proxima = palavras[i + 1];
        // Sublinhado que continua na palavra seguinte passa pelo espaço.
        const espacoSublinhado =
          proxima &&
          palavra[palavra.length - 1].sublinhado &&
          proxima[0].sublinhado;

        return (
          <Fragment key={i}>
            {palavra.length === 1 ? (
              // A classe fica no próprio span da palavra: o CSS da entrada
              // procura o dourado como filho direto do título.
              <span style={estilo} className={classesDaPeca(palavra[0], tom)}>
                {palavra[0].texto}
              </span>
            ) : (
              <span style={estilo}>
                {palavra.map((peca, j) => (
                  <span key={j} className={classesDaPeca(peca, tom)}>
                    {peca.texto}
                  </span>
                ))}
              </span>
            )}
            {/* O espaço fica fora do span: assim a linha quebra entre
                palavras como em texto comum, e não em bloco. */}
            {proxima ? (
              espacoSublinhado ? (
                <span className="underline decoration-[0.06em] underline-offset-[0.16em]">
                  {" "}
                </span>
              ) : (
                " "
              )
            ) : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}

/**
 * Texto do painel sem a animação de palavra por palavra: para frases
 * curtas fora da rolagem, como a faixa de campanha e o pop-up de saída.
 */
export function TextoRico({ html, tom }: { html: string; tom: Tom }) {
  return (
    <>
      {lerPecas(html).map((peca, i) => (
        <span key={i} className={classesDaPeca(peca, tom)}>
          {peca.texto}
        </span>
      ))}
    </>
  );
}
