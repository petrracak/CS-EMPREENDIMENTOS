"use server";

import { z } from "zod";

import {
  hash,
  ipDoVisitante,
  passouDoLimite,
  registrarTentativa,
} from "@/lib/limite";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cadastro de interessados.
 *
 * Só entra por aqui: a tabela leads não aceita gravação pela chave
 * pública (migração 0014), então ninguém pula a validação nem o limite
 * de 5 cadastros a cada 10 minutos por visitante. A gravação usa a chave
 * de serviço, que fica no servidor, e só depois de conferir os campos.
 */

const Esquema = z.object({
  nome: z.string().trim().min(2, "Escreva seu nome completo.").max(160),
  contato: z
    .string()
    .trim()
    .min(8, "Informe um WhatsApp ou telefone com DDD.")
    .max(60),
  profissao: z.string().trim().max(120).optional(),
  renda_mensal: z.string().trim().max(60).optional(),
  valor_entrada: z.string().trim().max(60).optional(),
  empreendimento_id: z.string().uuid().optional().or(z.literal("")),
  unidade_id: z.string().uuid().optional().or(z.literal("")),
  mensagem: z.string().trim().max(2000).optional(),
  origem: z.string().trim().max(200).optional(),
  consentimento: z.literal("on", {
    message: "Precisamos do seu consentimento para entrar em contato.",
  }),
  // Campo escondido que só um robô preenche.
  website: z.string().max(0).optional(),
});

export type EstadoDoFormulario = {
  ok: boolean;
  erro?: string;
};

export async function enviarCadastro(
  _anterior: EstadoDoFormulario,
  dados: FormData,
): Promise<EstadoDoFormulario> {
  const bruto = Object.fromEntries(dados) as Record<string, string>;
  const conferido = Esquema.safeParse(bruto);

  if (!conferido.success) {
    return {
      ok: false,
      erro:
        conferido.error.issues[0]?.message ??
        "Confira os campos e tente de novo.",
    };
  }

  const v = conferido.data;

  // Armadilha para robô: responde como sucesso e não grava nada.
  if (v.website) return { ok: true };

  const ipChave = hash(`ip:${await ipDoVisitante()}`);
  if (await passouDoLimite("cadastro", [{ chave: ipChave, maximo: 5 }], 10)) {
    return {
      ok: false,
      erro: "Recebemos vários cadastros seguidos daqui. Espere alguns minutos ou fale com a gente pelo WhatsApp.",
    };
  }
  await registrarTentativa("cadastro", [ipChave]);

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert({
    nome: v.nome,
    contato: v.contato,
    profissao: v.profissao || null,
    renda_mensal: v.renda_mensal || null,
    valor_entrada: v.valor_entrada || null,
    empreendimento_id: v.empreendimento_id || null,
    unidade_id: v.unidade_id || null,
    mensagem: v.mensagem || null,
    origem: v.origem || null,
    consentimento: true,
  });

  if (error) {
    return {
      ok: false,
      erro: "Não conseguimos enviar o seu cadastro. Confira os campos e tente de novo ou fale com a gente pelo WhatsApp.",
    };
  }

  return { ok: true };
}
