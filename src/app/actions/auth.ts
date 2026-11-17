"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { erro?: string };

export async function entrar(
  _anterior: EstadoLogin,
  dados: FormData,
): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  const destino = String(dados.get("redirect") ?? "/admin");

  if (!email || !senha) {
    return { erro: "Informe o e-mail e a senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Mensagem única de propósito: dizer qual dos dois está errado conta a
    // quem tenta adivinhar se aquele e-mail existe.
    return { erro: "E-mail ou senha incorretos." };
  }

  revalidatePath("/admin", "layout");
  redirect(destino.startsWith("/admin") ? destino : "/admin");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
