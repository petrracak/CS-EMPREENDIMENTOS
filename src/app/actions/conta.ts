"use server";

import { revalidatePath } from "next/cache";

import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoConta = { erro?: string; ok?: string };

export async function salvarNome(
  _anterior: EstadoConta,
  dados: FormData,
): Promise<EstadoConta> {
  const perfil = await exigirPerfil();
  const nome = String(dados.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Escreva o seu nome." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ nome })
    .eq("id", perfil.id);

  if (error) return { erro: "Não conseguimos salvar." };

  revalidatePath("/admin", "layout");
  return { ok: "Nome atualizado." };
}

export async function trocarSenha(
  _anterior: EstadoConta,
  dados: FormData,
): Promise<EstadoConta> {
  await exigirPerfil();

  const senha = String(dados.get("senha") ?? "");
  const repetida = String(dados.get("repetida") ?? "");

  if (senha.length < 10) {
    return { erro: "A senha precisa ter pelo menos 10 caracteres." };
  }
  if (senha !== repetida) {
    return { erro: "As duas senhas não são iguais." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) return { erro: "Não conseguimos trocar a senha." };

  return { ok: "Senha trocada." };
}
