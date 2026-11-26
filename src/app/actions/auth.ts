"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { FORMATO_USUARIO } from "@/lib/equipe";
import {
  hash,
  ipDoVisitante,
  limparTentativas,
  passouDoLimite,
  registrarTentativa,
} from "@/lib/limite";
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

  // Contra quem tenta adivinhar a senha: 5 erros na mesma conta ou 20 do
  // mesmo IP em 15 minutos pausam o acesso. A conta conta pelo que foi
  // digitado, exista ou não, para a pausa não revelar quem existe.
  const contaChave = hash(`conta:${acesso.replace(/^@/, "")}`);
  const ipChave = hash(`ip:${await ipDoVisitante()}`);
  if (
    await passouDoLimite(
      "login",
      [
        { chave: contaChave, maximo: 5 },
        { chave: ipChave, maximo: 20 },
      ],
      15,
    )
  ) {
    return {
      erro: "Muitas tentativas seguidas. Por segurança, o acesso foi pausado por 15 minutos.",
    };
  }

  const falhou = async () => {
    await registrarTentativa("login", [contaChave, ipChave]);
    // Um respiro em cada erro deixa a tentativa em massa lenta demais.
    await new Promise((r) => setTimeout(r, 700));
    return { erro: ERRO };
  };

  const email = acesso.includes("@")
    ? acesso.toLowerCase()
    : await emailDoUsuario(acesso);
  if (!email) return falhou();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) return falhou();
  await limparTentativas("login", contaChave);

  revalidatePath("/admin", "layout");
  // Só volta para uma página do próprio painel ("/admin" ou "/admin/…").
  redirect(
    /^\/admin(\/[\w\-/]*)?(\?[\w=&%-]*)?$/.test(destino) ? destino : "/admin",
  );
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
