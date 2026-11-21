import type { Metadata } from "next";

import { CardPost } from "@/components/site/card-post";
import { Olho, Secao, Titulo } from "@/components/site/ui";
import { listarPosts } from "@/lib/queries";

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
            <CardPost
              key={post.id}
              post={post}
              nivel="h2"
              atraso={(i % 3) * 90}
            />
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
