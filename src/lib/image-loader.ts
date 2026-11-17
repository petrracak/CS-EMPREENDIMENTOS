"use client";

import { urlDaMidia } from "@/lib/midia";

/**
 * Carregador do next/image.
 *
 * As fotos já são guardadas prontas no Storage, em dois tamanhos, então
 * aqui é só escolher qual servir. Sem isto o otimizador da Vercel entraria
 * no caminho, e no plano free ele responde 402 quando a cota acaba — as
 * imagens somem do site sem aviso.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  return urlDaMidia(src, { pequena: width <= 768 });
}
