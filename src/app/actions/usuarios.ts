"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirArea } from "@/lib/auth";
import { emailInterno, FORMATO_USUARIO } from "@/lib/equipe";
import { ehNivel, type Nivel } from "@/lib/permissoes";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Usuários do painel. Só administradores chegam aqui (exigirArea), e
 * tudo passa pela chave de serviço, porque criar conta e trocar senha de
 * outra pessoa não é algo que um usuário comum faz pelo Supabase.
 *
 * A conta principal tem defesa dupla: as funções abaixo recusam, e o
 * gatilho protege_perfis do banco recusa de novo.
 */

const SENHA_MINIMA = 10;

export type Resposta = { ok: boolean; mensagem?: string };

export type EstadoNovoUsuario = Resposta & {
  erros?: Record<string, string>;
  /** Para mostrar o que passar à pessoa depois de criar. */
  criado?: { nome: string; usuario: string; email: string | null };
};

const schemaNovo = z.object({
  nome: z.string().trim().min(3, "Escreva o nome completo.").max(120),
  usuario: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      FORMATO_USUARIO,
      "Use de 3 a 40 letras minúsculas, números, ponto, hífen ou sublinhado.",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160)
    .refine((v) => !v || z.email().safeParse(v).success, "E-mail inválido."),
  nivel: z.string().refine(ehNivel, "Escolha o nível de acesso."),
  senha: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`)
    .max(72, "Senha longa demais."),
});

export async function criarUsuario(
  _anterior: EstadoNovoUsuario,
  dados: FormData,
): Promise<EstadoNovoUsuario> {
  await exigirArea("usuarios");

  const resultado = schemaNovo.safeParse({
    nome: dados.get("nome") ?? "",
    usuario: dados.get("usuario") ?? "",
    email: dados.get("email") ?? "",
    nivel: dados.get("nivel") ?? "",
    senha: dados.get("senha") ?? "",
  });

  if (!resultado.success) {
    const erros: Record<string, string> = {};
    for (const p of resultado.error.issues) erros[String(p.path[0])] ??= p.message;
    return { ok: false, erros };
  }

  const { nome, usuario, email, senha } = resultado.data;
  const nivel = resultado.data.nivel as Nivel;
  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("profiles")
    .select("id")
    .eq("usuario", usuario)
    .maybeSingle();
  if (existente) {
    return { ok: false, erros: { usuario: "Esse usuário já existe. Escolha outro." } };
  }

  const { data: criado, error } = await admin.auth.admin.createUser({
    email: email || emailInterno(usuario),
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (error || !criado.user) {
    return {
      ok: false,
      mensagem: /already|exists|registered/i.test(error?.message ?? "")
        ? "Já existe uma conta com esse e-mail."
        : "Não conseguimos criar a conta. Tente de novo.",
    };
  }

  // O gatilho do banco cria o perfil no nível mais baixo, de propósito.
  // O nível de verdade entra aqui, depois da checagem de administrador.
  const { error: erroPerfil } = await admin
    .from("profiles")
    .update({ nome, role: nivel, usuario, email: email || null, ativo: true })
    .eq("id", criado.user.id);

  if (erroPerfil) {
    // Conta sem perfil certo não serve para nada: desfaz.
    await admin.auth.admin.deleteUser(criado.user.id);
    return { ok: false, mensagem: "Não conseguimos criar a conta. Tente de novo." };
  }

  revalidatePath("/admin/usuarios");
  return {
    ok: true,
    criado: { nome, usuario, email: email || null },
  };
}

/** Confere o alvo antes de mexer: não é você, nem a conta principal. */
async function alvoEditavel(id: string): Promise<Resposta | null> {
  const eu = await exigirArea("usuarios");
  if (id === eu.id) {
    return { ok: false, mensagem: "Isso você muda em Minha conta, não aqui." };
  }

  const { data: alvo } = await createAdminClient()
    .from("profiles")
    .select("principal")
    .eq("id", id)
    .maybeSingle();

  if (!alvo) return { ok: false, mensagem: "Usuário não encontrado." };
  if (alvo.principal) {
    return { ok: false, mensagem: "A conta principal não pode ser alterada aqui." };
  }
  return null;
}

export async function mudarNivel(id: string, nivel: string): Promise<Resposta> {
  const recusa = await alvoEditavel(id);
  if (recusa) return recusa;
  if (!ehNivel(nivel)) return { ok: false, mensagem: "Nível inválido." };

  const { error } = await createAdminClient()
    .from("profiles")
    .update({ role: nivel })
    .eq("id", id);
  if (error) return { ok: false, mensagem: "Não conseguimos salvar." };

  revalidatePath("/admin/usuarios");
  return { ok: true, mensagem: "Nível atualizado. Vale no próximo clique da pessoa." };
}

export async function alterarSituacao(id: string, ativo: boolean): Promise<Resposta> {
  const recusa = await alvoEditavel(id);
  if (recusa) return recusa;

  const { error } = await createAdminClient()
    .from("profiles")
    .update({ ativo })
    .eq("id", id);
  if (error) return { ok: false, mensagem: "Não conseguimos salvar." };

  revalidatePath("/admin/usuarios");
  return {
    ok: true,
    mensagem: ativo ? "Acesso reativado." : "Acesso suspenso. A pessoa sai do painel na hora.",
  };
}

export async function definirSenha(id: string, senha: string): Promise<Resposta> {
  const recusa = await alvoEditavel(id);
  if (recusa) return recusa;
  if (senha.length < SENHA_MINIMA) {
    return {
      ok: false,
      mensagem: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
    };
  }

  const { error } = await createAdminClient().auth.admin.updateUserById(id, {
    password: senha,
  });
  if (error) return { ok: false, mensagem: "Não conseguimos trocar a senha." };

  return { ok: true, mensagem: "Senha nova definida. Passe para a pessoa." };
}

export async function removerUsuario(id: string): Promise<Resposta> {
  const recusa = await alvoEditavel(id);
  if (recusa) return recusa;

  // Apagar a conta apaga o perfil junto (on delete cascade). O que a
  // pessoa publicou fica, só sem autor.
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) return { ok: false, mensagem: "Não conseguimos remover." };

  revalidatePath("/admin/usuarios");
  return { ok: true, mensagem: "Usuário removido." };
}
