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
 *
 * O tom "escuro" é o do blog da página inicial, sobre o verde da marca: o card é um
 * verde mais fundo, a capa esfuma nele em vez de acabar num corte reto,
 * e os detalhes vão para o dourado. O "claro" é o de sempre.
 */
export function CardPost({
  post,
  atraso = 0,
  nivel: Titulo = "h3",
  tom = "claro",
  className,
}: {
  post: Post;
  atraso?: number;
  nivel?: "h2" | "h3";
  tom?: "claro" | "escuro";
  className?: string;
}) {
  const escuro = tom === "escuro";
  return (
    <div
      data-revelar
      style={{ "--atraso": `${atraso}ms` } as React.CSSProperties}
      className={cn("h-full", className)}
    >
      <CartaoVivo className="h-full">
        <Link
          prefetch={false}
          href={`/blog/${post.slug}`}
          data-cursor="Ler"
          className={cn(
            "group flex h-full flex-col overflow-hidden rounded-2xl border",
            escuro
              ? "border-white/10 bg-[#01331d]"
              : "border-[var(--borda)] bg-[var(--bg-elevado)]",
          )}
        >
          {post.capa_url ? (
            <div
              data-quadro
              // No escuro, a moldura tem a cor do card: ela termina em
              // meio pixel, e com o card subindo e a foto crescendo no
              // hover o fundo claro aparecia como um fio piscando na
              // borda de baixo da capa.
              className={cn(
                "relative aspect-[16/10] overflow-hidden",
                escuro ? "bg-[#01331d]" : "bg-[var(--bg-fundo)]",
              )}
            >
              <Image
                src={post.capa_url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-[transform,filter] duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.06] group-hover:brightness-[1.04]"
              />
              {escuro ? (
                // A capa desce para a cor do card: o texto começa dentro
                // do esfumado, sem linha entre foto e conteúdo.
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-3/5 bg-gradient-to-t from-[#01331d] via-[#01331d]/60 to-transparent"
                />
              ) : null}
              <span
                aria-hidden
                className={cn(
                  "absolute right-4 grid h-10 w-10 scale-75 -rotate-45 place-items-center rounded-full bg-white text-[var(--color-verde-900)] opacity-0 shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-[transform,opacity] duration-[800ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100",
                  // No escuro a seta vai para o alto da capa: embaixo é o esfumado com o texto.
                  escuro ? "top-4" : "bottom-4",
                )}
              >
                <ArrowUpRightIcon size={16} weight="bold" />
              </span>
            </div>
          ) : null}

          <div
            className={cn(
              "relative flex flex-1 flex-col p-6 sm:p-7",
              escuro && "-mt-14 pt-0 sm:pt-0",
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 text-xs",
                escuro ? "text-white/55" : "text-[var(--fg-tenue)]",
              )}
            >
              {post.categoria ? (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-medium",
                    escuro
                      ? "bg-[#f3d694]/12 text-[var(--color-ouro-300)] backdrop-blur-sm"
                      : "bg-[var(--bg-fundo)] text-[var(--fg-suave)]",
                  )}
                >
                  {post.categoria}
                </span>
              ) : null}
              <time dateTime={post.publicado_em ?? undefined}>
                {formatarData(post.publicado_em)}
              </time>
            </div>

            <Titulo
              className={cn(
                "font-display mt-4 text-lg leading-snug font-medium text-balance transition-colors duration-[900ms] [transition-timing-function:var(--ease-lento)]",
                escuro
                  ? "text-white group-hover:text-[var(--color-ouro-300)]"
                  : "group-hover:text-[var(--acento)]",
              )}
            >
              {post.titulo}
            </Titulo>

            {post.resumo ? (
              <p
                className={cn(
                  "mt-3 line-clamp-3 text-sm leading-relaxed",
                  escuro ? "text-white/65" : "text-[var(--fg-suave)]",
                )}
              >
                {post.resumo}
              </p>
            ) : null}

            <span
              className={cn(
                "mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium",
                escuro
                  ? "text-[var(--color-ouro-300)]"
                  : "text-[var(--acento)]",
              )}
            >
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
