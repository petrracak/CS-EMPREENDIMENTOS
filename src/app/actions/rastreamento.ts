"use server";

import { revalidatePath } from "next/cache";

import { exigirArea } from "@/lib/auth";
import { lerRastreamento, LIMITE_SCRIPT } from "@/lib/rastreamento";
import { createClient } from "@/lib/supabase/server";

export type EstadoRastreamento = {
  ok?: boolean;
  erro?: string;
  /** Campos preenchidos que não tinham o formato esperado. */
  ignorados?: string[];
};

const ROTULOS: Record<string, string> = {
  meta_pixel: "Pixel do Meta",
  verificacao_meta: "Verificação de domínio do Meta",
  gtm: "Google Tag Manager",
  ga4: "Google Analytics 4",
  google_ads: "Google Ads",
  google_ads_rotulo: "Rótulo de conversão do Google Ads",
  verificacao_google: "Verificação do Google Search Console",
  tiktok: "Pixel do TikTok",
};

export async function salvarRastreamento(
  _anterior: EstadoRastreamento,
  dados: FormData,
): Promise<EstadoRastreamento> {
  const perfil = await exigirArea("tecnico");

  const bruto: Record<string, unknown> = {};
  for (const [campo, valor] of dados.entries()) {
    if (typeof valor === "string") bruto[campo] = valor;
  }
  // O Interruptor manda "false" escondido e "true" quando está ligado.
  bruto.pedir_consentimento = dados
    .getAll("pedir_consentimento")
    .includes("true");

  for (const campo of ["script_head", "script_body"]) {
    if (String(bruto[campo] ?? "").length > LIMITE_SCRIPT) {
      return { erro: "Um dos scripts passou do limite de 20 mil caracteres." };
    }
  }

  const limpo = lerRastreamento(bruto);

  // O que a pessoa preencheu e não tinha formato de identificador é
  // avisado, em vez de sumir em silêncio.
  const ignorados = Object.keys(ROTULOS).filter(
    (campo) =>
      String(bruto[campo] ?? "").trim() !== "" &&
      limpo[campo as keyof typeof limpo] === "",
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      chave: "rastreamento",
      valor: limpo,
      publico: true,
      updated_by: perfil.id,
    });

  if (error) return { erro: "Não conseguimos salvar. Tente de novo." };

  revalidatePath("/", "layout");
  return { ok: true, ignorados: ignorados.map((c) => ROTULOS[c]) };
}
