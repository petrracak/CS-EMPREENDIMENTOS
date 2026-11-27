"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirArea } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { lerLink, VIDEO_MAXIMO_MB } from "@/lib/videos";
import { slugificar } from "@/lib/utils";

export type EstadoEmpreendimento = { erro?: string; ok?: boolean };

/** Texto vazio vira NULL, para o site esconder o campo em vez de mostrar "". */
const nulo = (v: FormDataEntryValue | null) => {
  const texto = String(v ?? "").trim();
  return texto ? texto : null;
};

const numero = (v: FormDataEntryValue | null) => {
  const texto = String(v ?? "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  if (!texto) return null;
  const n = Number(texto);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** 0 a 100, inteiro; fora disso ou em branco, nada. */
const porcentagem = (v: FormDataEntryValue | null) => {
  const texto = String(v ?? "")
    .trim()
    .replace(",", ".");
  if (!texto) return null;
  const n = Math.round(Number(texto));
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

/**
 * As fotos que o cadastro novo guardou no campo escondido. Só aceita
 * caminhos do jeito que o painel grava no Storage.
 */
function fotosDoRascunho(v: FormDataEntryValue | null) {
  let lista: unknown;
  try {
    lista = JSON.parse(String(v ?? "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(lista)) return [];
  return lista
    .slice(0, 200)
    .filter(
      (f): f is { url: string; legenda?: unknown } =>
        typeof f?.url === "string" &&
        /^empreendimentos\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(f.url),
    )
    .map((f) => ({
      url: f.url,
      legenda:
        typeof f.legenda === "string"
          ? f.legenda.trim().slice(0, 160) || null
          : null,
    }));
}

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
    andamento_obra: porcentagem(dados.get("andamento_obra")),
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

  // Cadastro novo: fotos e plantas enviadas antes do primeiro salvamento.
  if (!id) {
    const imagens = (["galeria", "planta"] as const).flatMap((categoria) =>
      fotosDoRascunho(dados.get(`imagens_${categoria}`)).map((f, i) => ({
        empreendimento_id: empreendimentoId,
        url: f.url,
        legenda: f.legenda,
        categoria,
        ordem: i + 1,
      })),
    );
    if (imagens.length) {
      await supabase.from("empreendimento_imagens").insert(imagens);
    }
  }

  revalidar(slug);

  // Novo empreendimento: abre a edição já na aba das fotos, plantas e
  // vídeos (os vídeos só entram depois do primeiro salvamento).
  if (!id) redirect(`/admin/empreendimentos/${empreendimentoId}?aba=midia`);
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

  if (!identificacao)
    return { erro: "A unidade precisa de uma identificação." };

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

/* ------------------------------------------------------------- vídeos */

export type RespostaVideo = { ok?: boolean; erro?: string };

/** Link de vídeo (YouTube, Instagram, TikTok, Vimeo) ou arquivo já enviado. */
export async function adicionarVideo(
  empreendimentoId: string,
  entrada: {
    tipo: "link" | "arquivo";
    url: string;
    capa?: string | null;
    titulo?: string | null;
  },
): Promise<RespostaVideo> {
  await exigirArea("obras");
  const supabase = await createClient();

  let tipo: "arquivo" | "youtube" | "instagram" | "tiktok" | "vimeo";
  const url = entrada.url.trim();
  if (entrada.tipo === "link") {
    const link = lerLink(url);
    if (!link) {
      return {
        erro: "Esse link não é de um vídeo do YouTube, Instagram, TikTok ou Vimeo. Copie o endereço do vídeo e cole de novo.",
      };
    }
    tipo = link.tipo;
  } else {
    // Só caminho do próprio balde, do jeito que o envio grava.
    if (
      !/^empreendimentos\/[a-z0-9-]+\/videos\/[a-z0-9-]+\.(mp4|webm|mov)$/.test(
        url,
      )
    ) {
      return { erro: "Arquivo de vídeo inválido." };
    }
    tipo = "arquivo";
  }
  const capa =
    entrada.capa && /^[a-z0-9/-]+\.webp$/.test(entrada.capa)
      ? entrada.capa
      : null;

  const { data: ultima } = await supabase
    .from("empreendimento_videos")
    .select("ordem")
    .eq("empreendimento_id", empreendimentoId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("empreendimento_videos").insert({
    empreendimento_id: empreendimentoId,
    tipo,
    url,
    capa,
    titulo: entrada.titulo?.trim().slice(0, 160) || null,
    ordem: (ultima?.ordem ?? 0) + 1,
  });
  if (error) return { erro: "Não conseguimos salvar o vídeo." };

  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
  return { ok: true };
}

export async function removerVideo(id: string, empreendimentoId: string) {
  await exigirArea("obras");
  const supabase = await createClient();
  const { data: video } = await supabase
    .from("empreendimento_videos")
    .select("tipo, url, capa")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("empreendimento_videos").delete().eq("id", id);

  // Arquivo enviado sai do Storage junto, para não ocupar o espaço grátis.
  if (video?.tipo === "arquivo") {
    await createAdminClient()
      .storage.from("midia")
      .remove([
        video.url,
        ...(video.capa
          ? [
              video.capa,
              video.capa.replace(/\.webp$/, "-md.webp"),
              video.capa.replace(/\.webp$/, "-sm.webp"),
            ]
          : []),
      ]);
  }
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
}

/**
 * Autorização de envio de um arquivo de vídeo, direto do navegador para o
 * Storage. O arquivo não passa pelo servidor do site (a Vercel aceita só
 * 4,5 MB por requisição); o servidor só confere quem pede, o tipo e o
 * tamanho, e devolve uma autorização de uso único para aquele caminho.
 */
export async function autorizarEnvioDeVideo(
  slug: string,
  nomeOriginal: string,
  tamanho: number,
  tipoMime: string,
): Promise<{ caminho?: string; token?: string; erro?: string }> {
  await exigirArea("obras");

  const extensao = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  }[tipoMime];
  if (!extensao)
    return { erro: "Use um vídeo MP4 (é o formato que o celular grava)." };
  if (tamanho > VIDEO_MAXIMO_MB * 1024 * 1024) {
    return {
      erro: `O vídeo tem ${Math.round(tamanho / 1024 / 1024)} MB e o limite é ${VIDEO_MAXIMO_MB} MB. Para vídeos maiores, suba no YouTube e cole o link aqui.`,
    };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) return { erro: "Empreendimento inválido." };

  const base =
    nomeOriginal
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "video";
  const caminho = `empreendimentos/${slug}/videos/${base}-${Date.now().toString(36)}.${extensao}`;

  const { data, error } = await createAdminClient()
    .storage.from("midia")
    .createSignedUploadUrl(caminho);
  if (error || !data)
    return { erro: "Não conseguimos preparar o envio. Tente de novo." };
  return { caminho, token: data.token };
}

/* ------------------------------------------- legenda e ordem das fotos */

/** A legenda que aparece embaixo da foto ou da planta no carrossel. */
export async function atualizarLegendaImagem(
  id: string,
  empreendimentoId: string,
  legenda: string,
) {
  await exigirArea("obras");
  const supabase = await createClient();
  await supabase
    .from("empreendimento_imagens")
    .update({ legenda: legenda.trim().slice(0, 160) || null })
    .eq("id", id)
    .eq("empreendimento_id", empreendimentoId);
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
}

/** Troca a foto de lugar com a vizinha (−1 para trás, 1 para a frente). */
export async function moverImagem(
  id: string,
  empreendimentoId: string,
  direcao: -1 | 1,
) {
  await exigirArea("obras");
  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("empreendimento_imagens")
    .select("id, categoria, ordem")
    .eq("id", id)
    .eq("empreendimento_id", empreendimentoId)
    .maybeSingle();
  if (!atual) return;

  const { data: irmas } = await supabase
    .from("empreendimento_imagens")
    .select("id, ordem")
    .eq("empreendimento_id", empreendimentoId)
    .eq("categoria", atual.categoria)
    .order("ordem")
    .order("id");
  const lista = irmas ?? [];
  const i = lista.findIndex((f) => f.id === id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return;

  // Renumera a categoria inteira já com a troca: ordens repetidas (de
  // fotos enviadas juntas) não deixam a seta "travar".
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(
    lista.map((f, n) =>
      supabase
        .from("empreendimento_imagens")
        .update({ ordem: n + 1 })
        .eq("id", f.id),
    ),
  );
  revalidatePath(`/admin/empreendimentos/${empreendimentoId}`);
  revalidar(null);
}
