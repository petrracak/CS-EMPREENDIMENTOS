"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { NOME_DO_SERVICO, type VideoPronto } from "@/lib/videos";

/**
 * Os vídeos da ficha. Cada um aparece primeiro como uma capa leve (a
 * miniatura do YouTube, a capa gerada no envio ou um cartão com o nome do
 * serviço) e só vira player no toque. Assim a página não baixa o
 * JavaScript do YouTube, do Instagram ou do TikTok para quem não assiste.
 *
 * Os deitados ficam numa grade; os em pé (Shorts, Reels, TikTok), numa
 * faixa que rola para o lado.
 */
export function VideosEmpreendimento({ videos }: { videos: VideoPronto[] }) {
  const deitados = videos.filter((v) => !v.vertical);
  const empe = videos.filter((v) => v.vertical);

  return (
    <div className="space-y-8">
      {deitados.length ? (
        <ul
          className={cn("grid gap-5", deitados.length > 1 && "md:grid-cols-2")}
        >
          {deitados.map((v) => (
            <li key={v.id}>
              <Cartao video={v} />
            </li>
          ))}
        </ul>
      ) : null}

      {empe.length ? (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {empe.map((v) => (
            <li key={v.id} className="w-[min(72vw,17rem)] shrink-0 snap-start">
              <Cartao video={v} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Cartao({ video }: { video: VideoPronto }) {
  const [tocando, setTocando] = useState(false);
  const nome =
    video.titulo || `${NOME_DO_SERVICO[video.tipo]} do empreendimento`;

  return (
    <figure>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-[#01331d]",
          video.vertical ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        {tocando ? (
          video.tipo === "arquivo" ? (
            <video
              src={video.player}
              poster={video.miniatura ?? undefined}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          ) : (
            <iframe
              src={video.player}
              title={nome}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            aria-label={`Assistir: ${nome}`}
            className="group absolute inset-0 grid place-items-center"
          >
            {video.miniatura ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.miniatura}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.04]"
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(243_214_148/0.22),transparent_55%),linear-gradient(160deg,#00552f,#01261a)]"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#004527] shadow-[0_12px_30px_-8px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:scale-110">
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </span>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur">
              {NOME_DO_SERVICO[video.tipo]}
            </span>
          </button>
        )}
      </div>
      {video.titulo ? (
        <figcaption className="mt-3 text-sm text-[var(--fg-suave)]">
          {video.titulo}
        </figcaption>
      ) : null}
    </figure>
  );
}
