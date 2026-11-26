import type { Empresa } from "@/lib/settings";
import { urlDaMidia } from "@/lib/midia";

/**
 * O que o Google e as IAs leem além do texto da página: o endereço
 * definitivo do site, os dados estruturados (schema.org) e as listas do
 * sitemap e do llms.txt.
 *
 * O domínio vem de NEXT_PUBLIC_SITE_URL. Quando o domínio da CS apontar
 * para o site, basta trocar a variável na Vercel e publicar de novo:
 * canonical, sitemap, robots e dados estruturados acompanham.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Caminho do site ("/blog") ou da mídia ("empreendimentos/x.webp") → URL completa. */
export function absoluta(
  caminho: string | null | undefined,
): string | undefined {
  if (!caminho) return undefined;
  if (/^https?:\/\//.test(caminho)) return caminho;
  if (caminho.startsWith("/")) return `${SITE_URL}${caminho}`;
  return urlDaMidia(caminho);
}

export const IMAGEM_PADRAO = "/site/og-cs.jpg";

/** "(93) 99141-5334" → "+55-93-99141-5334", o formato que o schema.org pede. */
function telefoneInternacional(texto: string) {
  const d = texto.replace(/\D/g, "");
  if (d.length < 10) return undefined;
  const sem55 = d.startsWith("55") && d.length > 11 ? d.slice(2) : d;
  return `+55-${sem55.slice(0, 2)}-${sem55.slice(2, -4)}-${sem55.slice(-4)}`;
}

/**
 * "Travessa Dália, 808, sala 02, Aeroporto Velho, Santarém, PA, CEP
 * 68020-260" → as partes do endereço. O texto vem do painel; o que não
 * der para separar vai inteiro na rua.
 */
function endereco(texto: string) {
  const cep = /\b\d{5}-?\d{3}\b/.exec(texto)?.[0];
  const partes = texto
    .replace(/,?\s*CEP\s*\d{5}-?\d{3}/i, "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const uf = partes.findIndex((p) => /^[A-Z]{2}$/.test(p));
  if (uf >= 2) {
    return {
      "@type": "PostalAddress",
      streetAddress: partes.slice(0, uf - 2).join(", ") || partes[0],
      addressLocality: partes[uf - 1],
      addressRegion: partes[uf],
      postalCode: cep,
      addressCountry: "BR",
    };
  }
  return {
    "@type": "PostalAddress",
    streetAddress: texto,
    addressLocality: "Santarém",
    addressRegion: "PA",
    postalCode: cep,
    addressCountry: "BR",
  };
}

/** A empresa: construtora e incorporadora, com endereço, contato e redes. */
export function dadosDaEmpresa(e: Empresa) {
  const sameAs = [e.instagram, e.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["GeneralContractor", "Organization"],
    "@id": `${SITE_URL}/#empresa`,
    name: "CS Empreendimentos",
    legalName: e.razao_social || undefined,
    taxID: e.cnpj || undefined,
    url: SITE_URL,
    logo: `${SITE_URL}/marca/logo-colorida.svg`,
    image: `${SITE_URL}${IMAGEM_PADRAO}`,
    description:
      "Construtora e incorporadora de Santarém, no Pará, desde 2016. Casas em condomínio fechado, apartamentos, flats e terrenos, com 140 unidades entregues até 2026.",
    foundingDate: "2016",
    founder: { "@type": "Person", name: "Girlan Carneiro" },
    areaServed: { "@type": "City", name: "Santarém, Pará, Brasil" },
    address: e.endereco ? endereco(e.endereco) : undefined,
    telephone: e.whatsapp ? telefoneInternacional(e.whatsapp) : undefined,
    email: e.email || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: [
      "construção de casas",
      "incorporação imobiliária",
      "condomínio fechado",
      "apartamentos e flats",
      "imóveis na planta em Santarém",
    ],
  };
}

export function dadosDoSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#site`,
    url: SITE_URL,
    name: "CS Empreendimentos",
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#empresa` },
  };
}

export function trilha(itens: { nome: string; caminho: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: `${SITE_URL}${item.caminho}`,
    })),
  };
}

export function perguntasFrequentes(
  itens: { pergunta: string; resposta: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: itens.map((i) => ({
      "@type": "Question",
      name: i.pergunta,
      acceptedAnswer: { "@type": "Answer", text: i.resposta },
    })),
  };
}
