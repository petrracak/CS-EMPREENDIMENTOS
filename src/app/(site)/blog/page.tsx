import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { Olho, Secao, Titulo } from "@/components/site/ui";
import { listarPosts } from "@/lib/queries";
import { formatarData } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Novidades da CS, evolução das obras e dicas para quem quer comprar um imóvel em Santarém.",
};

export default async function PaginaBlog() {
  const posts = await listarPosts();

  return (
    <Secao className="pt-14 md:pt-20">
      <div data-revelar className="max-w-2xl">
        <Olho>Conteúdo</Olho>
        <Titulo
          nivel="h1"
          antes="Blog da"
          destaque="CS"
          className="text-display-md sm:text-display-lg mt-5"
        />
        <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
          Novidades, evolução das obras e dicas para quem quer comprar a casa
          própria em Santarém.
        </p>
      </div>

      {posts.length ? (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              data-revelar
              style={{ "--atraso": `${(i % 3) * 90}ms` } as React.CSSProperties}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] transition-all duration-500 [transition-timing-function:var(--ease-saida)] hover:-translate-y-1 hover:shadow-[var(--sombra-card)]"
            >
              {post.capa_url ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-fundo)]">
                  <Image
                    src={post.capa_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[2000ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.07]"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-7">
                <div className="flex items-center gap-3 text-xs text-[var(--fg-tenue)]">
                  {post.categoria ? (
                    <span className="rounded-full bg-[var(--bg-fundo)] px-2.5 py-1 font-medium text-[var(--fg-suave)]">
                      {post.categoria}
                    </span>
                  ) : null}
                  <time dateTime={post.publicado_em ?? undefined}>
                    {formatarData(post.publicado_em)}
                  </time>
                </div>

                <h2 className="font-display mt-4 text-lg leading-snug font-medium text-balance transition-colors duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:text-[var(--acento)]">
                  {post.titulo}
                </h2>

                {post.resumo ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--fg-suave)]">
                    {post.resumo}
                  </p>
                ) : null}

                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-[var(--acento)]">
                  Ler publicação
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-14 text-[var(--fg-suave)]">
          Ainda não há publicações. Volte em breve.
        </p>
      )}
    </Secao>
  );
}
