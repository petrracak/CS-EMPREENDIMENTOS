"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Simbolo } from "@/components/site/logo";

/**
 * A faixa de contato do fim da página inicial, com o símbolo da CS que
 * cresce conforme a pessoa rola.
 *
 * A seção fica alta (bem mais que uma tela) e o palco dela gruda no topo
 * enquanto se rola por dentro. A rolagem vira um progresso de 0 a 1:
 *
 *   0 a 0,6    o símbolo cresce do tamanho de um ícone até passar da tela
 *   0,35 a 0,6 o fundo vira o verde escuro da marca
 *   0,5 a 0,75 o símbolo apaga até virar marca d'água
 *   0,6 a 0,85 o título e os botões sobem e aparecem
 *
 * O HTML do servidor já vem no estado final (verde, texto à vista), que
 * é o que fica para quem pediu menos movimento ou está sem JavaScript.
 * Só depois de montar a seção ganha a altura e o palco que gruda.
 */
export function FaixaFinal({ children }: { children: ReactNode }) {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = secao.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("faixa-final-viva");

    const entre = (v: number, a: number, b: number) =>
      Math.min(1, Math.max(0, (v - a) / (b - a)));
    const suave = (t: number) => t * t * (3 - 2 * t);
    // Começa devagar e acelera: o símbolo "toma" a tela no fim.
    const acelera = (t: number) => t * t * t;

    let quadro = 0;
    const pintar = () => {
      quadro = 0;
      const caixa = el.getBoundingClientRect();
      const tela = window.innerHeight;
      const p = entre(-caixa.top, 0, Math.max(1, caixa.height - tela));

      const escala = 1 + acelera(entre(p, 0, 0.6)) * 26;
      el.style.setProperty("--escala", escala.toFixed(3));
      el.style.setProperty("--fundo", suave(entre(p, 0.35, 0.6)).toFixed(3));
      el.style.setProperty(
        "--simbolo",
        (1 - 0.92 * suave(entre(p, 0.5, 0.75))).toFixed(3),
      );
      const conteudo = suave(entre(p, 0.6, 0.85));
      el.style.setProperty("--conteudo", conteudo.toFixed(3));
      el.toggleAttribute("data-faixa-pronta", conteudo > 0.02);
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(pintar);
    };

    // Só escuta a rolagem enquanto a seção está perto da tela.
    let ouvindo = false;
    const vigia = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !ouvindo) {
          ouvindo = true;
          window.addEventListener("scroll", pedir, { passive: true });
          window.addEventListener("resize", pedir);
          pedir();
        } else if (!entrada.isIntersecting && ouvindo) {
          ouvindo = false;
          window.removeEventListener("scroll", pedir);
          window.removeEventListener("resize", pedir);
          pedir();
        }
      },
      { rootMargin: "200px 0px" },
    );
    vigia.observe(el);
    pintar();

    return () => {
      vigia.disconnect();
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(quadro);
      el.classList.remove("faixa-final-viva");
    };
  }, []);

  return (
    <section ref={secao} className="faixa-final" data-faixa-pronta>
      <div className="faixa-final-palco">
        <div aria-hidden className="faixa-final-fundo">
          <div className="aurora" />
          <div className="brilho pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full opacity-70" />
          <div className="linhas absolute inset-0 opacity-70" />
        </div>
        <div aria-hidden className="faixa-final-simbolo">
          <Simbolo className="h-full w-auto" />
        </div>
        <div className="faixa-final-conteudo">{children}</div>
      </div>
    </section>
  );
}
