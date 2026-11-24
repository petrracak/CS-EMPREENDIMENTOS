"use client";

import { useEffect } from "react";

/**
 * Gradiente contínuo nos títulos da home nova.
 *
 * O título entra palavra por palavra, e cada palavra é um elemento: com
 * o gradiente em cada uma, "10 anos" virava dois gradientes emendados.
 * Aqui as palavras em destaque que ficam juntas na mesma linha formam
 * um trecho só, e cada palavra mostra a sua fatia de um gradiente do
 * tamanho do trecho inteiro. Mudou de linha, começa outro trecho.
 *
 * É ajuste de apresentação: sem JS (ou antes de ele rodar), cada palavra
 * fica com o próprio gradiente, como antes. A conta é refeita quando o
 * título muda de largura (girar o celular, redimensionar a janela) e
 * depois que a fonte carrega, porque a largura das palavras muda.
 */
export function GradienteContinuo() {
  useEffect(() => {
    const titulos = Array.from(
      document.querySelectorAll<HTMLElement>(".home-nova [data-palavras]"),
    );

    const ajustar = (titulo: HTMLElement) => {
      // As palavras são os filhos diretos; uma palavra está em destaque
      // se ela, ou um pedaço dela, tem a classe .destaque.
      const palavras = Array.from(titulo.children) as HTMLElement[];
      let trecho: HTMLElement[] = [];

      const fechar = () => {
        if (!trecho.length) return;
        const inicio = trecho[0].offsetLeft;
        const ultimo = trecho[trecho.length - 1];
        const largura = ultimo.offsetLeft + ultimo.offsetWidth - inicio;
        for (const palavra of trecho) {
          const pecas = palavra.classList.contains("destaque")
            ? [palavra]
            : Array.from(palavra.querySelectorAll<HTMLElement>(".destaque"));
          for (const peca of pecas) {
            // offsetLeft das palavras e dos pedaços tem a mesma referência
            // (o ancestral posicionado), então a diferença é a posição
            // dentro do trecho.
            const x = peca.offsetLeft - inicio;
            peca.style.backgroundSize = `${largura}px 100%`;
            peca.style.backgroundPosition = `${-x}px 0`;
          }
        }
        trecho = [];
      };

      for (const palavra of palavras) {
        const destaque =
          palavra.classList.contains("destaque") || !!palavra.querySelector(".destaque");
        const anterior = trecho[trecho.length - 1];
        // Mesma linha = mesmo topo (com folga de arredondamento).
        const mesmaLinha = anterior && Math.abs(anterior.offsetTop - palavra.offsetTop) < 4;
        if (!destaque || (anterior && !mesmaLinha)) fechar();
        if (destaque) trecho.push(palavra);
      }
      fechar();
    };

    const ajustarTodos = () => titulos.forEach(ajustar);
    ajustarTodos();
    document.fonts?.ready.then(ajustarTodos);

    const observador = new ResizeObserver((entradas) =>
      entradas.forEach((e) => ajustar(e.target as HTMLElement)),
    );
    titulos.forEach((t) => observador.observe(t));
    return () => observador.disconnect();
  }, []);

  return null;
}
