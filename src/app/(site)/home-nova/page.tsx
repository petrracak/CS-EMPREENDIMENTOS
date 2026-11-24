import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Abertura } from "@/components/site/abertura";
import { BotaoNovo } from "@/components/site/botao-novo";
import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { CardPost } from "@/components/site/card-post";
import { Empilhada } from "@/components/site/empilhada";
import { NumerosBento } from "@/components/site/numeros-bento";
import { IconeAtendimento } from "@/components/site/icone-atendimento";
import { Palavras } from "@/components/site/palavras";
import { Paragrafos } from "@/components/site/texto";
import { Simbolo } from "@/components/site/logo";
import { TopoNovo } from "@/components/site/topo-novo";
import {
  Olho,
  Secao,
  Titulo,
} from "@/components/site/ui";
import { listarDestaques, listarMarcos, listarPosts } from "@/lib/queries";
import { lerConfigs, lerEmpresa, lista, txt } from "@/lib/settings";
import { lerTitulo } from "@/lib/texto-rico";
import { partirNumero } from "@/lib/utils";

// Cópia da página inicial para o redesenho (Figma). A home de verdade,
// em app/(site)/page.tsx, não muda enquanto esta estiver em teste.
//
// As páginas públicas são geradas e revalidadas de hora em hora. O painel
// chama revalidatePath ao salvar, então a CS nunca espera por isso.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home nova (teste)",
  // Página de teste do redesenho: fora do Google até virar a home.
  robots: { index: false, follow: false },
};

export default async function HomeNova() {
  const [configs, empresa, destaques, marcos, posts] = await Promise.all([
    lerConfigs([
      "hero",
      "construtor",
      "destaques",
      "todos_empreendimentos",
      "blog_home",
      "faixa_contato",
    ]),
    lerEmpresa(),
    listarDestaques(3),
    listarMarcos(),
    listarPosts(3),
  ]);

  const hero = configs.hero;
  const construtor = configs.construtor;
  const numeros = lista<{
    valor: string;
    texto: string;
    icone?: string | null;
    imagem?: string | null;
  }>(hero, "numeros");

  return (
    <div className="home-nova">
      <Abertura />

      {/* ================================================= dobra 1: topo */}
      {/* O redesenho do Figma. Os textos estão aqui, e não no painel,
          enquanto a página é teste: o bloco "hero" do painel continua
          servindo a home atual. Quando esta virar a home, voltam a sair
          de lá. */}
      <TopoNovo
        chamada={txt(hero, "chamada", "Construtora e incorporadora em Santarém")}
        titulo="Há <mark>10 anos</mark> construindo <mark>lares</mark> em Santarém"
        subtitulo={txt(hero, "subtitulo")}
        botaoPrimario="Conheça nossos empreendimentos"
        botaoPrimarioUrl={txt(hero, "botao_primario_url", "/empreendimentos")}
        botaoSecundario="Falar com um consultor"
        whatsapp={empresa.whatsapp_link}
      />

      {/* O topo novo não é palco preso: o resto da página vem logo
          abaixo dele, sem a cortina subindo por cima. */}
      <div>
        <section className="px-5 pt-5 sm:px-8 sm:pt-6">
          <NumerosBento numeros={numeros} />
        </section>

        {/* ================================= dobra 2: conheça o construtor */}
        {/* A dobra do Girlan fica presa quando o pé dela chega ao pé da
          tela, e a esteira com os destaques sobe por cima dela — o
          empilhamento da referência. Os dois ficam num invólucro só
          para a seção presa soltar quando os destaques terminarem. */}
        <div className="area-empilhada">
          <Empilhada>
            <Secao>
              <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
                <div data-revelar className="lg:sticky lg:top-28">
                  {/* A foto do Girlan ainda será produzida. Enquanto não chega,
                o espaço vira um bloco da marca em vez de um vazio. */}
                  <div
                    className={
                      txt(construtor, "foto")
                        ? "relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-verde-900)]"
                        : // Sem a foto do Girlan, o espaço reservado não pode
                          // ocupar uma tela inteira de verde vazio no
                          // celular. Lá ele vira uma faixa; ao lado do texto,
                          // no computador, mantém o formato do retrato.
                          "relative aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--color-verde-900)] lg:aspect-[4/5]"
                    }
                  >
                    {txt(construtor, "foto") ? (
                      <Image
                        src={txt(construtor, "foto")}
                        alt={txt(construtor, "legenda")}
                        fill
                        data-quadro
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--color-verde-800)] to-[var(--color-verde-950)]">
                        <Simbolo className="h-24 w-auto text-white/10" />
                      </div>
                    )}
                  </div>
                  {txt(construtor, "legenda") ? (
                    <p className="mt-4 text-sm text-[var(--fg-tenue)]">
                      {txt(construtor, "legenda")}
                    </p>
                  ) : null}
                </div>

                <div>
                  {/* O olho entra inteiro; o título entra palavra por palavra.
                Se os dois fossem data-revelar, o bloco subiria junto e o
                escalonamento das palavras se perderia no caminho.

                Nada aqui é fixo: olho, título e a palavra em destaque saem
                de site_settings. Se a CS trocar de fundador, de nome ou de
                discurso, muda no painel. */}
                  <div data-revelar>
                    <Olho>{txt(construtor, "olho", "A CS")}</Olho>
                  </div>
                  <Titulo
                    html={lerTitulo(construtor)}
                    atraso={120}
                    className="mt-5"
                  />

                  <div
                    data-revelar
                    data-desfoque
                    style={{ "--atraso": "220ms" } as React.CSSProperties}
                  >
                    <Paragrafos
                      texto={txt(construtor, "texto")}
                      className="mt-7"
                    />
                  </div>

                  {/* ------------------------------------------ linha do tempo */}
                  {marcos.length ? (
                    <ol className="mt-12 space-y-0">
                      {marcos.map((marco, i) => (
                        <li
                          key={marco.id}
                          data-revelar
                          style={
                            { "--atraso": `${i * 70}ms` } as React.CSSProperties
                          }
                          className="group relative grid grid-cols-[4.5rem_1fr] gap-5 border-t border-[var(--borda)] py-5"
                        >
                          <span className="font-display tabular text-sm font-semibold text-[var(--color-ouro-600)]">
                            {marco.ano}
                          </span>
                          <span className="text-sm leading-relaxed text-[var(--fg-suave)]">
                            {marco.texto}
                          </span>
                          {/* O traço do acento cresce da esquerda no hover. */}
                          <span className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--color-acento)] via-[var(--color-ouro-300)] to-transparent transition-transform duration-700 [transition-timing-function:var(--ease-suave)] group-hover:scale-x-100" />
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  <BotaoNovo
                    href={txt(construtor, "botao_url", "/empreendimentos")}
                    className="mt-10"
                  >
                    {txt(construtor, "botao")}
                  </BotaoNovo>
                </div>
              </div>
            </Secao>
          </Empilhada>

          <div className="sobrepor">
            {/* ============================================ esteira de palavras */}
            {/* O mesmo recurso da referência: uma faixa que corre devagar e
          separa dois blocos pesados sem pedir atenção. */}
            <div
              aria-hidden
              className="overflow-hidden border-y border-[var(--borda)] bg-[var(--bg-fundo)] py-5"
            >
              <div
                className="esteira flex w-max gap-10"
                style={{ "--duracao": "48s" } as React.CSSProperties}
              >
                {Array.from({ length: 2 }).map((_, volta) => (
                  <div
                    key={volta}
                    className="flex shrink-0 items-center gap-10"
                  >
                    {[
                      "Casas",
                      "Condomínio fechado",
                      "Flats",
                      "Terrenos",
                      "Apartamentos",
                      "Santarém, Pará",
                    ].map((palavra) => (
                      <span
                        key={palavra}
                        className="font-display flex items-center gap-10 text-lg font-medium whitespace-nowrap text-[var(--fg-tenue)]"
                      >
                        {palavra}
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-acento)]" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ================================ dobra 3: destaques */}
            <Secao>
              <div className="max-w-2xl">
                <span data-revelar className="olho">
                  Em obra agora
                </span>
                <Titulo
                  html={lerTitulo(
                    configs.destaques,
                    "titulo",
                    "Empreendimentos em <mark>destaque</mark>",
                  )}
                  atraso={120}
                  className="mt-5"
                />
                <p
                  data-revelar
                  data-desfoque
                  style={{ "--atraso": "300ms" } as React.CSSProperties}
                  className="mt-4 leading-relaxed text-[var(--fg-suave)]"
                >
                  {txt(configs.destaques, "subtitulo")}
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destaques.map((item, i) => (
                  <CardEmpreendimento
                    key={item.id}
                    item={item}
                    atraso={i * 90}
                  />
                ))}
              </div>
            </Secao>
          </div>
        </div>

        {/* ============================= dobra 4: todos os empreendimentos */}
        <Secao className="pt-0 md:pt-0">
          <div data-revelar>
            <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-8 transition-shadow duration-[1100ms] [transition-timing-function:var(--ease-lento)] hover:shadow-[var(--sombra-card)] sm:p-12 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <Titulo
                  html={lerTitulo(
                    configs.todos_empreendimentos,
                    "titulo",
                    "Todos os <mark>empreendimentos</mark>",
                  )}
                  atraso={140}
                  className="text-display-sm"
                />
                <p className="mt-4 leading-relaxed text-[var(--fg-suave)]">
                  {txt(configs.todos_empreendimentos, "texto")}
                </p>
              </div>
              <BotaoNovo
                href={txt(
                  configs.todos_empreendimentos,
                  "botao_url",
                  "/empreendimentos",
                )}
                className="shrink-0"
              >
                {txt(configs.todos_empreendimentos, "botao")}
              </BotaoNovo>
            </div>
          </div>
        </Secao>

        {/* ============================================== dobra 5: o blog */}
        {posts.length ? (
          <Secao className="pt-0 md:pt-0">
            <div
              data-revelar
              className="flex flex-wrap items-end justify-between gap-6"
            >
              <div className="max-w-xl">
                <Olho>Conteúdo</Olho>
                <Titulo
                  html={lerTitulo(
                    configs.blog_home,
                    "titulo",
                    "Blog da <mark>CS</mark>",
                  )}
                  atraso={120}
                  className="mt-5"
                />
                <p className="mt-4 leading-relaxed text-[var(--fg-suave)]">
                  {txt(configs.blog_home, "subtitulo")}
                </p>
              </div>
              <Link
                href={txt(configs.blog_home, "botao_url", "/blog")}
                className="group -my-2.5 inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-[var(--acento)]"
              >
                {txt(configs.blog_home, "botao")}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <CardPost key={post.id} post={post} atraso={i * 90} />
              ))}
            </div>
          </Secao>
        ) : null}

        {/* ========================================== faixa de contato */}
        {/* Três camadas de luz sobre o verde mais escuro da marca: a aurora
            vindo do alto à direita, um brilho quente subindo da esquerda e
            a grade fina do topo da página, que fecha a página com o mesmo
            gesto com que ela abre. O `isolate` segura o modo de mistura da
            aurora dentro do bloco. */}
        <Secao className="pt-0 md:pt-0">
          <div data-revelar>
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--color-verde-950)] px-6 py-16 text-center sm:px-12 md:py-24">
              <div aria-hidden className="aurora" />
              <div
                aria-hidden
                className="brilho pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full opacity-70"
              />
              <div aria-hidden className="linhas absolute inset-0 opacity-70" />
              <Simbolo className="pointer-events-none absolute -bottom-10 -left-8 h-56 w-auto text-white/[0.04]" />

              <div className="relative mx-auto max-w-2xl">
                <IconeAtendimento className="mx-auto mb-8" />

                <Palavras
                  como="h2"
                  passo={50}
                  html={lerTitulo(configs.faixa_contato)}
                  tom="ouro"
                  className="font-display text-display-sm sm:text-display-md font-medium text-balance text-white"
                />
                <p className="mt-5 leading-relaxed text-white/70">
                  {txt(configs.faixa_contato, "texto")}
                </p>
                <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <BotaoNovo
                    href={txt(
                      configs.faixa_contato,
                      "botao_primario_url",
                      "/cadastro",
                    )}
                  >
                    {txt(configs.faixa_contato, "botao_primario")}
                  </BotaoNovo>
                  <BotaoNovo
                    href={
                      txt(configs.faixa_contato, "botao_secundario_url") ||
                      empresa.whatsapp_link
                    }
                    tipo="secundario"
                    icone="zap"
                    className="sobre-escuro"
                  >
                    {txt(configs.faixa_contato, "botao_secundario")}
                  </BotaoNovo>
                </div>
              </div>
            </div>
          </div>
        </Secao>
      </div>
    </div>
  );
}
