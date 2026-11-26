"use client";

// Molduras de aparelho em CSS puro (devices.css). Só as telas que usam
// carregam.
import "./aparelhos.css";

import Image from "next/image";
import { ImageUp, Laptop, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Dica } from "@/components/admin/dica";
import {
  RecadosDoEnvio,
  SeletorDeArquivo,
  useEnvioDeImagem,
} from "@/components/admin/enviar-imagem";
import { cn } from "@/lib/utils";

/**
 * As peças da prévia em aparelhos: a moldura do MacBook e do iPhone, o
 * palco que reduz a cena para caber no painel, e a vaga de envio de uma
 * arte com a medida ideal ao lado.
 */

export function Moldura({
  aparelho,
  children,
}: {
  aparelho: "macbook-pro" | "iphone-14-pro";
  children: React.ReactNode;
}) {
  return (
    <div aria-hidden className={`device device-${aparelho} device-spacegray`}>
      <div className="device-frame">
        <div className="device-screen overflow-hidden">{children}</div>
      </div>
      <div className="device-stripe" />
      <div className="device-header" />
      <div className="device-sensors" />
      <div className="device-btns" />
      <div className="device-power" />
      <div className="device-home" />
    </div>
  );
}

/* ---------------------------------------------------------------- palco */

/**
 * A cena tem 1000 × 580 px e é reduzida para a largura disponível. Com o
 * cursor por cima, inclina de leve na direção dele: o bastante para os
 * aparelhos ganharem volume, sem virar brinquedo.
 */
export function Palco({ children }: { children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.6);
  const [giro, setGiro] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / 1000);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={caixa}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        const r = e.currentTarget.getBoundingClientRect();
        setGiro({
          x: ((e.clientY - r.top) / r.height - 0.5) * -5,
          y: ((e.clientX - r.left) / r.width - 0.5) * 7,
        });
      }}
      onPointerLeave={() => setGiro({ x: 0, y: 0 })}
      className="palco-aparelhos relative w-full overflow-hidden rounded-2xl"
      style={{ height: 580 * escala, perspective: 1600 }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: 1000, height: 580, transform: `scale(${escala})` }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 [transition-timing-function:var(--ease-lento)]"
          style={{
            transform: `translate(40px, 0px) rotateX(${giro.x}deg) rotateY(${giro.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- vaga de envio */

export function Vaga({
  titulo,
  Icone,
  formato,
  medida,
  dica,
  envio,
  proporcao,
  observacao,
}: {
  titulo: string;
  Icone: typeof Laptop;
  formato: string;
  medida: string;
  dica: string;
  envio: ReturnType<typeof useEnvioDeImagem>;
  proporcao: string;
  observacao?: string;
}) {
  const { caminho, enviando } = envio;

  return (
    <div className="min-w-0">
      <SeletorDeArquivo aoEscolher={envio.enviar} desativado={enviando}>
        {(abrir, arrastando) => (
          <div
            className={cn(
              "flex h-full items-stretch gap-4 rounded-2xl border bg-[var(--bg-elevado)] p-3 transition-[border-color,box-shadow] duration-200",
              arrastando
                ? "border-[var(--color-verde-700)] shadow-[0_0_0_4px_rgb(0_69_39/0.1)]"
                : "border-[var(--borda)]",
            )}
          >
            {/* miniatura, na proporção do aparelho */}
            <button
              type="button"
              onClick={abrir}
              disabled={enviando}
              aria-label={
                caminho
                  ? `Trocar a foto do ${titulo.toLowerCase()}`
                  : `Escolher a foto do ${titulo.toLowerCase()}`
              }
              className="xadrez relative grid w-24 shrink-0 place-items-center self-center overflow-hidden rounded-xl border border-[var(--borda)] sm:w-28"
              style={{ aspectRatio: proporcao, maxHeight: "8.5rem" }}
            >
              {caminho ? (
                <Image
                  src={caminho}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <ImageUp
                  className="h-5 w-5 text-[var(--fg-tenue)]"
                  strokeWidth={1.7}
                />
              )}
              {enviando ? (
                <span className="absolute inset-0 grid place-items-center bg-[var(--color-verde-950)]/55">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </span>
              ) : null}
            </button>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icone
                    className="h-4 w-4 text-[var(--color-verde-800)]"
                    strokeWidth={1.8}
                  />
                  <span className="text-sm font-medium">{titulo}</span>
                  <Dica>{dica}</Dica>
                </div>
                <p className="mt-1 text-xs text-[var(--fg-tenue)]">{formato}</p>
                <p className="tabular mt-0.5 text-xs text-[var(--fg-tenue)]">
                  <span className="mr-1 rounded-md bg-[var(--bg-fundo)] px-1.5 py-0.5 font-medium text-[var(--fg-suave)]">
                    Ideal
                  </span>
                  {medida}
                </p>
                {observacao ? (
                  <p className="mt-1.5 text-xs text-[var(--color-ouro-700)]">
                    {observacao}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={abrir}
                  disabled={enviando}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] px-4 text-sm font-medium transition-colors hover:border-[var(--borda-forte)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  {enviando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : caminho ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <ImageUp className="h-4 w-4" />
                  )}
                  {enviando ? "Enviando…" : caminho ? "Trocar" : "Escolher"}
                </button>
                {caminho ? (
                  <button
                    type="button"
                    onClick={envio.remover}
                    disabled={enviando}
                    aria-label={`Remover a foto do ${titulo.toLowerCase()}`}
                    title="Remover"
                    className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--color-acento)]/10 hover:text-[var(--color-acento-forte)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </SeletorDeArquivo>
      <RecadosDoEnvio
        conversao={envio.conversao}
        aviso={envio.aviso}
        erro={envio.erro}
      />
    </div>
  );
}
