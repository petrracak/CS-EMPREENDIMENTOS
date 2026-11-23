"use server";

import { revalidatePath } from "next/cache";

import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function mudarSituacaoLead(id: string, situacao: string) {
  await exigirArea("cadastros");
  const supabase = await createClient();
  await supabase.from("leads").update({ situacao }).eq("id", id);
  revalidatePath("/admin/cadastros");
  revalidatePath("/admin");
}

export async function anotarLead(id: string, anotacoes: string) {
  await exigirArea("cadastros");
  const supabase = await createClient();
  await supabase
    .from("leads")
    .update({ anotacoes: anotacoes.trim() || null })
    .eq("id", id);
  revalidatePath("/admin/cadastros");
}

/* ------------------------------------------------------------- tipos */

export type EstadoTipo = { erro?: string; ok?: boolean };

const TABELAS = {
  empreendimento: "tipos_empreendimento",
  unidade: "tipos_unidade",
} as const;

export async function criarTipo(
  _anterior: EstadoTipo,
  dados: FormData,
): Promise<EstadoTipo> {
  await exigirArea("obras");
  const supabase = await createClient();

  const nome = String(dados.get("nome") ?? "").trim();
  const grupo = String(dados.get("grupo") ?? "") as keyof typeof TABELAS;
  if (!nome) return { erro: "Escreva o nome do tipo." };
  if (!(grupo in TABELAS)) return { erro: "Grupo inválido." };

  const slug = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { error } = await supabase
    .from(TABELAS[grupo])
    .insert({ nome, slug, ordem: 99 });

  if (error) {
    return {
      erro:
        error.code === "23505"
          ? "Esse tipo já existe."
          : "Não conseguimos criar o tipo.",
    };
  }

  revalidatePath("/admin/tipos");
  revalidatePath("/empreendimentos");
  return { ok: true };
}

export async function apagarTipo(
  grupo: keyof typeof TABELAS,
  id: string,
): Promise<void> {
  await exigirArea("obras");
  const supabase = await createClient();
  // O vínculo é "on delete set null": o empreendimento continua lá, só
  // fica sem tipo. Nada é perdido por engano.
  await supabase.from(TABELAS[grupo]).delete().eq("id", id);
  revalidatePath("/admin/tipos");
  revalidatePath("/empreendimentos");
}
