"use client";

import { useEffect } from "react";

/**
 * Os efeitos pequenos do site, num lugar só.
 *
 * - Luz (data-luz): uma mancha suave de cor acompanha o mouse dentro do
 *   quadro. Aqui só se conta onde o cursor está; o desenho é CSS.
 *
 * Fica no layout do site, que não remonta entre páginas; por isso a luz
 * usa delegação (um ouvinte no documento), que vale também para o que
 * o React inserir depois.
 */
export function Efeitos() {
  // ------------------------------------------------------------ luz
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    let quadro = 0;
    let alvo: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const pintar = () => {
      quadro = 0;
      if (!alvo) return;
      const caixa = alvo.getBoundingClientRect();
      alvo.style.setProperty("--lx", `${x - caixa.left}px`);
      alvo.style.setProperty("--ly", `${y - caixa.top}px`);
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.("[data-luz]");
      alvo = el instanceof HTMLElement ? el : null;
      if (!alvo) return;
      x = e.clientX;
      y = e.clientY;
      if (!quadro) quadro = requestAnimationFrame(pintar);
    };

    document.addEventListener("pointermove", mover, { passive: true });
    return () => {
      document.removeEventListener("pointermove", mover);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return null;
}
