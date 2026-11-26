import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Abertura } from "@/components/site/abertura";
import { BotaoNovo } from "@/components/site/botao-novo";
import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { CardPost } from "@/components/site/card-post";
import { IconeAtendimento } from "@/components/site/icone-atendimento";
import { Palavras } from "@/components/site/palavras";
import { Simbolo } from "@/components/site/logo";
import { TextoRico, Trecho } from "@/components/site/texto-rico";
import { TopoNovo } from "@/components/site/topo-novo";
import { Olho, Secao, Titulo } from "@/components/site/ui";
import {
  listarDestaques,
  listarEmpreendimentos,
  listarMarcos,
  listarPosts,
} from "@/lib/queries";
import type { Metadata } from "next";

import { DadosEstruturados } from "@/components/site/dados-estruturados";
import { perguntasFrequentes } from "@/lib/seo";
import { lerConfig } from "@/lib/settings";
import { lerConfigs, lerEmpresa, lista, txt } from "@/lib/settings";
import { lerTitulo } from "@/lib/texto-rico";
import { fotosDaVitrine } from "@/lib/vitrine";
import { partirNumero } from "@/lib/utils";

// As páginas públicas são geradas e revalidadas de hora em hora. O painel
// chama revalidatePath ao salvar, então a CS nunca espera por isso.
export const revalidate = 3600;

/** Título e descrição do bloco "Como o site aparece no Google" do painel. */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await lerConfig("seo");
  const titulo = txt(seo, "titulo");
  const descricao = txt(seo, "descricao");
  return {
    ...(titulo ? { title: { absolute: titulo } } : {}),
    ...(descricao ? { description: descricao } : {}),
    alternates: { canonical: "/" },
  };
}

export default async function PaginaInicial() {
  const [configs, empresa, destaques, marcos, posts, vitrine, todas] =
    await Promise.all([
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
      fotosDaVitrine(),
      listarEmpreendimentos(),
    ]);

  const hero = configs.hero;
  const construtor = configs.construtor;

  // Perguntas frequentes: as respostas saem dos dados do painel (endereço,
  // horário, WhatsApp, empreendimentos em obra), então nunca ficam velhas.
  // É o tipo de trecho que o Google e as IAs citam direto na resposta.
  const emObra = todas.filter((e) => e.situacao !== "entregue");
  const juntar = (nomes: string[]) =>
    nomes.length > 1
      ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`
      : (nomes[0] ?? "");
  const minuscula = (t: string) => (t ? t[0].toLowerCase() + t.slice(1) : t);
  const perguntas = [
    {
      pergunta: "Onde fica a CS Empreendimentos?",
      resposta: `O escritório da CS fica na ${empresa.endereco}.${empresa.atendimento ? ` O atendimento é de ${minuscula(empresa.atendimento).replace(/^de /, "")}` : ""}`,
    },
    {
      pergunta: "Desde quando a CS constrói em Santarém?",
      resposta:
        "Desde 2016. A CS começou com quatro casas feitas em parceria e, até 2026, já entregou 140 unidades em Santarém, entre casas e apartamentos.",
    },
    ...(emObra.length
      ? [
          {
            pergunta: "Quais empreendimentos da CS estão em obra agora?",
            resposta: `${juntar(
              emObra.map((e) =>
                e.bairro ? `${e.nome}, no ${e.bairro}` : e.nome,
              ),
            )}. Cada um tem página própria no site, com fotos, plantas, ficha técnica e as unidades disponíveis.`,
          },
        ]
      : []),
    {
      pergunta: "Que tipo de imóvel a CS constrói?",
      resposta:
        "Casas em condomínio fechado, apartamentos, flats e terrenos em Santarém, no Pará. A CS é construtora e incorporadora: projeta, constrói e vende os próprios empreendimentos.",
    },
    {
      pergunta: "Dá para comprar um imóvel da CS na planta?",
      resposta:
        "Sim. As unidades dos empreendimentos em obra podem ser compradas antes da entrega, com as condições apresentadas pela equipe comercial. O registro de incorporação e os documentos de cada projeto ficam à disposição de quem pedir.",
    },
    {
      pergunta: "Como falar com um consultor da CS?",
      resposta: `Pelo WhatsApp ${empresa.whatsapp}, pelo e-mail ${empresa.email} ou pelo cadastro do site. Um consultor entra em contato com as opções que fazem sentido para o seu perfil.`,
    },
  ];

  // A linha do tempo mora no bloco do fundador, no painel. A tabela
  // marcos é a de antes, e só vale enquanto o bloco não tiver nenhuma.
  const doPainel = lista<{ ano?: string | null; texto?: string | null }>(
    construtor,
    "marcos",
  )
    .filter((m) => m.ano?.trim())
    .map((m, i) => ({
      id: `${i}-${m.ano}`,
      ano: m.ano!.trim(),
      texto: m.texto ?? "",
    }));
  const linhaDoTempo = doPainel.length ? doPainel : marcos;

  return (
    <div className="pagina-inicial">
      <Abertura />

      {/* ================================================= dobra 1: topo */}
      <TopoNovo
        chamada={txt(
          hero,
          "chamada",
          "Construtora e incorporadora em Santarém",
        )}
        titulo={lerTitulo(
          hero,
          "titulo",
          "Há <mark>10 anos</mark> construindo <mark>lares</mark> em Santarém",
        )}
        subtitulo={<Trecho html={txt(hero, "subtitulo")} />}
        botaoPrimario={txt(
          hero,
          "botao_primario",
          "Conheça nossos empreendimentos",
        )}
        botaoPrimarioUrl={txt(hero, "botao_primario_url", "/empreendimentos")}
        botaoSecundario={txt(
          hero,
          "botao_secundario",
          "Falar com um consultor",
        )}
        whatsapp={txt(hero, "botao_secundario_url") || empresa.whatsapp_link}
        fotos={vitrine}
      />

      {/* Ordem da página inicial: destaques e todos os empreendimentos, o
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
                    className="font-display flex items-center gap-10 text-lg font-medium whitespace-nowrap text-[#46695a]"
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
        <div className="secao-clara">
          {/* ================================ dobra 3: destaques */}
          <Secao>
            <div className="max-w-2xl">
              <span data-revelar className="olho">
                {txt(configs.destaques, "olho", "Em obra agora")}
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
                <Trecho html={txt(configs.destaques, "subtitulo")} />
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
                    <Trecho
                      html={txt(configs.todos_empreendimentos, "texto")}
                    />
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
            <Secao className="blog-verde">
              <div
                data-revelar
                className="flex flex-wrap items-end justify-between gap-6"
              >
                <div className="max-w-xl">
                  <Olho>{txt(configs.blog_home, "olho", "Blog")}</Olho>
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
                    <Trecho
                      html={txt(configs.blog_home, "subtitulo")}
                      forte="text-white"
                    />
                  </p>
                </div>
                <Link
                  prefetch={false}
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
                    src={txt(construtor, "foto", "/site/girlan-fundador.webp")}
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
                  <Olho>
                    {txt(construtor, "olho", "Quem está por trás da CS")}
                  </Olho>
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
                  <TextoRico
                    html={txt(construtor, "texto")}
                    className="mt-7 leading-relaxed text-[var(--fg-suave)]"
                  />
                </div>

                {/* ------------------------------------------ linha do tempo */}
                {linhaDoTempo.length ? (
                  <ol className="mt-12 space-y-0">
                    {linhaDoTempo.map((marco, i) => {
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

          {/* ===================================== perguntas frequentes */}
          <Secao className="pt-0 md:pt-0">
            <DadosEstruturados dados={perguntasFrequentes(perguntas)} />
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div data-revelar>
                <Olho>Perguntas frequentes</Olho>
                <Titulo
                  antes="O que perguntam"
                  destaque="sobre a CS"
                  className="mt-5"
                />
              </div>
              <div className="divide-y divide-[var(--borda)] border-y border-[var(--borda)]">
                {perguntas.map((p) => (
                  <details key={p.pergunta} className="pergunta group py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.0625rem] text-[#28513f] [&::-webkit-details-marker]:hidden">
                      {p.pergunta}
                      <span
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--borda)] text-[#00552f] transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="pr-12 pb-5 leading-relaxed text-[var(--fg-suave)]">
                      {p.resposta}
                    </p>
                  </details>
                ))}
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
                    <Trecho
                      html={txt(configs.faixa_contato, "texto")}
                      forte="text-white"
                    />
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
