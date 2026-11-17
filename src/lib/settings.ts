import { createPublicClient } from "@/lib/supabase/public";

/**
 * Conteúdo editável do site.
 *
 * Tudo o que a CS muda sem programador — faixa de campanha, banner,
 * títulos, textos dos botões — vive em site_settings, uma linha por
 * bloco. As páginas leem daqui; o painel escreve.
 */
export type Config = Record<string, unknown>;

export async function lerConfigs(
  chaves: string[],
): Promise<Record<string, Config>> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("chave, valor")
    .in("chave", chaves);

  const mapa: Record<string, Config> = {};
  for (const chave of chaves) mapa[chave] = {};
  for (const linha of data ?? []) {
    mapa[linha.chave] = (linha.valor ?? {}) as Config;
  }
  return mapa;
}

export async function lerConfig(chave: string): Promise<Config> {
  return (await lerConfigs([chave]))[chave];
}

/** Lê um campo de texto da configuração, com reserva se vier vazio. */
export function txt(
  config: Config | undefined,
  campo: string,
  reserva = "",
): string {
  const valor = config?.[campo];
  return typeof valor === "string" && valor.trim() ? valor : reserva;
}

export function bool(config: Config | undefined, campo: string): boolean {
  return config?.[campo] === true;
}

export function lista<T = Record<string, unknown>>(
  config: Config | undefined,
  campo: string,
): T[] {
  const valor = config?.[campo];
  return Array.isArray(valor) ? (valor as T[]) : [];
}

/** Dados da empresa, usados no rodapé, no contato e no JSON-LD. */
export type Empresa = {
  razao_social: string;
  cnpj: string;
  endereco: string;
  email: string;
  whatsapp: string;
  whatsapp_link: string;
  atendimento: string;
  instagram: string;
  facebook: string;
  maps: string;
};

export async function lerEmpresa(): Promise<Empresa> {
  const config = await lerConfig("empresa");
  return {
    razao_social: txt(config, "razao_social"),
    cnpj: txt(config, "cnpj"),
    endereco: txt(config, "endereco"),
    email: txt(config, "email"),
    whatsapp: txt(config, "whatsapp"),
    whatsapp_link: txt(config, "whatsapp_link"),
    atendimento: txt(config, "atendimento"),
    instagram: txt(config, "instagram"),
    facebook: txt(config, "facebook"),
    maps: txt(config, "maps"),
  };
}
