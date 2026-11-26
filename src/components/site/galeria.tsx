"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Foto = { id: string; url: string; legenda: string | null };

/**
 * Carrossel de fotos, com visor em tela cheia.
 *
 * Um slide grande por vez, com a ponta do próximo aparecendo ao lado,
 * para a pessoa entender que dá para passar. Passa com o dedo (é uma
 * faixa com rolagem e encaixe, sem biblioteca), com as setas ou com o
 * teclado. O clique abre a foto inteira no visor.
 *
 * Em "planta", a imagem aparece inteira sobre fundo branco, sem corte:
 * planta cortada não serve para nada.
 */
export function Galeria({
  fotos,
  tipo = "foto",
  escuro = false,
}: {
  fotos: Foto[];
  tipo?: "foto" | "planta";
  /** Sobre fundo verde: setas e legenda claras. */
  escuro?: boolean;
}) {
  const faixa = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const planta = tipo === "planta";

  // Qual slide está mais à esquerda, para o contador e as setas.
  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    const medir = () => {
      const filhos = Array.from(el.children) as HTMLElement[];
      const base = el.getBoundingClientRect().left;
      let melhor = 0;
      let menor = Infinity;
      filhos.forEach((f, i) => {
        const d = Math.abs(f.getBoundingClientRect().left - base);
        if (d < menor) {
          menor = d;
          melhor = i;
        }
      });
      setAtual(melhor);
    };
    el.addEventListener("scroll", medir, { passive: true });
    return () => el.removeEventListener("scroll", medir);
  }, []);

  const irPara = useCallback((i: number) => {
    const el = faixa.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (!el || !alvo) return;
    el.scrollTo({
      left: alvo.offsetLeft - el.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  if (!fotos.length) return null;

  return (
    <>
      <div className="relative">
        <div
          ref={faixa}
          className="galeria-faixa flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((foto, i) => (
            <figure
              key={foto.id}
              className={cn(
                "w-[86%] shrink-0 snap-start sm:w-[72%] lg:w-[64%]",
                fotos.length === 1 && "w-full sm:w-full lg:w-full",
              )}
            >
              <button
                type="button"
                onClick={() => setAberta(i)}
                aria-label={`Ampliar ${foto.legenda ?? `imagem ${i + 1}`}`}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-2xl",
                  planta
                    ? "aspect-[4/3] bg-white"
                    : "aspect-[4/3] bg-[var(--bg-fundo)] sm:aspect-[16/10]",
                )}
              >
                <Image
                  src={foto.url}
                  alt={foto.legenda ?? ""}
                  fill
                  sizes="(max-width: 640px) 86vw, (max-width: 1024px) 72vw, 760px"
                  className={cn(
                    "transition-transform duration-[1600ms] [transition-timing-function:var(--ease-lento)]",
                    planta
                      ? "object-contain p-4 sm:p-6"
                      : "object-cover group-hover:scale-[1.04]",
                  )}
                />
                <span className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#004527] opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="h-4 w-4" />
                </span>
              </button>
              {foto.legenda ? (
                <figcaption
                  className={cn(
                    "mt-3 text-sm",
                    escuro ? "text-white/75" : "text-[var(--fg-suave)]",
                  )}
                >
                  {foto.legenda}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>

        {fotos.length > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p
              className={cn(
                "tabular text-sm",
                escuro ? "text-white/60" : "text-[var(--fg-tenue)]",
              )}
            >
              {atual + 1} / {fotos.length}
            </p>
            <div className="flex gap-2">
              <Seta
                lado="esquerda"
                escuro={escuro}
                desativada={atual === 0}
                aoTocar={() => irPara(Math.max(0, atual - 1))}
              />
              <Seta
                lado="direita"
                escuro={escuro}
                desativada={atual >= fotos.length - 1}
                aoTocar={() => irPara(Math.min(fotos.length - 1, atual + 1))}
              />
            </div>
          </div>
        ) : null}
      </div>

      {aberta !== null ? (
        <Visor
          fotos={fotos}
          inicial={aberta}
          planta={planta}
          aoFechar={() => setAberta(null)}
        />
      ) : null}
    </>
  );
}

function Seta({
  lado,
  escuro,
  desativada,
  aoTocar,
}: {
  lado: "esquerda" | "direita";
  escuro: boolean;
  desativada: boolean;
  aoTocar: () => void;
}) {
  const Icone = lado === "esquerda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={aoTocar}
      disabled={desativada}
      aria-label={lado === "esquerda" ? "Anterior" : "Próxima"}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full border transition-colors disabled:opacity-30",
        escuro
          ? "border-white/25 text-white hover:border-white/60 hover:bg-white/10"
          : "border-[var(--borda)] text-[#28513f] hover:border-[#00ab61] hover:bg-white",
      )}
    >
      <Icone className="h-5 w-5" />
    </button>
  );
}

/** A foto inteira, em tela cheia. Setas e Esc no teclado. */
function Visor({
  fotos,
  inicial,
  planta,
  aoFechar,
}: {
  fotos: Foto[];
  inicial: number;
  planta: boolean;
  aoFechar: () => void;
}) {
  const [i, setI] = useState(inicial);
  const anterior = useCallback(
    () => setI((n) => (n - 1 + fotos.length) % fotos.length),
    [fotos.length],
  );
  const proxima = useCallback(
    () => setI((n) => (n + 1) % fotos.length),
    [fotos.length],
  );

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    document.addEventListener("keydown", aoTeclar);
    const antes = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.documentElement.style.overflow = antes;
    };
  }, [aoFechar, anterior, proxima]);

  const foto = fotos[i];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Imagem ampliada"
      className="fixed inset-0 z-[60] flex flex-col bg-[#01261a]/96 backdrop-blur-sm"
      onClick={aoFechar}
    >
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "relative mx-4 flex-1 sm:mx-10",
          planta && "rounded-2xl bg-white",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={foto.url}
          alt={foto.legenda ?? ""}
          fill
          sizes="100vw"
          className={cn("object-contain", planta && "p-4")}
        />
      </div>

      <div
        className="flex items-center justify-between gap-4 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={anterior}
          aria-label="Anterior"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="flex-1 text-center text-sm text-white/75">
          {foto.legenda}
          <span className="tabular ml-3 text-white/45">
            {i + 1} / {fotos.length}
          </span>
        </p>
        <button
          type="button"
          onClick={proxima}
          aria-label="Próxima"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white/50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
