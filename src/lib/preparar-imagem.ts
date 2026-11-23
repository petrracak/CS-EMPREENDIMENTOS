"use client";

/**
 * Prepara a foto no navegador, antes de subir.
 *
 * Toda imagem vira WebP aqui, seja qual for o formato que a pessoa
 * escolheu (JPG, PNG, HEIC do iPhone, WebP). Ninguém da CS precisa saber
 * converter nem reduzir foto: o painel faz isso sozinho.
 *
 * O trabalho acontece no navegador, e não no servidor, por dois motivos:
 * a foto de celular da obra costuma ter 8 MB e subiria inteira só para
 * ser reduzida do outro lado, e processar imagem no servidor exigiria a
 * biblioteca nativa (sharp), que é a parte mais frágil de um deploy.
 *
 * Saem duas versões, do mesmo jeito que o resto do site espera:
 *   grande   até 1600 px (ou o limite pedido) — página e galeria
 *   pequena  até  640 px                      — cards e listagens
 *
 * WebP guarda transparência, então a logo em PNG continua sem fundo.
 */

const LIMITE_GRANDE = 1600;
const LIMITE_PEQUENA = 640;
const QUALIDADE = 0.82;

export type ImagemPronta = {
  grande: Blob;
  pequena: Blob;
  largura: number;
  altura: number;
  /** Tamanho do arquivo escolhido, para mostrar quanto a conversão poupou. */
  bytesOriginal: number;
};

export async function prepararImagem(
  arquivo: File,
  { limite = LIMITE_GRANDE }: { limite?: number } = {},
): Promise<ImagemPronta> {
  const fonte = await decodificar(arquivo);

  try {
    const grande = await desenhar(fonte.imagem, fonte.largura, fonte.altura, limite);
    const pequena = await desenhar(fonte.imagem, fonte.largura, fonte.altura, LIMITE_PEQUENA);
    return {
      grande,
      pequena,
      largura: fonte.largura,
      altura: fonte.altura,
      bytesOriginal: arquivo.size,
    };
  } finally {
    fonte.liberar();
  }
}

type Fonte = {
  imagem: CanvasImageSource;
  largura: number;
  altura: number;
  liberar: () => void;
};

/**
 * Lê o arquivo. createImageBitmap é o caminho rápido; quando o navegador
 * não o aceita para aquele formato (HEIC no Safari, por exemplo), a
 * leitura cai para um <img>, que entende tudo o que o navegador exibe.
 */
async function decodificar(arquivo: File): Promise<Fonte> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    return {
      imagem: bitmap,
      largura: bitmap.width,
      altura: bitmap.height,
      liberar: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(arquivo);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return {
        imagem: img,
        largura: img.naturalWidth,
        altura: img.naturalHeight,
        liberar: () => URL.revokeObjectURL(url),
      };
    } catch (erro) {
      URL.revokeObjectURL(url);
      throw erro;
    }
  }
}

async function desenhar(
  imagem: CanvasImageSource,
  larguraOriginal: number,
  alturaOriginal: number,
  limite: number,
): Promise<Blob> {
  const escala = Math.min(1, limite / Math.max(larguraOriginal, alturaOriginal));
  const largura = Math.round(larguraOriginal * escala);
  const altura = Math.round(alturaOriginal * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;

  const ctx = tela.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imagem, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, "image/webp", QUALIDADE),
  );
  // Navegador antigo que não gera WebP devolve PNG sem avisar. Melhor
  // parar aqui do que gravar um PNG com extensão .webp.
  if (!blob || blob.type !== "image/webp") {
    throw new Error("Este navegador não converte para WebP. Use o Chrome, o Safari ou o Edge atualizados.");
  }
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

/** 6815744 -> "6,5 MB" */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}
