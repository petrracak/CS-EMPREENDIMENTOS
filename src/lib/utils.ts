import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}

/**
 * Formata valor em real.
 *
 * Devolve null quando não há o que mostrar — nulo, zero ou negativo. A
 * copy é explícita: enquanto a CS não confirmar o preço, o campo inteiro
 * (com o rótulo) some da página, em vez de aparecer como "R$ 0,00" ou
 * "sob consulta".
 */
export function formatarValor(valor: number | null | undefined): string | null {
  if (valor === null || valor === undefined || valor <= 0) return null;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/**
 * Um campo de texto só aparece se tiver conteúdo de verdade. Trata os
 * marcadores que sobraram de planilha ("0000", "a definir") como vazio,
 * para não vazarem para o site publicado.
 */
export function textoUtil(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const limpo = valor.trim();
  if (!limpo) return null;
  const descartar = ["0000", "0", "r$ 0,00", "a definir", "pendente", "-"];
  if (descartar.includes(limpo.toLowerCase())) return null;
  return limpo;
}

export const SITUACOES = {
  em_construcao: { rotulo: "Em construção", cor: "obra" },
  em_acabamento: { rotulo: "Em acabamento", cor: "acabamento" },
  entregue: { rotulo: "Entregue", cor: "entregue" },
} as const;

export const SITUACOES_UNIDADE = {
  disponivel: { rotulo: "Disponível" },
  reservada: { rotulo: "Reservada" },
  vendida: { rotulo: "Vendida" },
} as const;

export type SituacaoEmpreendimento = keyof typeof SITUACOES;
export type SituacaoUnidade = keyof typeof SITUACOES_UNIDADE;

/** Data por extenso, curta, para o blog. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
