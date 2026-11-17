import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { chaveAnonima, urlDoSupabase } from "@/lib/supabase/env";

/** Cliente para componentes marcados "use client". */
export function createClient() {
  return createBrowserClient<Database>(
    urlDoSupabase(),
    chaveAnonima(),
  );
}
