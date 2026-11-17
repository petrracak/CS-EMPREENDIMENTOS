import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { chaveDeServico, urlDoSupabase } from "@/lib/supabase/env";

/**
 * Cliente com a chave de serviço: ignora RLS.
 *
 * Só para o que o painel não consegue fazer como usuário comum — criar
 * conta de acesso e enviar arquivo para o Storage em nome de outra
 * pessoa. O "server-only" acima faz o build quebrar se alguém importar
 * este arquivo em um componente de cliente, que é como uma chave dessas
 * vaza para o navegador.
 */
export function createAdminClient() {
  return createClient<Database>(
    urlDoSupabase(),
    chaveDeServico(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
