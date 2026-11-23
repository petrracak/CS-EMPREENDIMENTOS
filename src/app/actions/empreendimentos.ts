"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugificar } from "@/lib/utils";

export type EstadoEmpreendimento = { erro?: string; ok?: boolean };

/** Texto vazio vira NULL, para o site esconder o campo em vez de mostrar "". */
const nulo = (v: FormDataEntryValue | null) => {
  const texto = String(v ?? "").trim();
  return texto ? texto : null;
};

const numero = (v: FormDataEntryValue | null) => {
  const texto = String(v ?? "").trim().replace(/\./g, "").replace(",", ".");
  if (!texto) return null;
  const n = Number(texto);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Recalcula as páginas que mostram este empreendimento. */
function revalidar(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/empreendimentos");
  if (slug) revalidatePath(`/empreendimentos/${slug}`);
  revalidatePath("/admin", "layout");
}

export async function salvarEmpreendimento(
  _anterior: EstadoEmpreendimento,
  dados: FormData,
): Promise<EstadoEmpreendimento> {
  await exigirArea("obras");
  const supabase = await createClient();

  const id = String(dados.get("id") ?? "");
  const nome = String(dados.get("nome") ?? "").trim();
  if (!nome) return { erro: "O empreendimento precisa de um nome." };

  const slug = slugificar(String(dados.get("slug") ?? "") || nome);

  const campos = {
    nome,
    slug,
    status: String(dados.get("status") ?? "rascunho"),
    situacao: String(dados.get("situacao") ?? "em_construcao"),
    tipo_id: nulo(dados.get("tipo_id")),
    frase_impacto: nulo(dados.get("frase_impacto")),
    subtitulo: nulo(dados.get("subtitulo")),
    linha_card: nulo(dados.get("linha_card")),
    sobre: nulo(dados.get("sobre")),
    conceito: nulo(dados.get("conceito")),
    historia: nulo(dados.get("historia")),
    unidades_total: nulo(dados.get("unidades_total")),
    area_construida: nulo(dados.get("area_construida")),
    terreno_dimensoes: nulo(dados.get("terreno_dimensoes")),
    terreno_area: nulo(dados.get("terreno_area")),
    distribuicao: nulo(dados.get("distribuicao")),
    vagas: nulo(dados.get("vagas")),
    previsao_entrega: nulo(dados.get("previsao_entrega")),
    valor_a_partir_de: numero(dados.get("valor_a_partir_de")),
    registro_incorporacao: nulo(dados.get("registro_incorporacao")),
    endereco: nulo(dados.get("endereco")),
    bairro: nulo(dados.get("bairro")),
    cidade: String(dados.get("cidade") ?? "Santarém").trim() || "Santarém",
    mapa_link: nulo(dados.get("mapa_link")),
    localizacao_texto: nulo(dados.get("localizacao_texto")),
    atendimento_chamada: nulo(dados.get("atendimento_chamada")),
    botao_primario: nulo(dados.get("botao_primario")),
    botao_secundario: nulo(dados.get("botao_secundario")),
    legenda_galeria: nulo(dados.get("legenda_galeria")),
    imagem_principal: nulo(dados.get("imagem_principal")),
    logo_url: nulo(dados.get("logo_url")),
    mapa_imagem: nulo(dados.get("mapa_imagem")),
    destaque: dados.get("destaque") === "true",
    ordem: Number(dados.get("ordem") ?? 0) || 0,
    seo_titulo: nulo(dados.get("seo_titulo")),
    seo_descricao: nulo(dados.get("seo_descricao")),
  };

  let empreendimentoId = id;

  if (id) {
    const { error } = await supabase
      .from("empreendimentos")
      .update(campos)
      .eq("id", id);
    if (error) {
      return {
        erro:
          error.code === "23505"
            ? "Já existe um empreendimento com esse endereço de página."
            : "Não conseguimos salvar. Tente de novo.",
      };
    }
  } else {
    const { data, error } = await supabase
      .from("empreendimentos")
      .insert(campos)
      .select("id")
      .single();
    if (error || !data) {
      return {
        erro:
          error?.code === "23505"
            ? "Já existe um empreendimento com esse endereço de página."
            : "Não conseguimos criar o empreendimento.",
      };
    }
    empreendimentoId = data.id;
  }

  // As três listas são regravadas por inteiro: é mais simples e mais
  // seguro que casar item a item, e elas têm poucas linhas.
  await Promise.all(
    (
      [
        ["empreendimento_caracteristicas", "caracteristicas"],
        ["empreendimento_diferenciais", "diferenciais"],
        ["empreendimento_referencias", "referencias"],
      ] as const
    ).map(async ([tabela, campo]) => {
      await supabase
        .from(tabela)
        .delete()
        .eq("empreendimento_id", empreendimentoId);

      const linhas = String(dados.get(campo) ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((texto, i) => ({
          empreendimento_id: empreendimentoId,
          texto,
          ordem: i + 1,
        }));

      if (linhas.length) await supabase.from(tabela).insert(linhas);
    }),
  );

  revalidar(slug);

  if (!id) redirect(`/admin/empreendimentos/${empreendimentoId}`);
  return { ok: true };
}

export async function alternarPublicacao(id: string, publicar: boolean) {
  await exigirArea("obras");
  const supabase = await createClient();
  const { data } = await supabase
    .from("empreendimentos")
    .update({ status: publicar ? "publicado" : "rascunho" })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  revalidar(data?.slug);
}

export async function apagarEmpreendimento(id: string) {
  await exigirArea("obras");
  const supabase = await createClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("empreendimentos").delete().eq("id", id);
  revalidar(data?.slug);
  redirect("/admin/empreendimentos");
}

/* ------------------------------------------------------------ imagens */

export async function adicionarImagem(
  empreendimentoId: string,
  url: string,
  categoria: "galeria" | "planta",
  legenda: string | null,
) {
  await exigirArea("obras");
  const supabase = await createClient();

  const { data: ultima } = await supabase
    .from("empreendimento_imagens")
    .select("ordem")
    .eq("empreendimento_id", empreendimentoId)
    .eq("categoria", categoria)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("empreendimento_imagens").insert({
    empreendimento_id: empreendimentoId,
    url,
    categoria,
    legenda,
    ordem: (ultima?.ordem ?? 0) + 1,
  });

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
}

export async function removerImagem(id: string, empreendimentoId: string) {
  await exigirArea("obras");
  const supabase = await createClient();
  await supabase.from("empreendimento_imagens").delete().eq("id", id);
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
}

/* ----------------------------------------------------------- unidades */

export type EstadoUnidade = { erro?: string; ok?: boolean };

export async function salvarUnidade(
  _anterior: EstadoUnidade,
  dados: FormData,
): Promise<EstadoUnidade> {
  await exigirArea("obras");
  const supabase = await createClient();

  const id = String(dados.get("id") ?? "");
  const empreendimentoId = String(dados.get("empreendimento_id") ?? "");
  const identificacao = String(dados.get("identificacao") ?? "").trim();

  if (!identificacao) return { erro: "A unidade precisa de uma identificação." };

  const campos = {
    empreendimento_id: empreendimentoId,
    identificacao,
    tipo_id: nulo(dados.get("tipo_id")),
    andar: nulo(dados.get("andar")),
    area_construida: nulo(dados.get("area_construida")),
    terreno_dimensoes: nulo(dados.get("terreno_dimensoes")),
    terreno_area: nulo(dados.get("terreno_area")),
    valor: numero(dados.get("valor")),
    situacao: String(dados.get("situacao") ?? "disponivel"),
    status: String(dados.get("status") ?? "rascunho"),
    observacao: nulo(dados.get("observacao")),
    ordem: Number(dados.get("ordem") ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from("unidades").update(campos).eq("id", id)
    : await supabase.from("unidades").insert(campos);

  if (error) return { erro: "Não conseguimos salvar a unidade." };

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}/unidades`);
  revalidar(null);
  return { ok: true };
}

export async function removerUnidade(id: string, empreendimentoId: string) {
  await exigirArea("obras");
  const supabase = await createClient();
  await supabase.from("unidades").delete().eq("id", id);
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}/unidades`);
  revalidar(null);
}

/**
 * Cadastro de unidades em lote, colando de uma planilha.
 *
 * As 100 casas do House Premium não seriam cadastradas uma a uma. Cada
 * linha é "identificação; área; terreno; valor; situação", e as colunas
 * que faltarem ficam vazias — a CS completa depois.
 */
export async function importarUnidades(
  _anterior: EstadoUnidade,
  dados: FormData,
): Promise<EstadoUnidade> {
  await exigirArea("obras");
  const supabase = await createClient();

  const empreendimentoId = String(dados.get("empreendimento_id") ?? "");
  const tipoId = nulo(dados.get("tipo_id"));
  const texto = String(dados.get("linhas") ?? "");

  const SITUACOES = ["disponivel", "reservada", "vendida"];

  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha, i) => {
      const colunas = linha.split(/[;\t]/).map((c) => c.trim());
      const situacao = (colunas[4] ?? "").toLowerCase();
      return {
        empreendimento_id: empreendimentoId,
        identificacao: colunas[0] ?? "",
        tipo_id: tipoId,
        area_construida: colunas[1] || null,
        terreno_dimensoes: colunas[2] || null,
        valor: colunas[3] ? numero(colunas[3]) : null,
        situacao: SITUACOES.includes(situacao) ? situacao : "disponivel",
        status: "rascunho",
        ordem: i + 1,
      };
    })
    .filter((u) => u.identificacao);

  if (!linhas.length) {
    return { erro: "Nenhuma linha reconhecida. Confira o formato." };
  }

  const { error } = await supabase.from("unidades").insert(linhas);
  if (error) return { erro: "Não conseguimos importar as unidades." };

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}/unidades`);
  revalidar(null);
  return { ok: true };
}
