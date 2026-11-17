"use client";

import { useEffect } from "react";

/**
 * Liga as animações que dependem de rolagem.
 *
 * Um único IntersectionObserver para o documento inteiro, em vez de um
 * componente com estado por bloco: a página inicial tem dezenas de
 * elementos que entram, e um observador por elemento custaria caro à toa.
 *
 * O CSS é quem desenha o movimento (ver globals.css):
 *   data-revelar            sobe e aparece
 *   data-palavras=rolagem   palavra por palavra, saindo do desfoque
 *   data-quadro             descobre a foto de baixo para cima
 *
 * A primeira dobra NÃO passa por aqui — ela usa data-entrada, que o CSS
 * anima no carregamento. Este componente só existe depois da hidratação,
 * e título de abertura não pode esperar por JS.
 *
 * Uma vez visível, o elemento para de ser observado: nada volta a
 * desaparecer quando a pessoa rola para cima, que é o tique de site
 * animado demais.
 */
export function Revelar() {
  useEffect(() => {
    const alvos = document.querySelectorAll<HTMLElement>(
      "[data-revelar]:not([data-visivel])," +
        '[data-palavras="rolagem"]:not([data-visivel]),' +
        "[data-quadro]:not([data-visivel])",
    );
    if (!alvos.length) return;

    // Sem suporte (ou com movimento reduzido), tudo aparece de uma vez.
    const paradoPorPreferencia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (paradoPorPreferencia || !("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.setAttribute("data-visivel", "sim"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.setAttribute("data-visivel", "sim");
          observador.unobserve(entrada.target);
        }
      },
      // Dispara bem ANTES de o elemento encostar na tela: a entrada leva
      // perto de um segundo, e com o gatilho na borda quem rola rápido
      // passa por blocos ainda a meio caminho. Um quarto de tela de
      // antecedência é o que faz a animação terminar antes de ser vista.
      { rootMargin: "0px 0px 25% 0px", threshold: 0 },
    );

    alvos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return null;
}
