import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Limite de tentativas: login errado e cadastro em série.
 *
 * Toda tentativa passa pelo servidor do site, então o Supabase vê sempre
 * o mesmo IP (o da Vercel) e o limite dele não separa um visitante do
 * outro. O controle fica aqui, na tabela public.tentativas, que só a
 * chave de serviço acessa (migração 0014).
 *
 * O que vai para o banco é um hash: nem o IP nem o e-mail ficam
 * guardados em texto.
 */

type Tipo = "login" | "cadastro";

export function hash(valor: string) {
  return createHash("sha256")
    .update(`cs:${valor.toLowerCase()}`)
    .digest("hex")
    .slice(0, 40);
}

/** O IP de quem fez a requisição (a Vercel põe o real no começo da lista). */
export async function ipDoVisitante() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconhecido"
  );
}

/** Quantas tentativas cada chave teve na janela. */
async function contar(tipo: Tipo, chave: string, minutos: number) {
  const desde = new Date(Date.now() - minutos * 60_000).toISOString();
  const { count } = await createAdminClient()
    .from("tentativas")
    .select("id", { count: "exact", head: true })
    .eq("tipo", tipo)
    .eq("chave", chave)
    .gte("criado_em", desde);
  return count ?? 0;
}

/** true se alguma das chaves já passou do limite na janela. */
export async function passouDoLimite(
  tipo: Tipo,
  regras: { chave: string; maximo: number }[],
  minutos: number,
) {
  const contagens = await Promise.all(
    regras.map((r) => contar(tipo, r.chave, minutos)),
  );
  return contagens.some((n, i) => n >= regras[i].maximo);
}

export async function registrarTentativa(tipo: Tipo, chaves: string[]) {
  const admin = createAdminClient();
  await admin
    .from("tentativas")
    .insert(chaves.map((chave) => ({ tipo, chave })));
  // Faxina: o que tem mais de um dia não serve para nada.
  await admin
    .from("tentativas")
    .delete()
    .lt("criado_em", new Date(Date.now() - 86_400_000).toISOString());
}

/** Login certo zera os erros daquela conta. */
export async function limparTentativas(tipo: Tipo, chave: string) {
  await createAdminClient()
    .from("tentativas")
    .delete()
    .eq("tipo", tipo)
    .eq("chave", chave);
}
