"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Foto = { id: string; url: string; legenda: string | null };

/**
 * Galeria com visor em tela cheia.
 *
 * A primeira foto ocupa duas colunas: sem isso a grade de fotos de obra
 * fica com cara de pasta de arquivos. O visor abre no clique e responde
 * às setas e ao Esc, porque quem está olhando foto de imóvel navega pelo
 * teclado sem pensar.
 */
export function Galeria({ fotos }: { fotos: Foto[] }) {
  const [aberta, setAberta] = useState<number | null>(null);

  const fechar = useCallback(() => setAberta(null), []);
  const anterior = useCallback(
    () => setAberta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length],
  );
  const proxima = useCallback(
    () => setAberta((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length],
  );

  useEffect(() => {
    if (aberta === null) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberta, fechar, anterior, proxima]);

  if (!fotos.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setAberta(i)}
            data-revelar
            style={{ "--atraso": `${(i % 3) * 80}ms` } as React.CSSProperties}
            className={cn(
              "group relative overflow-hidden rounded-xl bg-[var(--bg-fundo)]",
              i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/3]",
            )}
          >
            <Image
              src={foto.url}
              alt={foto.legenda ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-saida)] group-hover:scale-[1.05]"
            />
            {foto.legenda ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {foto.legenda}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {aberta !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-verde-950)]/96 backdrop-blur-sm"
          onClick={fechar}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="rounded-full p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fotos[aberta].url}
              alt={fotos[aberta].legenda ?? ""}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div
            className="flex items-center justify-between gap-4 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={anterior}
              aria-label="Foto anterior"
              className="rounded-full border border-white/15 p-3 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <p className="flex-1 text-center text-sm text-white/70">
              {fotos[aberta].legenda}
              <span className="tabular ml-3 text-white/40">
                {aberta + 1} / {fotos.length}
              </span>
            </p>

            <button
              type="button"
              onClick={proxima}
              aria-label="Próxima foto"
              className="rounded-full border border-white/15 p-3 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
