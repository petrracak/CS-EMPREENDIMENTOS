"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * O "?" ao lado de um rótulo, com a explicação num balão.
 *
 * No computador o balão abre com o cursor por cima; no celular, com um
 * toque, e fecha com outro toque fora, com Esc ou ao rolar. A explicação
 * fica fora do fluxo do formulário: um campo com texto de apoio e outro
 * sem deixavam as colunas desalinhadas.
 *
 * O balão é desenhado no <body>, com posição fixa calculada a partir do
 * ícone e presa às bordas da tela. Dentro do cartão ele seria cortado
 * por qualquer overflow e, perto da borda do celular, sairia da tela.
 */
export function Dica({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const [aberta, setAberta] = useState(false);
  const [fixa, setFixa] = useState(false);
  const [pos, setPos] = useState<{
    x: number;
    y: number;
    seta: number;
    abaixo: boolean;
  } | null>(null);

  const posicionar = useCallback(() => {
    const el = botao.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const largura = Math.min(280, window.innerWidth - 32);
    const centro = r.left + r.width / 2;
    const x = Math.max(16, Math.min(centro - largura / 2, window.innerWidth - 16 - largura));
    // Abaixo quando não há espaço em cima (o rótulo no topo da tela).
    const abaixo = r.top < 140;
    setPos({
      x,
      y: abaixo ? r.bottom + 10 : r.top - 10,
      seta: centro - x,
      abaixo,
    });
  }, []);

  const abrir = useCallback(() => {
    posicionar();
    setAberta(true);
  }, [posicionar]);

  const fechar = useCallback(() => {
    setAberta(false);
    setFixa(false);
  }, []);

  useEffect(() => {
    if (!aberta) return;
    const fora = (e: PointerEvent) => {
      if (!botao.current?.contains(e.target as Node)) fechar();
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", tecla);
    window.addEventListener("scroll", fechar, { passive: true, capture: true });
    window.addEventListener("resize", fechar);
    return () => {
      window.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", fechar, { capture: true });
      window.removeEventListener("resize", fechar);
    };
  }, [aberta, fechar]);

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label="O que é isto?"
        aria-describedby={aberta ? id : undefined}
        aria-expanded={aberta}
        onClick={() => {
          if (fixa) fechar();
          else {
            setFixa(true);
            abrir();
          }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") abrir();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse" && !fixa) setAberta(false);
        }}
        onFocus={abrir}
        onBlur={() => !fixa && setAberta(false)}
        className={cn(
          // A área de toque é maior que o desenho: 28 px num ícone de 16,
          // e o ::after estende o toque até 44 px sem empurrar o rótulo.
          "relative -m-1.5 grid h-7 w-7 after:absolute after:-inset-2 after:content-[''] shrink-0 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors duration-200 hover:text-[var(--color-verde-800)] focus-visible:outline-none",
          aberta && "text-[var(--color-verde-800)]",
          className,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "grid h-4 w-4 place-items-center rounded-full border text-[0.625rem] leading-none font-semibold transition-colors duration-200",
            aberta
              ? "border-[var(--color-verde-800)] bg-[var(--color-verde-800)] text-white"
              : "border-current",
          )}
        >
          ?
        </span>
      </button>

      {aberta && pos
        ? createPortal(
            <div
              id={id}
              role="tooltip"
              style={{
                left: pos.x,
                top: pos.y,
                width: Math.min(280, window.innerWidth - 32),
              }}
              className={cn(
                "dica-balao pointer-events-none fixed z-[70] rounded-xl bg-[var(--color-verde-950)] px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-white/90 shadow-[0_12px_32px_-8px_rgb(1_38_22/0.5)]",
                pos.abaixo ? "" : "-translate-y-full",
              )}
              data-abaixo={pos.abaixo || undefined}
            >
              {children}
              <span
                aria-hidden
                style={{ left: pos.seta }}
                className={cn(
                  "absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[var(--color-verde-950)]",
                  pos.abaixo ? "-top-1" : "-bottom-1",
                )}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
