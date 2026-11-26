import { urlDaMidia } from "@/lib/midia";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Escolhe as fotos que passam dentro da logo, na primeira dobra.
 *
 * Ninguém escolhe à mão: a cada foto que a CS sobe no painel, a página
 * inicial é recalculada e a seleção é refeita. A regra é esta:
 *
 * 1. Só entram empreendimentos publicados, e as fotos de capa e de
 *    galeria (planta, mapa, logo e foto de obra ficam de fora).
 * 2. A foto precisa ter resolução boa (lado maior de 1200 px ou mais) e
 *    não pode ser panorâmica demais: a logo é estreita e alta, e uma foto
 *    deitada perderia quase tudo no corte.
 * 3. Entre as que passam, ganha a que aparece mais inteira dentro da logo
 *    (formato em pé, parecido com o dela) e a que a CS pôs antes: a capa
 *    primeiro, depois a ordem da galeria, que já é a escolha de quem
 *    cadastrou.
 * 4. Cada empreendimento leva a mesma cota, e as fotos se alternam entre
 *    eles, para o slide não passar três fotos seguidas do mesmo prédio.
 */

export type FotoVitrine = {
  grande: string;
  pequena: string;
  /** Largura da versão pequena, para o srcset. */
  larguraPequena: number;
  largura: number;
  altura: number;
  nome: string;
};

const LIMITE = 9;
const POR_EMPREENDIMENTO = 3;
/** Largura sobre altura da logo do Figma (453 × 840). */
const FORMATO_LOGO = 453 / 840.177;
/** Lado maior da versão pequena que o painel grava (ver preparar-imagem). */
const LADO_PEQUENA = 640;
const FORA = /obra|planta|mapa|localiza|implanta|logo/i;

type Linha = {
  nome: string;
  destaque: boolean;
  ordem: number;
  imagem_principal: string | null;
  imagens:
    | {
        url: string;
        legenda: string | null;
        categoria: string;
        ordem: number;
      }[]
    | null;
};

export async function fotosDaVitrine(): Promise<FotoVitrine[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select(
      "nome, destaque, ordem, imagem_principal, imagens:empreendimento_imagens (url, legenda, categoria, ordem)",
    )
    .eq("status", "publicado");

  const empreendimentos = ((data ?? []) as unknown as Linha[]).sort(
    (a, b) => Number(b.destaque) - Number(a.destaque) || a.ordem - b.ordem,
  );

  // Candidatas de cada empreendimento: a capa e as oito primeiras da
  // galeria, na ordem do painel. A posição entra na nota.
  const porEmpreendimento = await Promise.all(
    empreendimentos.map(async (e) => {
      const caminhos = [
        e.imagem_principal,
        ...[...(e.imagens ?? [])]
          .filter(
            (i) =>
              i.categoria === "galeria" &&
              !FORA.test(`${i.url} ${i.legenda ?? ""}`),
          )
          .sort((a, b) => a.ordem - b.ordem)
          .map((i) => i.url),
      ]
        .filter((c): c is string => Boolean(c))
        .filter((c, i, todos) => todos.indexOf(c) === i)
        .slice(0, 9);

      const medidas = await Promise.all(caminhos.map(medir));
      return caminhos
        .map((caminho, posicao) => {
          const m = medidas[posicao];
          const nota = m && notaDaFoto(m.largura, m.altura, posicao);
          return nota == null || !m
            ? null
            : { caminho, nota, ...m, nome: e.nome };
        })
        .filter((f) => f !== null)
        .sort((a, b) => b.nota - a.nota);
    }),
  );

  const comFoto = porEmpreendimento.filter((fotos) => fotos.length > 0);
  if (!comFoto.length) return [];
  const cota = Math.min(POR_EMPREENDIMENTO, Math.ceil(LIMITE / comFoto.length));

  // Uma de cada empreendimento por rodada.
  const escolhidas: FotoVitrine[] = [];
  for (let rodada = 0; rodada < cota; rodada++) {
    for (const fotos of comFoto) {
      const f = fotos[rodada];
      if (!f || escolhidas.length >= LIMITE) continue;
      const escala = Math.min(1, LADO_PEQUENA / Math.max(f.largura, f.altura));
      escolhidas.push({
        grande: urlDaMidia(f.caminho),
        pequena: urlDaMidia(f.caminho, { pequena: true }),
        larguraPequena: Math.round(f.largura * escala),
        largura: f.largura,
        altura: f.altura,
        nome: f.nome,
      });
    }
  }
  return escolhidas;
}

/** Nota de 0 a 1, ou null se a foto não serve para a logo. */
function notaDaFoto(largura: number, altura: number, posicao: number) {
  const formato = largura / altura;
  if (Math.max(largura, altura) < 1200 || Math.min(largura, altura) < 600)
    return null;
  if (formato > 1.75) return null;
  // Quanto da foto sobra depois do corte na logo: 1 é inteira.
  const inteira =
    Math.min(formato, FORMATO_LOGO) / Math.max(formato, FORMATO_LOGO);
  return inteira - posicao * 0.08;
}

/**
 * Lê largura e altura do cabeçalho do WebP, sem baixar a foto: os
 * primeiros 30 bytes bastam. Toda foto que passa pelo painel vira WebP
 * (preparar-imagem.ts); o que não for WebP fica de fora.
 */
async function medir(caminho: string) {
  if (
    !caminho.endsWith(".webp") ||
    caminho.startsWith("http") ||
    caminho.startsWith("/")
  ) {
    return null;
  }
  try {
    const resposta = await fetch(urlDaMidia(caminho), {
      headers: { Range: "bytes=0-31" },
      signal: AbortSignal.timeout(4000),
      // O arquivo de um caminho nunca muda (o nome leva a data do envio).
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!resposta.ok) return null;
    return tamanhoDoWebp(new Uint8Array(await resposta.arrayBuffer()));
  } catch {
    return null;
  }
}

function tamanhoDoWebp(b: Uint8Array) {
  const texto = (inicio: number, fim: number) =>
    String.fromCharCode(...b.slice(inicio, fim));
  if (b.length < 30 || texto(0, 4) !== "RIFF" || texto(8, 12) !== "WEBP")
    return null;
  const tipo = texto(12, 16);
  if (tipo === "VP8 ") {
    return {
      largura: (b[26] | (b[27] << 8)) & 0x3fff,
      altura: (b[28] | (b[29] << 8)) & 0x3fff,
    };
  }
  if (tipo === "VP8L") {
    return {
      largura: 1 + (((b[22] & 0x3f) << 8) | b[21]),
      altura:
        1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
    };
  }
  if (tipo === "VP8X") {
    return {
      largura: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
      altura: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
    };
  }
  return null;
}
