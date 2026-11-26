/**
 * O conteúdo de uma publicação do blog, como o painel grava e o site lê.
 *
 * O editor do painel (components/admin/editor-conteudo.tsx) grava HTML:
 * parágrafos, títulos (h2) e subtítulos (h3), negrito, itálico,
 * sublinhado, listas, citação, link, imagem e linha divisória. O site
 * nunca injeta esse HTML: ele é lido aqui, marca por marca, e vira uma
 * árvore só com o que está na lista abaixo. Qualquer outra marcação é
 * descartada (o texto dela fica), e link e imagem só passam com endereço
 * seguro. Assim uma publicação não tem como levar script.
 *
 * As publicações antigas foram escritas num Markdown reduzido (## para
 * subtítulo, - para lista, **negrito**). markdownParaHtml converte, e o
 * editor e o site passam a ver as duas do mesmo jeito.
 */

export type No =
  | { tipo: "texto"; texto: string }
  | {
      tipo: "elemento";
      tag: Tag;
      href?: string;
      src?: string;
      alt?: string;
      filhos: No[];
    };

const TAGS = [
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "br",
  "img",
] as const;
export type Tag = (typeof TAGS)[number];

const APELIDOS: Record<string, Tag> = {
  b: "strong",
  i: "em",
  h1: "h2",
  h4: "h3",
};
const VAZIAS = new Set(["hr", "br", "img"]);

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

function atributo(bruto: string, nome: string) {
  const achado = new RegExp(
    `\\b${nome}\\s*=\\s*("([^"]*)"|'([^']*)')`,
    "i",
  ).exec(bruto);
  return achado ? decodificar(achado[2] ?? achado[3] ?? "").trim() : undefined;
}

/** Link: página do site, âncora, http(s), e-mail ou telefone. */
function linkSeguro(url: string | undefined) {
  if (!url) return undefined;
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url) ? url : undefined;
}

/** Imagem: só https ou arquivo do próprio site. */
function imagemSegura(url: string | undefined) {
  if (!url) return undefined;
  return /^(https:\/\/|\/(?!\/))/i.test(url) ? url : undefined;
}

export function ehHtml(conteudo: string) {
  return /<(p|h[1-4]|ul|ol|blockquote|img|hr)[\s>/]/i.test(conteudo);
}

/** HTML do editor → árvore só com as marcas permitidas. */
export function lerConteudo(conteudo: string | null | undefined): No[] {
  const texto = conteudo ?? "";
  const html = ehHtml(texto) ? texto : markdownParaHtml(texto);

  const raiz: No[] = [];
  const pilha: { tag: Tag | null; filhos: No[] }[] = [
    { tag: null, filhos: raiz },
  ];
  const topo = () => pilha[pilha.length - 1];
  const marca = /<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi;
  let ultimo = 0;

  const empurrarTexto = (bruto: string) => {
    if (!bruto) return;
    const t = decodificar(bruto);
    if (!t) return;
    topo().filhos.push({ tipo: "texto", texto: t });
  };

  for (const achado of html.matchAll(marca)) {
    empurrarTexto(html.slice(ultimo, achado.index));
    ultimo = achado.index + achado[0].length;

    const nome = achado[2].toLowerCase();
    const tag = (APELIDOS[nome] ?? nome) as Tag;
    if (!TAGS.includes(tag)) continue;
    const fecha = achado[1] === "/";

    if (fecha) {
      // Fecha a marca aberta mais próxima com esse nome; o que estiver
      // aberto por cima dela fecha junto.
      const onde = pilha.map((p) => p.tag).lastIndexOf(tag);
      if (onde > 0) pilha.length = onde;
      continue;
    }

    if (VAZIAS.has(tag)) {
      if (tag === "img") {
        const src = imagemSegura(atributo(achado[3], "src"));
        if (src)
          topo().filhos.push({
            tipo: "elemento",
            tag,
            src,
            alt: atributo(achado[3], "alt") ?? "",
            filhos: [],
          });
      } else {
        topo().filhos.push({ tipo: "elemento", tag, filhos: [] });
      }
      continue;
    }

    const no: No = { tipo: "elemento", tag, filhos: [] };
    if (tag === "a") no.href = linkSeguro(atributo(achado[3], "href"));
    topo().filhos.push(no);
    pilha.push({ tag, filhos: no.filhos });
  }
  empurrarTexto(html.slice(ultimo));

  return raiz;
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** O Markdown reduzido das publicações antigas → HTML do editor. */
export function markdownParaHtml(markdown: string) {
  const negrito = (linha: string) =>
    escapar(linha).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  return markdown
    .split(/\r?\n\s*\r?\n/)
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      if (bloco.startsWith("### "))
        return `<h3>${negrito(bloco.slice(4))}</h3>`;
      if (bloco.startsWith("## ")) return `<h2>${negrito(bloco.slice(3))}</h2>`;
      if (bloco.startsWith("# ")) return `<h2>${negrito(bloco.slice(2))}</h2>`;
      if (/^[-*] /.test(bloco)) {
        const itens = bloco
          .split(/\r?\n/)
          .map((l) => l.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean);
        return `<ul>${itens.map((i) => `<li><p>${negrito(i)}</p></li>`).join("")}</ul>`;
      }
      if (/^\d+[.)] /.test(bloco)) {
        const itens = bloco
          .split(/\r?\n/)
          .map((l) => l.replace(/^\d+[.)]\s*/, "").trim())
          .filter(Boolean);
        return `<ol>${itens.map((i) => `<li><p>${negrito(i)}</p></li>`).join("")}</ol>`;
      }
      return `<p>${negrito(bloco).replace(/\r?\n/g, "<br>")}</p>`;
    })
    .join("");
}
