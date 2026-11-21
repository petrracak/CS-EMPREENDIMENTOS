"use client";

import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Seção que fica presa enquanto a próxima sobe por cima dela.
 *
 * Presa no topo não serve para seção mais alta que a tela: a pessoa
 * nunca veria o pé dela, porque a próxima cobriria antes. Então a seção
 * prende quando o PÉ dela encosta no pé da tela — `top` negativo, igual
 * à altura que sobra. A conta depende da altura, que muda com a largura
 * da janela e com as fotos carregando; daí o ResizeObserver.
 *
 * Enquanto não mede, a seção rola normal (o sticky só vale com
 * data-pronto). Se o JS não carregar, a página é só uma página.
 */
export function Empilhada({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ajustar = () => {
      const sobra = window.innerHeight - el.offsetHeight;
      el.style.top = `${Math.min(0, sobra)}px`;
      el.setAttribute("data-pronto", "");
    };

    ajustar();
    const observador = new ResizeObserver(ajustar);
    observador.observe(el);
    window.addEventListener("resize", ajustar);

    return () => {
      observador.disconnect();
      window.removeEventListener("resize", ajustar);
    };
  }, []);

  return (
    <div ref={ref} className={cn("empilhada", className)} {...props}>
      {children}
    </div>
  );
}
