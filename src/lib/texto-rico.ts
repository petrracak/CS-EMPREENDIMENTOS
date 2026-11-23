/**
 * Títulos com formatação, como o painel grava e o site lê.
 *
 * O painel guarda um HTML mínimo: <strong>, <em>, <u> e <mark> (o
 * destaque em gradiente). O site nunca injeta esse HTML: ele é lido aqui,
 * peça por peça, e vira elementos React com texto puro. Qualquer outra
 * marcação é descartada, então um título não tem como levar script.
 *
 * O resultado é uma lista de palavras, e cada palavra uma lista de peças,
 * porque a animação do site anima palavra por palavra e uma palavra pode
 * ter só metade em destaque.
 */

export type Peca = {
  texto: string;
  negrito?: boolean;
  italico?: boolean;
  sublinhado?: boolean;
  destaque?: boolean;
};

export type Palavra = Peca[];

const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodificar(texto: string) {
  return texto.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (inteiro, nome: string) => {
    if (nome[0] === "#") {
      const n =
        nome[1] === "x" || nome[1] === "X"
          ? parseInt(nome.slice(2), 16)
          : parseInt(nome.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : inteiro;
    }
    return ENTIDADES[nome.toLowerCase()] ?? inteiro;
  });
}

const MARCAS: Record<string, keyof Omit<Peca, "texto">> = {
  strong: "negrito",
  b: "negrito",
  em: "italico",
  i: "italico",
  u: "sublinhado",
  mark: "destaque",
};

/** HTML do painel → peças de texto com a formatação de cada uma. */
export function lerPecas(entrada: string | null | undefined): Peca[] {
  const html = entrada ?? "";
  const pecas: Peca[] = [];
  const abertas: Record<string, number> = {};
  const marca = /<\s*(\/?)\s*([a-z0-9]+)[^>]*>/gi;
  let ultimo = 0;

  const empurrar = (bruto: string) => {
    if (!bruto) return;
    const peca: Peca = { texto: decodificar(bruto) };
    for (const [nome, quantas] of Object.entries(abertas))
      if (quantas > 0) peca[nome as keyof Omit<Peca, "texto">] = true;
    pecas.push(peca);
  };

  for (const achado of html.matchAll(marca)) {
    empurrar(html.slice(ultimo, achado.index));
    ultimo = achado.index + achado[0].length;

    const nome = achado[2].toLowerCase();
    if (nome === "br" || nome === "p") {
      // Quebra de linha e parágrafo viram espaço: título é uma frase só.
      empurrar(" ");
      continue;
    }
    const efeito = MARCAS[nome];
    if (!efeito) continue;
    abertas[efeito] = Math.max(0, (abertas[efeito] ?? 0) + (achado[1] ? -1 : 1));
  }
  empurrar(html.slice(ultimo));

  return pecas;
}

/** Peças → palavras. Espaço separa palavra; formatação, não. */
export function lerPalavras(html: string | null | undefined): Palavra[] {
  const palavras: Palavra[] = [];
  let atual: Palavra = [];

  for (const peca of lerPecas(html)) {
    for (const parte of peca.texto.split(/(\s+)/)) {
      if (!parte) continue;
      if (/^\s+$/.test(parte)) {
        if (atual.length) palavras.push(atual);
        atual = [];
      } else {
        atual.push({ ...peca, texto: parte });
      }
    }
  }
  if (atual.length) palavras.push(atual);

  return palavras;
}

/** Texto sem formatação, para o <title>, o alt e afins. */
export function textoPuro(html: string) {
  return lerPalavras(html)
    .map((palavra) => palavra.map((p) => p.texto).join(""))
    .join(" ");
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Lê um título de um bloco do site.
 *
 * Antes o título vinha em três campos (começo, destaque, fim). Enquanto o
 * bloco não for salvo de novo pelo painel, monta o título novo a partir
 * deles, para nada mudar no site.
 */
export function lerTitulo(
  bloco: Record<string, unknown> | undefined,
  campo = "titulo",
  padrao = "",
): string {
  const valor = bloco?.[campo];
  if (typeof valor === "string" && valor.trim()) return valor;

  const parte = (nome: string) => {
    const v = bloco?.[nome];
    return typeof v === "string" ? v.trim() : "";
  };
  const antes = parte(`${campo}_antes`);
  const destaque = parte(`${campo}_destaque`);
  const depois = parte(`${campo}_depois`);
  if (!antes && !destaque && !depois) return padrao;

  return [
    escapar(antes),
    destaque ? `<mark>${escapar(destaque)}</mark>` : "",
    escapar(depois),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * A mensagem da faixa de campanha.
 *
 * Antes eram dois campos: um começo em negrito dourado e o resto do
 * texto. Até o bloco ser salvo de novo, o começo vira negrito com
 * destaque, que é como ele já aparecia.
 */
export function lerMensagemDaFaixa(
  bloco: Record<string, unknown> | undefined,
): string {
  const valor = bloco?.mensagem;
  if (typeof valor === "string" && valor.trim()) return valor;

  const parte = (nome: string) => {
    const v = bloco?.[nome];
    return typeof v === "string" ? v.trim() : "";
  };
  const forte = parte("texto_forte");
  const texto = parte("texto");
  return [
    forte ? `<mark><strong>${escapar(forte)}</strong></mark>` : "",
    escapar(texto),
  ]
    .filter(Boolean)
    .join(" ");
}
