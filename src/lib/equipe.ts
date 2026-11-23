/**
 * Usuário de acesso ao painel.
 *
 * Toda conta tem um usuário (carolina, joao.silva), e o login aceita ele
 * ou o e-mail. O Supabase Auth exige um e-mail, então quem não tem um
 * ganha um endereço interno, derivado do usuário: ele nunca recebe
 * mensagem, só identifica a conta. Por isso a senha dessas contas é
 * trocada por um administrador, no painel, e não por "esqueci a senha".
 */

export const DOMINIO_INTERNO = "equipe.csstm.com.br";

/** O mesmo formato que o banco aceita (profiles_usuario_formato). */
export const FORMATO_USUARIO = /^[a-z0-9][a-z0-9._-]{1,38}[a-z0-9]$/;

/** "Maria Souza" -> "maria.souza" */
export function usuarioDe(nome: string) {
  return nome
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 40);
}

export function emailInterno(usuario: string) {
  return `${usuario}@${DOMINIO_INTERNO}`;
}

export function ehEmailInterno(email: string | null | undefined) {
  return Boolean(email?.toLowerCase().endsWith(`@${DOMINIO_INTERNO}`));
}
