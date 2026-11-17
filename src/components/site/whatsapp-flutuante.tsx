"use client";

import { useEffect, useState } from "react";

import { Whatsapp } from "@/components/icones-sociais";

import { cn } from "@/lib/utils";

/**
 * Botão flutuante do WhatsApp.
 *
 * Só aparece depois que a pessoa rola um pouco: em cima da primeira
 * dobra ele brigaria com os botões do topo, que levam ao mesmo lugar.
 * No celular fica redondo; a partir de sm abre com o texto.
 */
export function WhatsappFlutuante({
  link,
  texto,
}: {
  link: string;
  texto: string;
}) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 600);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed right-5 bottom-5 z-40 inline-flex items-center gap-2.5",
        "rounded-full bg-[var(--color-verde-800)] px-4 py-4 sm:px-5",
        "text-sm font-medium text-white shadow-[var(--sombra-alta)]",
        "transition-all duration-500 [transition-timing-function:var(--ease-saida)]",
        "hover:bg-[var(--color-verde-600)] hover:shadow-[0_16px_40px_rgb(1_38_22/0.3)]",
        "hover:-translate-y-0.5",
        visivel
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Whatsapp className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline">{texto}</span>
      <span className="sr-only sm:hidden">{texto}</span>
    </a>
  );
}
