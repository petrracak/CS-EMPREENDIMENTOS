"use client";

import { useEffect, useRef, useState } from "react";

import type { FotoVitrine } from "@/lib/vitrine";

/** Tempo de cada foto, contando a troca. */
const INTERVALO = 6000;
/** Largura sobre altura da logo (453 × 840 no Figma). */
const FORMATO_LOGO = 453 / 840.177;

/**
 * Os empreendimentos passando dentro da logo da CS, em preto e branco.
 *
 * A logo é a máscara (public/site/logo-mascara.svg): a foto só aparece
 * dentro do desenho. Por cima vai o degradê do Figma, do transparente ao
 * verde da marca, de cima para baixo.
 *
 * A troca é a foto nova aparecendo por cima da anterior, que fica inteira
 * embaixo até a nova cobrir tudo: assim o fundo menta nunca vaza no meio
 * da troca. Cada foto entra com um zoom bem lento.
 *
 * Só a primeira foto carrega com a página. A seguinte é baixada enquanto
 * a atual está na tela, e o slide espera por ela se a conexão for lenta.
 */
export function VitrineLogo({ fotos }: { fotos: FotoVitrine[] }) {
  const [atual, setAtual] = useState(0);
  const [anterior, setAnterior] = useState<number | null>(null);
  // Quantas fotos já podem ter o src no HTML: a atual e a próxima.
  const [liberadas, setLiberadas] = useState(Math.min(2, fotos.length));
  const prontas = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (fotos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let agora = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const proxima = (agora + 1) % fotos.length;
      if (!prontas.current.has(proxima)) return;
      setAnterior(agora);
      setAtual(proxima);
      setLiberadas((n) => Math.max(n, Math.min(proxima + 2, fotos.length)));
      agora = proxima;
    }, INTERVALO);
    return () => window.clearInterval(timer);
  }, [fotos.length]);

  return (
    <div className="vitrine-logo-mascara">
      <div className="vitrine-logo-fotos">
        {fotos.map((foto, i) => {
          // Uma foto deitada é desenhada mais larga que a logo; o sizes
          // acompanha, para o navegador escolher o tamanho certo.
          const fator = Math.max(
            1,
            foto.largura / foto.altura / FORMATO_LOGO,
          ).toFixed(2);
          const estado =
            i === atual ? "atual" : i === anterior ? "anterior" : undefined;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={foto.grande}
              src={i < liberadas ? foto.grande : undefined}
              srcSet={
                i < liberadas
                  ? `${foto.pequena} ${foto.larguraPequena}w, ${foto.grande} ${foto.largura}w`
                  : undefined
              }
              sizes={`(min-width: 1024px) calc(min(453px, 35.4vw) * ${fator}), calc(min(42.2vw, 236px) * ${fator})`}
              width={foto.largura}
              height={foto.altura}
              alt=""
              decoding="async"
              fetchPriority={i === 0 ? "high" : "low"}
              onLoad={() => prontas.current.add(i)}
              ref={(img) => {
                // Foto que já veio do cache não dispara onLoad depois da hidratação.
                if (img?.complete && img.naturalWidth) prontas.current.add(i);
              }}
              data-estado={estado}
              className="vitrine-logo-foto"
            />
          );
        })}
      </div>
      <div className="vitrine-logo-degrade" aria-hidden />
    </div>
  );
}
