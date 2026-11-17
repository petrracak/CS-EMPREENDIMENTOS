"use client";

/**
 * Prepara a foto no navegador, antes de subir.
 *
 * O redimensionamento acontece aqui, e não no servidor, por dois motivos:
 * a foto de celular da obra costuma ter 8 MB e subiria inteira só para ser
 * reduzida do outro lado, e processar imagem no servidor exigiria a
 * biblioteca nativa (sharp), que é a parte mais frágil de um deploy.
 *
 * Saem duas versões, do mesmo jeito que o resto do site espera:
 *   grande   até 1600 px  — ficha e galeria
 *   pequena  até  640 px  — cards e listagens
 */

const LIMITE_GRANDE = 1600;
const LIMITE_PEQUENA = 640;
const QUALIDADE = 0.82;

export type ImagemPronta = {
  grande: Blob;
  pequena: Blob;
  largura: number;
  altura: number;
};

export async function prepararImagem(arquivo: File): Promise<ImagemPronta> {
  const bitmap = await createImageBitmap(arquivo);

  try {
    const grande = await desenhar(bitmap, LIMITE_GRANDE);
    const pequena = await desenhar(bitmap, LIMITE_PEQUENA);
    return {
      grande,
      pequena,
      largura: bitmap.width,
      altura: bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}

async function desenhar(
  bitmap: ImageBitmap,
  limite: number,
): Promise<Blob> {
  const escala = Math.min(1, limite / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;

  const ctx = tela.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, "image/webp", QUALIDADE),
  );
  if (!blob) throw new Error("Não foi possível converter a imagem.");
  return blob;
}

/** Nome de arquivo seguro, sem acento nem espaço, com carimbo de tempo. */
export function nomeDeArquivo(original: string): string {
  const base = original
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "foto"}-${Date.now().toString(36)}`;
}
