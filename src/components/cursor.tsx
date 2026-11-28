"use client";

import { useEffect, useRef } from "react";

/**
 * O ponteiro da CS, no site e no painel.
 *
 * Duas peças: um ponto verde com borda creme, colado no mouse, e um anel
 * dourado que vem atrás com um pequeno atraso. Sobre um link ou botão, o
 * anel cresce e ganha um fundo dourado suave e o ponto some; sobre um
 * card com data-cursor, o anel mostra a palavra ("Ver"). Em campo de
 * texto o ponteiro da CS se esconde e volta o cursor de digitar do
 * sistema, para ninguém perder onde está escrevendo.
 *
 * Só existe com mouse (computador). Em tela de toque nada é montado.
 * Quem pediu menos movimento fica com o anel colado no ponto, sem atraso.
 *
 * O ponto anda no próprio evento do mouse; o anel anda num laço de
 * quadros que para sozinho quando alcança o ponto, para não gastar nada
 * com o mouse parado.
 */
const INTERATIVO =
  'a[href], button, [role="button"], [role="tab"], [role="link"], summary, label, select, input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], input[type="file"], [data-cursor]';
const TEXTO =
  'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"], [type="range"], [type="file"], [type="color"], [type="hidden"]), textarea, [contenteditable=""], [contenteditable="true"]';

export function Cursor() {
  const raiz = useRef<HTMLDivElement>(null);
  const ponto = useRef<HTMLDivElement>(null);
  const anel = useRef<HTMLDivElement>(null);
  const rotulo = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const el = raiz.current;
    const p = ponto.current;
    const a = anel.current;
    const r = rotulo.current;
    if (!el || !p || !a || !r) return;

    const semAtraso = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.documentElement.classList.add("cursor-proprio");

    let x = -100;
    let y = -100;
    let ax = -100;
    let ay = -100;
    let quadro = 0;
    let visivel = false;

    const andarAnel = () => {
      quadro = 0;
      const k = semAtraso ? 1 : 0.2;
      ax += (x - ax) * k;
      ay += (y - ay) * k;
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      if (Math.abs(x - ax) > 0.2 || Math.abs(y - ay) > 0.2) {
        quadro = requestAnimationFrame(andarAnel);
      }
    };

    const estado = (alvo: Element | null) => {
      if (!alvo) return;
      if (alvo.closest(TEXTO)) {
        el.dataset.estado = "texto";
        return;
      }
      const interativo = alvo.closest(INTERATIVO);
      if (!interativo) {
        el.dataset.estado = "";
        return;
      }
      if (
        interativo.matches(":disabled, [aria-disabled='true']") ||
        interativo.closest("fieldset:disabled")
      ) {
        el.dataset.estado = "bloqueado";
        return;
      }
      const palavra = interativo.getAttribute("data-cursor");
      if (palavra) {
        r.textContent = palavra;
        el.dataset.estado = "palavra";
      } else {
        el.dataset.estado = "link";
      }
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!visivel) {
        visivel = true;
        ax = x;
        ay = y;
        el.dataset.visivel = "";
      }
      if (!quadro) quadro = requestAnimationFrame(andarAnel);
    };

    const sobre = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      estado(e.target as Element);
    };

    // Saiu da janela ou entrou num iframe (mapa, vídeo): o iframe tem o
    // cursor dele, e o nosso ficaria parado na borda.
    const fora = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      visivel = false;
      delete el.dataset.visivel;
    };

    const apertar = () => {
      el.dataset.apertado = "";
    };
    const soltar = () => {
      delete el.dataset.apertado;
    };

    document.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerover", sobre, { passive: true });
    document.addEventListener("pointerout", fora, { passive: true });
    document.addEventListener("pointerdown", apertar, { passive: true });
    document.addEventListener("pointerup", soltar, { passive: true });
    window.addEventListener("blur", soltar);

    return () => {
      document.documentElement.classList.remove("cursor-proprio");
      document.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerover", sobre);
      document.removeEventListener("pointerout", fora);
      document.removeEventListener("pointerdown", apertar);
      document.removeEventListener("pointerup", soltar);
      window.removeEventListener("blur", soltar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div ref={raiz} aria-hidden className="cursor-cs" data-estado="">
      <div ref={anel} className="cursor-cs-anel">
        <span className="cursor-cs-anel-forma">
          <span ref={rotulo} className="cursor-cs-rotulo" />
        </span>
      </div>
      <div ref={ponto} className="cursor-cs-ponto">
        <span className="cursor-cs-ponto-forma" />
      </div>
    </div>
  );
}
