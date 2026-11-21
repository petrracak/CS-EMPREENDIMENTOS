"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Número que conta até o valor quando entra na tela.
 *
 * O HTML do servidor já traz o valor final, e é ele que fica se o JS
 * não carregar, se a pessoa pediu menos movimento, ou se o número já
 * está à vista quando a página abre (um F5 no meio da página). Só um
 * número que ainda está abaixo da tela volta ao começo e espera.
 *
 * Ano não conta do zero: "2016" saindo de 0 parece cronômetro. Conta
 * dos dezesseis anos anteriores, que é o suficiente para ver o movimento.
 */
export function Contador({
  valor,
  className,
}: {
  valor: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [mostrado, setMostrado] = useState(valor);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const comPonto = valor.includes(".");
    const alvo = Number(valor.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(alvo)) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window) ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }

    const ehAno = /^(19|20)\d\d$/.test(valor);
    const inicio = ehAno ? alvo - 16 : 0;
    const formatar = (n: number) =>
      comPonto ? n.toLocaleString("pt-BR") : String(n);

    setMostrado(formatar(inicio));

    let quadro = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();

        const duracao = 1800;
        const t0 = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - t0) / duracao);
          // Sai rápido e chega devagar nos últimos números, que é o que
          // faz a contagem parecer que "assenta" no valor.
          const curva = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setMostrado(formatar(Math.round(inicio + (alvo - inicio) * curva)));
          if (t < 1) quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observador.observe(el);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [valor]);

  return (
    <span ref={ref} className={className}>
      {mostrado}
    </span>
  );
}
