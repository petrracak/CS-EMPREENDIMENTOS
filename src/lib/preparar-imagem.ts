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
 * Saem três versões, do jeito que o site espera (ver lib/midia.ts):
 *   grande   até 1600 px (ou o limite pedido) — computador
 *   média    680 px de largura                — celular
 *   pequena  até  640 px                      — miniaturas
 *
 * WebP guarda transparência, então a logo em PNG continua sem fundo.
 */

const LIMITE_GRANDE = 1600;
const LIMITE_PEQUENA = 640;
const QUALIDADE = 0.82;

export type ImagemPronta = {
  grande: Blob;
  media: Blob;
  pequena: Blob;
  largura: number;
  altura: number;
  /** Tamanho do arquivo escolhido, para mostrar quanto a conversão poupou. */
  bytesOriginal: number;
};

export async function prepararImagem(
  arquivo: File,
  {
    limite = LIMITE_GRANDE,
    aparar = false,
  }: {
    limite?: number;
    /**
     * Corta a borda transparente em volta do desenho. Para logo: o PNG
     * costuma vir com muito vazio em volta, e no site o desenho encolhia
     * para caber o vazio junto.
     */
    aparar?: boolean;
  } = {},
): Promise<ImagemPronta> {
  const fonte = await decodificar(arquivo);

  try {
    const recorte: Recorte = (aparar && areaDoDesenho(fonte)) || {
      x: 0,
      y: 0,
      largura: fonte.largura,
      altura: fonte.altura,
    };
    const grande = await desenhar(fonte.imagem, recorte, limite);
    const pequena = await desenhar(fonte.imagem, recorte, LIMITE_PEQUENA);
    // Média: 760 px de largura (ou menos, se a foto for mais estreita).
    const media = await desenhar(
      fonte.imagem,
      recorte,
      Math.min(
        limite,
        Math.round(
          (760 * Math.max(recorte.largura, recorte.altura)) / recorte.largura,
        ),
      ),
    );
    return {
      grande,
      media,
      pequena,
      largura: recorte.largura,
      altura: recorte.altura,
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

type Recorte = { x: number; y: number; largura: number; altura: number };

/**
 * A caixa em volta do que não é transparente, com uma folga de 2%. Lê
 * uma cópia reduzida (até 800 px), que basta para achar a borda. Sem
 * transparência, ou se o desenho já ocupa quase tudo, devolve null.
 */
function areaDoDesenho(fonte: Fonte): Recorte | null {
  const escala = Math.min(1, 800 / Math.max(fonte.largura, fonte.altura));
  const l = Math.max(1, Math.round(fonte.largura * escala));
  const a = Math.max(1, Math.round(fonte.altura * escala));
  const tela = document.createElement("canvas");
  tela.width = l;
  tela.height = a;
  const ctx = tela.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(fonte.imagem, 0, 0, l, a);
  const { data } = ctx.getImageData(0, 0, l, a);

  let x0 = l;
  let y0 = a;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < a; y++) {
    for (let x = 0; x < l; x++) {
      if (data[(y * l + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  if (x1 - x0 + 1 > l * 0.96 && y1 - y0 + 1 > a * 0.96) return null;

  const folga = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  const xa = Math.max(0, x0 - folga);
  const ya = Math.max(0, y0 - folga);
  const xb = Math.min(l, x1 + 1 + folga);
  const yb = Math.min(a, y1 + 1 + folga);
  return {
    x: Math.floor(xa / escala),
    y: Math.floor(ya / escala),
    largura: Math.min(fonte.largura, Math.ceil((xb - xa) / escala)),
    altura: Math.min(fonte.altura, Math.ceil((yb - ya) / escala)),
  };
}

async function desenhar(
  imagem: CanvasImageSource,
  recorte: Recorte,
  limite: number,
  qualidade = QUALIDADE,
): Promise<Blob> {
  const escala = Math.min(
    1,
    limite / Math.max(recorte.largura, recorte.altura),
  );
  const largura = Math.round(recorte.largura * escala);
  const altura = Math.round(recorte.altura * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;

  const ctx = tela.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    imagem,
    recorte.x,
    recorte.y,
    recorte.largura,
    recorte.altura,
    0,
    0,
    largura,
    altura,
  );

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, "image/webp", qualidade),
  );
  // Navegador antigo que não gera WebP devolve PNG sem avisar. Melhor
  // parar aqui do que gravar um PNG com extensão .webp.
  if (!blob || blob.type !== "image/webp") {
    throw new Error(
      "Este navegador não converte para WebP. Use o Chrome, o Safari ou o Edge atualizados.",
    );
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
