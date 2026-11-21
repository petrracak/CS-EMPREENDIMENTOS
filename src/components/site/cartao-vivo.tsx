"use client";

import { useRef } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Cartão com uma luz que acompanha o cursor.
 *
 * É o efeito do Magic Card (magicui.design): a borda acende no ponto
 * mais perto do mouse, num degradê do laranja da logo para o dourado, e
 * um brilho suave segue a mão por dentro da foto. O desenho fica todo
 * no CSS (.cartao-vivo, em globals.css); aqui só se conta onde o cursor
 * está, em duas variáveis.
 *
 * A posição é atualizada no máximo uma vez por quadro. Mover o mouse
 * dispara dezenas de eventos por quadro, e escrever estilo em cada um
 * deles é o que deixa esse tipo de efeito travado.
 *
 * Em tela de toque não há cursor, então não há luz — o cartão continua
 * com o resto do hover, que é só CSS.
 */
export function CartaoVivo({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const quadro = useRef<number | null>(null);

  const mover = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType !== "mouse") return;
    const { clientX, clientY } = evento;
    if (quadro.current !== null) return;

    quadro.current = requestAnimationFrame(() => {
      quadro.current = null;
      const el = ref.current;
      if (!el) return;
      const caixa = el.getBoundingClientRect();
      el.style.setProperty("--x", `${clientX - caixa.left}px`);
      el.style.setProperty("--y", `${clientY - caixa.top}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={mover}
      className={cn("cartao-vivo", className)}
      {...props}
    >
      {children}
    </div>
  );
}
