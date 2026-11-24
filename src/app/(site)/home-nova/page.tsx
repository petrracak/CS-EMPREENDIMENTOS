import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Abertura } from "@/components/site/abertura";
import { BotaoNovo } from "@/components/site/botao-novo";
import { GradienteContinuo } from "@/components/site/gradiente-continuo";
import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { CardPost } from "@/components/site/card-post";
import { IconeAtendimento } from "@/components/site/icone-atendimento";
import { Palavras } from "@/components/site/palavras";
import { Simbolo } from "@/components/site/logo";
import { TopoNovo } from "@/components/site/topo-novo";
import { Olho, Secao, Titulo } from "@/components/site/ui";
import { listarDestaques, listarMarcos, listarPosts } from "@/lib/queries";
import { lerConfigs, lerEmpresa, txt } from "@/lib/settings";
import { lerTitulo } from "@/lib/texto-rico";
import { partirNumero } from "@/lib/utils";

// Cópia da página inicial para o redesenho (Figma). A home de verdade,
// em app/(site)/page.tsx, não muda enquanto esta estiver em teste.
//
// As páginas públicas são geradas e revalidadas de hora em hora. O painel
// chama revalidatePath ao salvar, então a CS nunca espera por isso.
export const revalidate = 3600;

/*
 * A copy desta página foi revista para soar menos automática: sem
 * travessão nem dois-pontos, com negrito nas partes que importam. Fica
 * aqui, e não no painel, enquanto a página é teste; a home atual segue
 * lendo os textos de lá. Quando esta virar a home, a copy vai para o
 * painel (que vai precisar aceitar negrito nos parágrafos).
 */
const MARCOS_REVISTOS: Record<string, string> = {
  "2016": "Começo da CS, com quatro casas feitas em parceria.",
  "2017":
    "Sete casas na Rua Raimundo Xavier, no Maracanã. A primeira obra que o Girlan tocou sozinho.",
  "2023": "Entrega do Flat Premium I, com 60 unidades.",
  "2026":
    "140 unidades entregues e o House Premium em obra, com entrega no início de 2027.",
};

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

  return (
    <div className="home-nova">
      <Abertura />
      <GradienteContinuo />

      {/* ================================================= dobra 1: topo */}
      {/* O redesenho do Figma. Os textos estão aqui, e não no painel,
          enquanto a página é teste: o bloco "hero" do painel continua
          servindo a home atual. Quando esta virar a home, voltam a sair
          de lá. */}
      <TopoNovo
        chamada={txt(
          hero,
          "chamada",
          "Construtora e incorporadora em Santarém",
        )}
        titulo="Há <mark>10 anos</mark> construindo <mark>lares</mark> em Santarém"
        subtitulo={
          <>
            Casas, apartamentos e terrenos com{" "}
            <strong>projeto bem pensado</strong> e{" "}
            <strong>acabamento de qualidade</strong>. Veja o que está em obra e
            o que já entregamos.
          </>
        }
        botaoPrimario="Conheça nossos empreendimentos"
        botaoPrimarioUrl={txt(hero, "botao_primario_url", "/empreendimentos")}
        botaoSecundario="Falar com um consultor"
        whatsapp={empresa.whatsapp_link}
      />

      {/* Ordem da home nova: destaques e todos os empreendimentos, o
          blog e só então o Girlan. Os números da segunda dobra saíram
          por enquanto. */}
      <div>
        {/* ============================================ esteira de palavras */}
        {/* O mesmo recurso da referência: uma faixa que corre devagar e
          separa dois blocos pesados sem pedir atenção. */}
        <div
          aria-hidden
          className="overflow-hidden border-b border-[var(--borda)] bg-[var(--bg-fundo)] py-5"
        >
          {/* Seis voltas iguais, e a faixa anda metade (três voltas):
              nesse ponto ela está idêntica ao começo e recomeça sem
              salto. Com duas voltas, numa tela larga a metade era mais
              estreita que a tela e o fim da faixa aparecia vazio. Cada
              volta termina com o próprio espaço (pr-10), e não com gap
              entre elas, para as voltas medirem exatamente o mesmo. */}
          <div
            className="esteira flex w-max"
            style={{ "--duracao": "144s" } as React.CSSProperties}
          >
            {Array.from({ length: 6 }).map((_, volta) => (
              <div
                key={volta}
                className="flex shrink-0 items-center gap-10 pr-10"
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

        {/* Do menta para o branco: o menta fica no topo e na faixa, e a
            partir dos destaques o fundo clareia até o branco. */}
        <div className="home-nova-claro">
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
                Acompanhe o que está <strong>saindo do chão</strong> em Santarém
                neste momento.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((item, i) => (
                <CardEmpreendimento key={item.id} item={item} atraso={i * 90} />
              ))}
            </div>
          </Secao>

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
                    Os projetos em obra e os já entregues, cada um com{" "}
                    <strong>as suas unidades</strong>, de casas e apartamentos a
                    terrenos.
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
          {/* No verde da marca, com o destaque em dourado. Os cards são os
            mesmos da listagem, na versão escura: a capa esfuma no fundo
            do card em vez de terminar num corte reto. */}
          {posts.length ? (
            <Secao className="home-nova-blog">
              <div
                data-revelar
                className="flex flex-wrap items-end justify-between gap-6"
              >
                <div className="max-w-xl">
                  <Olho>Blog</Olho>
                  <Palavras
                    como="h2"
                    html={lerTitulo(
                      configs.blog_home,
                      "titulo",
                      "Blog da <mark>CS</mark>",
                    )}
                    tom="ouro"
                    atraso={120}
                    className="font-display text-display-sm sm:text-display-md mt-5 text-balance text-white"
                  />
                  <p className="mt-4 leading-relaxed text-white/70">
                    O andamento das obras, as novidades da CS e{" "}
                    <strong className="text-white">
                      dicas para quem quer comprar imóvel em Santarém
                    </strong>
                    .
                  </p>
                </div>
                <Link
                  href={txt(configs.blog_home, "botao_url", "/blog")}
                  className="group -my-2.5 inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-[var(--color-ouro-300)] transition-colors hover:text-[var(--color-ouro-100)]"
                >
                  {txt(configs.blog_home, "botao")}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <CardPost
                    key={post.id}
                    post={post}
                    atraso={i * 90}
                    tom="escuro"
                  />
                ))}
              </div>
            </Secao>
          ) : null}

          {/* ================================= sobre o Girlan */}
          <Secao>
            <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
              <div data-revelar className="lg:sticky lg:top-28">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src="/home-nova/girlan-fundador.webp"
                    alt="Girlan Carneiro, fundador da CS Empreendimentos"
                    fill
                    data-quadro
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                {/* O olho entra inteiro; o título entra palavra por palavra.
                Se os dois fossem data-revelar, o bloco subiria junto e o
                escalonamento das palavras se perderia no caminho.

                Nada aqui é fixo: olho, título e a palavra em destaque saem
                de site_settings. Se a CS trocar de fundador, de nome ou de
                discurso, muda no painel. */}
                <div data-revelar>
                  <Olho>Quem está por trás da CS</Olho>
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
                  <div className="mt-7 space-y-4 leading-relaxed text-[var(--fg-suave)]">
                    <p>
                      Em 2016, o Girlan Carneiro estava procurando uma casa para
                      comprar. Rodou a cidade, visitou projeto por projeto e{" "}
                      <strong>não encontrou nada no padrão que queria</strong>.
                      Foi aí que percebeu que, se estava difícil para ele,
                      estava difícil para muita gente.
                    </p>
                    <p>
                      No fim daquele ano, um amigo o chamou para construir em
                      parceria num terreno dele. Saíram quatro casas, e o Girlan
                      nunca mais saiu do ramo. Em 2017 ele comprou um terreno na
                      Rua Raimundo Xavier, no Maracanã, e levantou sete casas.
                      Foi{" "}
                      <strong>
                        o primeiro empreendimento que tocou sozinho
                      </strong>
                      .
                    </p>
                    <p>
                      Depois vieram os outros. Em 2023 a CS entregou o Flat
                      Premium, com 60 unidades, e até 2026 já são{" "}
                      <strong>140 unidades entregues</strong>. Agora está em
                      obra o maior projeto da empresa, o{" "}
                      <strong>House Premium, com 100 casas</strong> e entrega
                      prevista para o início de 2027.
                    </p>
                    <p>
                      A regra continua a mesma do começo.{" "}
                      <strong>Construir algo que dure</strong> e fazer o melhor
                      por quem escolhe morar num imóvel da CS.
                    </p>
                  </div>
                </div>

                {/* ------------------------------------------ linha do tempo */}
                {marcos.length ? (
                  <ol className="mt-12 space-y-0">
                    {marcos.map((original, i) => {
                      const marco = {
                        ...original,
                        texto: MARCOS_REVISTOS[original.ano] ?? original.texto,
                      };
                      return (
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
                      );
                    })}
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
                <div
                  aria-hidden
                  className="linhas absolute inset-0 opacity-70"
                />
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
                    Conte o que você procura e um consultor da CS te mostra{" "}
                    <strong className="text-white">
                      as opções que fazem sentido para você
                    </strong>
                    .
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
    </div>
  );
}
