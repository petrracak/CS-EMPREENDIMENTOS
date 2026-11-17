"use server";

import { exigirPerfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guarda no Storage as duas versões que o navegador preparou.
 *
 * Usa a chave de serviço porque o envio vem de uma Server Action, onde a
 * sessão do Supabase Storage não acompanha o cookie. O acesso é conferido
 * antes, por exigirPerfil: quem não tem perfil ativo nem chega aqui.
 */
export type RespostaEnvio = { caminho?: string; erro?: string };

const TAMANHO_MAXIMO = 8 * 1024 * 1024;

export async function enviarImagem(dados: FormData): Promise<RespostaEnvio> {
  await exigirPerfil();

  const grande = dados.get("grande");
  const pequena = dados.get("pequena");
  const pasta = String(dados.get("pasta") ?? "diversos");
  const nome = String(dados.get("nome") ?? "");

  if (!(grande instanceof File) || !(pequena instanceof File)) {
    return { erro: "Arquivo inválido." };
  }
  if (grande.size > TAMANHO_MAXIMO) {
    return { erro: "A imagem ficou grande demais. Tente outra foto." };
  }
  if (!/^[a-z0-9-]+$/.test(nome) || !/^[a-z0-9/-]+$/.test(pasta)) {
    return { erro: "Nome de arquivo inválido." };
  }

  const supabase = createAdminClient();
  const caminho = `${pasta}/${nome}.webp`;

  const envios = await Promise.all([
    supabase.storage
      .from("midia")
      .upload(caminho, grande, { contentType: "image/webp", upsert: true }),
    supabase.storage
      .from("midia")
      .upload(`${pasta}/${nome}-sm.webp`, pequena, {
        contentType: "image/webp",
        upsert: true,
      }),
  ]);

  if (envios.some((e) => e.error)) {
    return { erro: "Não conseguimos enviar a imagem. Tente de novo." };
  }

  return { caminho };
}

/** Remove as duas versões de uma foto. */
export async function apagarImagem(caminho: string): Promise<void> {
  await exigirPerfil();
  const supabase = createAdminClient();
  await supabase.storage
    .from("midia")
    .remove([caminho, caminho.replace(/\.webp$/, "-sm.webp")]);
}
