import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { Cartao, Etiqueta } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/utils";

export default async function ListaBlog() {
  await exigirPerfil();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, titulo, status, categoria, publicado_em, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">Blog</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
            As publicações aparecem na página do blog e nos três cards da
            página inicial, das mais recentes para as mais antigas.
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--acento)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--acento-hover)]"
        >
          <Plus className="h-4 w-4" />
          Nova publicação
        </Link>
      </header>

      <div className="mt-8 space-y-3">
        {posts?.length ? (
          posts.map((post) => (
            <Cartao key={post.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="font-display block truncate font-medium hover:text-[var(--acento)]"
                  >
                    {post.titulo}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Etiqueta
                      tom={post.status === "publicado" ? "verde" : "neutro"}
                    >
                      {post.status === "publicado" ? "No site" : "Rascunho"}
                    </Etiqueta>
                    {post.categoria ? (
                      <span className="text-xs text-[var(--fg-tenue)]">
                        {post.categoria}
                      </span>
                    ) : null}
                    {post.publicado_em ? (
                      <span className="text-xs text-[var(--fg-tenue)]">
                        {formatarData(post.publicado_em)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {post.status === "publicado" ? (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    aria-label="Ver no site"
                    className="rounded-lg border border-[var(--borda)] p-2 text-[var(--fg-tenue)] transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </Cartao>
          ))
        ) : (
          <p className="text-sm text-[var(--fg-tenue)]">
            Nenhuma publicação ainda.
          </p>
        )}
      </div>
    </>
  );
}
