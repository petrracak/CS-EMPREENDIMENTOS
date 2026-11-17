import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";

/**
 * Cliente para Server Components, Route Handlers e Server Actions.
 * Respeita RLS: enxerga o site como o visitante, ou como quem está logado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(paraGravar) {
          try {
            paraGravar.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component não escreve cookie; quem renova a sessão é o proxy.
          }
        },
      },
    },
  );
}
