"use server";

import { revalidatePath } from "next/cache";

import { exigirPerfil } from "@/lib/auth";
import { hash, passouDoLimite, registrarTentativa } from "@/lib/limite";
import { senhaFraca } from "@/lib/senha";
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
  const perfil = await exigirPerfil();

  const atual = String(dados.get("atual") ?? "");
  const senha = String(dados.get("senha") ?? "");
  const repetida = String(dados.get("repetida") ?? "");

  if (senha.length < 10) {
    return { erro: "A senha precisa ter pelo menos 10 caracteres." };
  }
  if (senha !== repetida) {
    return { erro: "As duas senhas não são iguais." };
  }
  if (senha === atual) {
    return { erro: "A senha nova precisa ser diferente da atual." };
  }
  const fraca = senhaFraca(senha, [perfil.usuario, perfil.email, perfil.nome]);
  if (fraca) return { erro: fraca };

  // A senha atual confirma que é a própria pessoa, e não alguém num
  // computador que ficou logado.
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  const email = sessao.user?.email;
  if (!email) return { erro: "Sessão expirada. Entre de novo." };

  const contaChave = hash(`conta:${email}`);
  if (await passouDoLimite("login", [{ chave: contaChave, maximo: 5 }], 15)) {
    return { erro: "Muitas tentativas seguidas. Espere 15 minutos." };
  }
  const { error: erroAtual } = await supabase.auth.signInWithPassword({
    email,
    password: atual,
  });
  if (erroAtual) {
    await registrarTentativa("login", [contaChave]);
    return { erro: "A senha atual não confere." };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) return { erro: "Não conseguimos trocar a senha." };

  return { ok: "Senha trocada." };
}
