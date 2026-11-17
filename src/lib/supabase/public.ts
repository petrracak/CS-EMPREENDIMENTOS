import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { chaveAnonima, urlDoSupabase } from "@/lib/supabase/env";

/**
 * Cliente anônimo, sem cookie.
 *
 * Como não lê a requisição, as páginas públicas que o usam podem ser
 * geradas estaticamente e revalidadas por ISR, em vez de consultar o
 * Supabase a cada acesso. O RLS garante que daqui só sai o que está
 * publicado.
 */
export function createPublicClient() {
  return createClient<Database>(
    urlDoSupabase(),
    chaveAnonima(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
