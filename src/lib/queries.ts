import { createPublicClient } from "@/lib/supabase/public";

/**
 * Leituras do site público.
 *
 * Todas usam o cliente anônimo: o RLS já filtra o que está publicado, e
 * sem cookie as páginas podem ser estáticas com ISR.
 */

const CAMPOS_CARD = `
  id, slug, nome, situacao, destaque, ordem,
  frase_impacto, linha_card, imagem_principal, logo_url,
  bairro, cidade, endereco,
  tipo:tipos_empreendimento (id, nome, slug)
`;

export type CardEmpreendimento = {
  id: string;
  slug: string;
  nome: string;
  situacao: "em_construcao" | "em_acabamento" | "entregue";
  destaque: boolean;
  ordem: number;
  frase_impacto: string | null;
  linha_card: string | null;
  imagem_principal: string | null;
  logo_url: string | null;
  bairro: string | null;
  cidade: string | null;
  endereco: string | null;
  tipo: { id: string; nome: string; slug: string } | null;
};

export async function listarEmpreendimentos(): Promise<CardEmpreendimento[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select(CAMPOS_CARD)
    .eq("status", "publicado")
    .order("ordem");
  return (data ?? []) as unknown as CardEmpreendimento[];
}

export async function listarDestaques(
  limite = 3,
): Promise<CardEmpreendimento[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select(CAMPOS_CARD)
    .eq("status", "publicado")
    .eq("destaque", true)
    .order("ordem")
    .limit(limite);
  return (data ?? []) as unknown as CardEmpreendimento[];
}

export async function lerEmpreendimento(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select(
      `*,
       tipo:tipos_empreendimento (id, nome, slug),
       caracteristicas:empreendimento_caracteristicas (id, texto, ordem),
       diferenciais:empreendimento_diferenciais (id, texto, ordem),
       referencias:empreendimento_referencias (id, texto, ordem),
       imagens:empreendimento_imagens (id, url, legenda, categoria, ordem),
       unidades (
         id, identificacao, andar, area_construida, terreno_dimensoes,
         terreno_area, valor, situacao, observacao, ordem,
         tipo:tipos_unidade (id, nome, slug)
       )`,
    )
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();

  if (!data) return null;

  const porOrdem = <T extends { ordem: number }>(itens: T[] | null) =>
    [...(itens ?? [])].sort((a, b) => a.ordem - b.ordem);

  return {
    ...data,
    caracteristicas: porOrdem(data.caracteristicas),
    diferenciais: porOrdem(data.diferenciais),
    referencias: porOrdem(data.referencias),
    imagens: porOrdem(data.imagens),
    // O RLS já esconde unidade em rascunho; aqui só ordena.
    unidades: porOrdem(data.unidades),
  };
}

export type Empreendimento = NonNullable<
  Awaited<ReturnType<typeof lerEmpreendimento>>
>;

export async function listarSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select("slug")
    .eq("status", "publicado");
  return (data ?? []).map((e) => e.slug);
}

export async function listarTipos() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tipos_empreendimento")
    .select("id, nome, slug")
    .order("ordem");
  return data ?? [];
}

// ------------------------------------------------------------------ blog
export async function listarPosts(limite?: number) {
  const supabase = createPublicClient();
  let consulta = supabase
    .from("posts")
    .select("id, slug, titulo, resumo, capa_url, categoria, publicado_em")
    .eq("status", "publicado")
    .order("publicado_em", { ascending: false });
  if (limite) consulta = consulta.limit(limite);
  const { data } = await consulta;
  return data ?? [];
}

export async function lerPost(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  return data;
}

export async function listarSlugsPosts(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "publicado");
  return (data ?? []).map((p) => p.slug);
}

// --------------------------------------------------------------- marcos
export async function listarMarcos() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("marcos")
    .select("id, ano, texto")
    .order("ordem");
  return data ?? [];
}

/** Empreendimentos para o seletor do formulário de cadastro. */
export async function listarParaSelecao() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select("id, nome")
    .eq("status", "publicado")
    .order("ordem");
  return data ?? [];
}
