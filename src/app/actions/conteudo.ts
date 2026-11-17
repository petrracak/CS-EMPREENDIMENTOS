"use server";

import { revalidatePath } from "next/cache";

import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoSalvo = { ok?: boolean; erro?: string };

/**
 * Salva um bloco de conteúdo do site.
 *
 * O formulário manda campos achatados ("numeros.0.valor"), e aqui eles
 * voltam a ser objeto e lista antes de virar jsonb. Assim cada tela do
 * painel é um formulário comum, sem editor de JSON na cara da Carolina.
 */
export async function salvarConteudo(
  _anterior: EstadoSalvo,
  dados: FormData,
): Promise<EstadoSalvo> {
  const perfil = await exigirPerfil();

  const chave = String(dados.get("__chave") ?? "");
  if (!chave) return { erro: "Bloco não identificado." };

  const valor = montarObjeto(dados);

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    // O tipo gerado do Supabase descreve jsonb como uma união fechada
    // (Json), e um objeto montado em tempo de execução não encaixa nela.
    // O conteúdo é sempre texto, booleano, lista ou nulo — ver normalizar().
    .update({ valor: valor as never, updated_by: perfil.id })
    .eq("chave", chave);

  if (error) return { erro: "Não conseguimos salvar. Tente de novo." };

  // O site inteiro lê estes blocos (cabeçalho, rodapé, faixa), então a
  // revalidação é do layout, não de uma rota só.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * "titulo" -> { titulo }
 * "numeros.0.valor" -> { numeros: [ { valor } ] }
 * Caixa marcada vira true; caixa desmarcada não vem no FormData, então o
 * formulário manda um campo escondido com o mesmo nome e valor "false".
 */
function montarObjeto(dados: FormData): Record<string, unknown> {
  const raiz: Record<string, unknown> = {};

  for (const [campo, bruto] of dados.entries()) {
    if (campo.startsWith("__") || bruto instanceof File) continue;

    const texto = String(bruto);
    const partes = campo.split(".");
    let atual: Record<string, unknown> = raiz;

    for (let i = 0; i < partes.length - 1; i++) {
      const parte = partes[i];
      const proximo = partes[i + 1];
      const ehLista = /^\d+$/.test(proximo);

      if (!(parte in atual) || typeof atual[parte] !== "object") {
        atual[parte] = ehLista ? [] : {};
      }
      atual = atual[parte] as Record<string, unknown>;
    }

    const ultima = partes[partes.length - 1];
    atual[ultima] = normalizar(texto);
  }

  return raiz;
}

function normalizar(texto: string): unknown {
  if (texto === "true") return true;
  if (texto === "false") return false;
  if (texto === "") return null;
  return texto;
}
