"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { FORMATO_USUARIO } from "@/lib/equipe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { erro?: string };

export async function entrar(
  _anterior: EstadoLogin,
  dados: FormData,
): Promise<EstadoLogin> {
  const acesso = String(dados.get("acesso") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  const destino = String(dados.get("redirect") ?? "/admin");

  if (!acesso || !senha) {
    return { erro: "Informe o e-mail ou usuário e a senha." };
  }

  // Mensagem única de propósito: dizer qual dos dois está errado conta a
  // quem tenta adivinhar se aquele usuário existe.
  const ERRO = "Usuário, e-mail ou senha incorretos.";

  const email = acesso.includes("@")
    ? acesso.toLowerCase()
    : await emailDoUsuario(acesso);
  if (!email) return { erro: ERRO };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) return { erro: ERRO };

  revalidatePath("/admin", "layout");
  redirect(destino.startsWith("/admin") ? destino : "/admin");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/**
 * O e-mail de login de quem digitou o usuário.
 *
 * Quem ainda não entrou não tem permissão de ler perfis, então a busca é
 * com a chave de serviço, aqui no servidor, e devolve só o e-mail.
 */
async function emailDoUsuario(entrada: string): Promise<string | null> {
  const usuario = entrada.replace(/^@/, "").toLowerCase();
  if (!FORMATO_USUARIO.test(usuario)) return null;

  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("profiles")
    .select("id")
    .eq("usuario", usuario)
    .maybeSingle();
  if (!perfil) return null;

  const { data } = await admin.auth.admin.getUserById(perfil.id);
  return data.user?.email ?? null;
}
