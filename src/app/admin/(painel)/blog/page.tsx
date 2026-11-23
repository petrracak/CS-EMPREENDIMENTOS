import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "lucide-react";

import { classeBotao } from "@/components/admin/estilos";
import { Cabecalho, Cartao, Etiqueta, Vazio } from "@/components/admin/ui";
import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/utils";

export default async function ListaBlog() {
  await exigirArea("blog");
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, titulo, status, categoria, publicado_em, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Blog"
        descricao="As publicações aparecem na página do blog e nos três cards da página inicial, das mais recentes para as mais antigas."
        acoes={
          <Link href="/admin/blog/novo" className={classeBotao("principal", "hidden sm:inline-flex")}>
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Nova publicação
          </Link>
        }
      />

      <div className="space-y-3">
        {posts?.length ? (
          posts.map((post) => (
            <Cartao key={post.id} className="p-4 pl-5 transition-[border-color] duration-300 hover:border-[var(--borda-forte)]">
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
                    className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                  </Link>
                ) : null}
              </div>
            </Cartao>
          ))
        ) : (
          <Vazio
            icone={<FileText className="h-6 w-6" strokeWidth={1.5} />}
            titulo="Nenhuma publicação ainda"
            texto="Escreva a primeira para ela aparecer no blog e na página inicial."
            acao={
              <Link href="/admin/blog/novo" className={classeBotao()}>
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Nova publicação
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
