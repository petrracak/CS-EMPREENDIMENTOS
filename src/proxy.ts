import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão a cada requisição e protege /admin.
 * Server Components não escrevem cookie, então a renovação acontece aqui.
 *
 * Chamava-se `middleware` até o Next 15; no 16 a convenção é `proxy`.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(paraGravar) {
          paraGravar.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          paraGravar.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() confere a assinatura do token localmente. getUser() iria
  // até o Supabase a cada página aberta — uma viagem de ida e volta por
  // clique, sem necessidade.
  const { data } = await supabase.auth.getClaims();
  const logado = data?.claims ?? null;

  const { pathname } = request.nextUrl;
  const painel = pathname.startsWith("/admin");
  const login = pathname === "/admin/login";

  if (painel && !login && !logado) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (login && logado) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
