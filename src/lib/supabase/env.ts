/**
 * As variáveis de ambiente do Supabase, com erro legível quando faltam.
 *
 * Sem isto, uma variável ausente vira um erro do supabase-js com a chave
 * "undefined" no meio — difícil de ligar à causa, ainda mais num log de
 * deploy. Aqui a mensagem diz qual variável é e onde ela se define.
 *
 * As NEXT_PUBLIC_ precisam existir já no build, porque as páginas
 * públicas leem o banco para serem geradas. A chave de serviço só é
 * usada em tempo de execução, pelo painel.
 */

function exigir(nome: string, valor: string | undefined): string {
  if (valor) return valor;

  throw new Error(
    `${nome} não está definida. ` +
      "Localmente ela vai no .env.local (veja o .env.example); " +
      "na Vercel, em Settings → Environment Variables.",
  );
}

export function urlDoSupabase(): string {
  // O acesso tem de ser literal: o Next troca process.env.NEXT_PUBLIC_*
  // pelo valor no momento do build, e só reconhece a forma escrita assim.
  return exigir(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function chaveAnonima(): string {
  return exigir(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function chaveDeServico(): string {
  return exigir(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
