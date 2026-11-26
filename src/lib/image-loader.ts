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
  // O "-sm" tem 640 px no lado MAIOR: numa foto em pé, só 357 de
  // largura. Por isso ele só atende miniatura (até 384 px). Até 828 px
  // (o celular de tela densa) vai a média, de 680 de largura; acima, a
  // grande. Antes o "-sm" ia até 768 e a foto em pé saía borrada no
  // celular, esticada ao dobro.
  return urlDaMidia(src, {
    tamanho: width <= 384 ? "sm" : width <= 828 ? "md" : "grande",
  });
}
