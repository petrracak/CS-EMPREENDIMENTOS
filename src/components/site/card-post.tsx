import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";

import { CartaoVivo } from "@/components/site/cartao-vivo";
import { cn, formatarData } from "@/lib/utils";

type Post = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_url: string | null;
  categoria: string | null;
  publicado_em: string | null;
};

/**
 * Card de publicação do blog, o mesmo na página inicial e na listagem.
 *
 * Segue a regra de estrutura do card de empreendimento: entrada no
 * invólucro, hover no CartaoVivo, data-quadro na moldura da capa. Ver o
 * comentário em card-empreendimento.tsx para o porquê.
 */
export function CardPost({
  post,
  atraso = 0,
  nivel: Titulo = "h3",
  className,
}: {
  post: Post;
  atraso?: number;
  nivel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      data-revelar
      style={{ "--atraso": `${atraso}ms` } as React.CSSProperties}
      className={cn("h-full", className)}
    >
      <CartaoVivo className="h-full">
        <Link
          href={`/blog/${post.slug}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)]"
        >
          {post.capa_url ? (
            <div
              data-quadro
              className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-fundo)]"
            >
              <Image
                src={post.capa_url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-[transform,filter] duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.06] group-hover:brightness-[1.04]"
              />
              <span
                aria-hidden
                className="absolute right-4 bottom-4 grid h-10 w-10 scale-75 -rotate-45 place-items-center rounded-full bg-white text-[var(--color-verde-900)] opacity-0 shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-[transform,opacity] duration-[800ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100"
              >
                <ArrowUpRightIcon size={16} weight="bold" />
              </span>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-tenue)]">
              {post.categoria ? (
                <span className="rounded-full bg-[var(--bg-fundo)] px-2.5 py-1 font-medium text-[var(--fg-suave)]">
                  {post.categoria}
                </span>
              ) : null}
              <time dateTime={post.publicado_em ?? undefined}>
                {formatarData(post.publicado_em)}
              </time>
            </div>

            <Titulo className="font-display mt-4 text-lg leading-snug font-medium text-balance transition-colors duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:text-[var(--acento)]">
              {post.titulo}
            </Titulo>

            {post.resumo ? (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--fg-suave)]">
                {post.resumo}
              </p>
            ) : null}

            <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-[var(--acento)]">
              Ler publicação
              <ArrowUpRightIcon
                size={16}
                weight="bold"
                className="transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </span>
          </div>
        </Link>
      </CartaoVivo>
    </div>
  );
}
