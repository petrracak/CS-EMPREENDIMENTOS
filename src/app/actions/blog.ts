"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugificar } from "@/lib/utils";

export type EstadoPost = { erro?: string; ok?: boolean };

const nulo = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").trim();
  return t ? t : null;
};

export async function salvarPost(
  _anterior: EstadoPost,
  dados: FormData,
): Promise<EstadoPost> {
  const perfil = await exigirPerfil();
  const supabase = await createClient();

  const id = String(dados.get("id") ?? "");
  const titulo = String(dados.get("titulo") ?? "").trim();
  if (!titulo) return { erro: "A publicação precisa de um título." };

  const status = String(dados.get("status") ?? "rascunho");
  const slug = slugificar(String(dados.get("slug") ?? "") || titulo);

  const campos = {
    titulo,
    slug,
    resumo: nulo(dados.get("resumo")),
    conteudo: nulo(dados.get("conteudo")),
    capa_url: nulo(dados.get("capa_url")),
    categoria: nulo(dados.get("categoria")),
    status,
    seo_titulo: nulo(dados.get("seo_titulo")),
    seo_descricao: nulo(dados.get("seo_descricao")),
    autor_id: perfil.id,
    // A data de publicação é gravada na primeira vez que o post sai do
    // rascunho, e não muda em cada edição depois disso.
    publicado_em:
      status === "publicado"
        ? nulo(dados.get("publicado_em")) ?? new Date().toISOString()
        : null,
  };

  if (id) {
    const { error } = await supabase.from("posts").update(campos).eq("id", id);
    if (error) {
      return {
        erro:
          error.code === "23505"
            ? "Já existe uma publicação com esse endereço."
            : "Não conseguimos salvar.",
      };
    }
  } else {
    const { data, error } = await supabase
      .from("posts")
      .insert(campos)
      .select("id")
      .single();
    if (error || !data) {
      return {
        erro:
          error?.code === "23505"
            ? "Já existe uma publicação com esse endereço."
            : "Não conseguimos criar a publicação.",
      };
    }
    revalidatePath("/blog");
    redirect(`/admin/blog/${data.id}`);
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function apagarPost(id: string) {
  await exigirPerfil();
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/blog");
  revalidatePath("/admin", "layout");
  redirect("/admin/blog");
}
