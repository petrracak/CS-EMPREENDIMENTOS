/**
 * As cores da faixa de campanha. O desenho de cada uma está em
 * globals.css ([data-tema]); aqui só a lista que o painel mostra e o
 * site aceita.
 */
export const TEMAS_FAIXA = [
  { id: "verde", rotulo: "Verde CS" },
  { id: "vermelho", rotulo: "Vermelho" },
  { id: "laranja", rotulo: "Laranja" },
  { id: "amarelo", rotulo: "Amarelo" },
  { id: "azul", rotulo: "Azul" },
  { id: "roxo", rotulo: "Roxo" },
  { id: "rosa", rotulo: "Rosa" },
  { id: "preto", rotulo: "Preto" },
] as const;

export type TemaFaixa = (typeof TEMAS_FAIXA)[number]["id"];

/** Valor desconhecido ou vazio volta para o verde da marca. */
export function temaDaFaixa(valor: unknown): TemaFaixa {
  return TEMAS_FAIXA.some((t) => t.id === valor)
    ? (valor as TemaFaixa)
    : "verde";
}
