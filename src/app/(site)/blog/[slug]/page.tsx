import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ConteudoBlog } from "@/components/site/conteudo-blog";
import { BotaoExterno, BotaoLink, Secao } from "@/components/site/ui";
import { lerPost, listarSlugsPosts } from "@/lib/queries";
import { lerEmpresa } from "@/lib/settings";
import { formatarData, textoUtil } from "@/lib/utils";
import { DadosEstruturados } from "@/components/site/dados-estruturados";
import { SITE_URL, absoluta, trilha } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listarSlugsPosts();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await lerPost(slug);
  if (!post) return {};

  const descricao = textoUtil(post.seo_descricao) ?? textoUtil(post.resumo) ?? undefined;
  const imagem = absoluta(post.capa_url);
  return {
    title: textoUtil(post.seo_titulo) ?? post.titulo,
    description: descricao,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.titulo,
      description: descricao,
      url: `/blog/${post.slug}`,
      publishedTime: post.publicado_em ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      ...(imagem ? { images: [{ url: imagem, alt: post.titulo }] } : {}),
    },
  };
}

export default async function PaginaPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, empresa] = await Promise.all([lerPost(slug), lerEmpresa()]);

  if (!post) notFound();

  const dados = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titulo,
      description: textoUtil(post.resumo) ?? undefined,
      image: absoluta(post.capa_url),
      datePublished: post.publicado_em ?? undefined,
      dateModified: post.updated_at ?? post.publicado_em ?? undefined,
      inLanguage: "pt-BR",
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
      author: { "@id": `${SITE_URL}/#empresa` },
      publisher: { "@id": `${SITE_URL}/#empresa` },
      articleSection: post.categoria ?? undefined,
    },
    trilha([
      { nome: "Início", caminho: "/" },
      { nome: "Blog", caminho: "/blog" },
      { nome: post.titulo, caminho: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <article>
      <DadosEstruturados dados={dados} />
      <Secao className="pt-14 pb-0 md:pt-20 md:pb-0">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="group -my-2.5 inline-flex items-center gap-1.5 py-2.5 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--acento)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
            Voltar para o blog
          </Link>

          <div data-revelar className="mt-8">
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

            <h1 className="font-display text-display-sm sm:text-display-md mt-5 font-medium text-balance">
              {post.titulo}
            </h1>

            {post.resumo ? (
              <p className="mt-5 text-lg leading-relaxed text-[var(--fg-suave)]">
                {post.resumo}
              </p>
            ) : null}
          </div>

          {post.capa_url ? (
            <div
              data-revelar
              className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--bg-fundo)]"
            >
              <Image
                src={post.capa_url}
                alt={post.titulo}
                fill
                priority
                data-quadro
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </Secao>

      <Secao>
        <div data-revelar className="mx-auto max-w-3xl">
          <ConteudoBlog conteudo={post.conteudo} />
        </div>
      </Secao>

      {/* ------------------------------------------ chamada do fim do post */}
      <Secao className="pt-0 md:pt-0">
        <div
          data-revelar
          className="mx-auto max-w-3xl rounded-2xl bg-[var(--bg-tinta)] px-7 py-10 sm:px-10"
        >
          <p className="font-display text-xl font-medium text-white">
            Quer conhecer os empreendimentos da CS?
          </p>
          <p className="mt-3 leading-relaxed text-white/65">
            Veja os projetos e fale com a nossa equipe.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <BotaoLink href="/empreendimentos">Ver empreendimentos</BotaoLink>
            <BotaoExterno
              href={empresa.whatsapp_link}
              aparencia="claro"
              icone="zap"
            >
              Falar no WhatsApp
            </BotaoExterno>
          </div>
        </div>
      </Secao>
    </article>
  );
}
