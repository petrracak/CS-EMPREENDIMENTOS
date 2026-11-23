import { cache } from "react";
import { redirect } from "next/navigation";

import { pode, type Area, type Nivel } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";

export type Perfil = {
  id: string;
  nome: string;
  email: string | null;
  role: Nivel;
  ativo: boolean;
  avatar_url: string | null;
  usuario: string | null;
  /** A conta dona do painel: ninguém rebaixa, suspende ou apaga. */
  principal: boolean;
};

/**
 * Perfil de quem está logado, ou redirecionamento para o login.
 *
 * Envolvida em cache(): o layout e a página chamam isto na mesma
 * requisição, e sem o cache cada uma faria a própria ida ao banco.
 *
 * A identidade vem de getClaims(), que confere a assinatura do token sem
 * ir à rede. Quem decide o acesso é o perfil lido do banco a cada
 * requisição, então desativar alguém vale na hora, sem esperar o token
 * de uma hora expirar.
 */
export const exigirPerfil = cache(async (): Promise<Perfil> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) redirect("/admin/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, nome, email, role, ativo, avatar_url, usuario, principal")
    .eq("id", sub)
    .maybeSingle();

  if (!perfil || !perfil.ativo) redirect("/admin/login?erro=sem-acesso");

  return perfil as Perfil;
});

/**
 * Perfil de quem está logado, se o nível dele abre esta área. Quem não
 * pode volta para o início do painel, onde só vê o que é seu.
 *
 * O banco barra a escrita de novo (public.pode, nas políticas), então
 * isto é a primeira porta, não a única.
 */
export async function exigirArea(area: Area): Promise<Perfil> {
  const perfil = await exigirPerfil();
  if (!pode(perfil.role, area)) redirect("/admin?sem-permissao=1");
  return perfil;
}

export async function exigirAdmin(): Promise<Perfil> {
  return exigirArea("usuarios");
}
