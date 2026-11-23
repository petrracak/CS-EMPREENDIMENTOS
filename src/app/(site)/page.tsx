import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Whatsapp } from "@/components/icones-sociais";
import { FotoDoTopo } from "@/components/site/foto-do-topo";
import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { CardPost } from "@/components/site/card-post";
import { Empilhada } from "@/components/site/empilhada";
import { NumerosBento } from "@/components/site/numeros-bento";
import { IconeAtendimento } from "@/components/site/icone-atendimento";
import { Palavras } from "@/components/site/palavras";
import { Paragrafos } from "@/components/site/texto";
import { Simbolo } from "@/components/site/logo";
import {
  BotaoExterno,
  BotaoLink,
  Olho,
  Secao,
  Titulo,
} from "@/components/site/ui";
import { listarDestaques, listarMarcos, listarPosts } from "@/lib/queries";
import { lerConfigs, lerEmpresa, lista, txt } from "@/lib/settings";
import { partirNumero } from "@/lib/utils";

// As páginas públicas são geradas e revalidadas de hora em hora. O painel
// chama revalidatePath ao salvar, então a CS nunca espera por isso.
export const revalidate = 3600;

export default async function PaginaInicial() {
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
  // A foto do celular é opcional. Sem ela, o celular recebe a do
  // computador cortada no centro; sem a do computador, a do celular
  // serve para os dois.
  const imagemHero =
    txt(hero, "imagem_desktop") || txt(hero, "imagem_mobile");
  const imagemHeroCelular = txt(hero, "imagem_mobile");

  return (
    <>
      {/* ================================================= dobra 1: topo */}
      {/* O cabeçalho é transparente e fica por cima, então a seção sobe
          com margem negativa para a foto começar no alto da página.

          Nada aqui usa data-revelar. A primeira dobra não espera pela
          hidratação: data-entrada é animação de CSS, e já está correndo
          quando o JS termina de carregar.

          É o palco: fica parado (sticky) enquanto a cortina, que é todo
          o resto da página, sobe por cima. Altura mínima de uma tela, e
          não altura fixa — num celular pequeno o texto é mais alto que a
          tela, e altura fixa cortaria os botões. */}
      <section className="sticky top-0 -mt-20 flex min-h-[100svh] items-end overflow-hidden">
        <div className="palco-fundo absolute inset-0">
          {imagemHero ? (
            /* Esta é a maior imagem da primeira tela, a que define o LCP.
               O fetchPriority a põe à frente do resto da fila, que em
               conexão de celular é onde se ganha tempo. A foto cresce 7%
               em 34 s: lento o bastante para a pessoa não ver o
               movimento, só sentir que a imagem não está parada. */
            <FotoDoTopo
              computador={imagemHero}
              celular={imagemHeroCelular}
              className="respirar object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-[var(--color-verde-900)]" />
          )}

          {/* Dois véus. O de baixo segura o texto; o do topo é fraco, só o
              bastante para o menu aparecer. Um véu forte por toda a foto
              deixaria o render esverdeado e sem profundidade. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/92 via-[var(--color-verde-950)]/35 via-55% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-verde-950)]/55 to-transparent" />

          {/* O brilho da marca, atrás do título e por cima do véu. É o
              laranja da logo com o dourado do favicon, muito desfocado e
              passeando em 22 s — luz de fim de tarde, não holofote. */}
          <div
            aria-hidden
            className="brilho pointer-events-none absolute -bottom-[20vh] -left-[15vw] h-[80vh] w-[80vh] rounded-full"
          />

          {/* Escurece a foto conforme a cortina sobe. */}
          <div
            aria-hidden
            className="palco-sombra absolute inset-0 bg-[var(--color-verde-950)]"
          />
        </div>

        {/* O pb leva em conta a cortina, que sobe 2 a 3 rem sobre o pé do
            palco já na primeira tela. */}
        <div className="palco-conteudo relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20 sm:px-8 sm:pt-32 md:pb-28">
          <div className="max-w-3xl">
            <span
              data-entrada
              className="olho text-[var(--color-ouro-300)] [&::before]:from-[var(--color-acento)] [&::before]:to-[var(--color-ouro-300)]"
            >
              {txt(hero, "chamada")}
            </span>

            {/* O título entra palavra por palavra, saindo de um desfoque,
                e a palavra em destaque fica com o dourado varrendo por
                dentro dela depois que assenta. */}
            <Palavras
              como="h1"
              modo="entrada"
              atraso={120}
              passo={60}
              segmentos={[
                { texto: txt(hero, "titulo_antes") },
                { texto: txt(hero, "titulo_destaque"), destaque: "ouro" },
                { texto: txt(hero, "titulo_depois") },
              ]}
              className="font-display text-display-md sm:text-display-lg lg:text-display-xl mt-6 font-medium text-balance text-white"
            />

            <p
              data-entrada
              style={{ "--atraso": "620ms" } as React.CSSProperties}
              className="mt-7 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
            >
              {txt(hero, "subtitulo")}
            </p>

            <div
              data-entrada
              style={{ "--atraso": "760ms" } as React.CSSProperties}
              className="mt-9 flex flex-wrap gap-3"
            >
              <BotaoLink
                href={txt(hero, "botao_primario_url", "/empreendimentos")}
                aparencia="claro"
                className="group"
              >
                {txt(hero, "botao_primario")}
                <ArrowRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1" />
              </BotaoLink>
              <BotaoLink
                href={txt(hero, "botao_secundario_url", "/cadastro")}
                aparencia="contorno"
                className="border-white/30 text-white hover:border-white hover:bg-white/10 hover:text-white"
              >
                {txt(hero, "botao_secundario")}
              </BotaoLink>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================== cortina */}
      {/* Tudo daqui para baixo sobe por cima do palco. A borda da cortina
          é o bento de números, como a faixa de dados da referência. */}
      <div className="cortina">
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
                    antes={txt(construtor, "titulo_antes")}
                    destaque={txt(construtor, "titulo_destaque")}
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

                  <BotaoLink
                    href={txt(construtor, "botao_url", "/empreendimentos")}
                    aparencia="contorno"
                    className="group mt-10"
                  >
                    {txt(construtor, "botao")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1" />
                  </BotaoLink>
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
                  antes="Empreendimentos em"
                  destaque="destaque"
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
                  antes="Todos os"
                  destaque="empreendimentos"
                  atraso={140}
                  className="text-display-sm"
                />
                <p className="mt-4 leading-relaxed text-[var(--fg-suave)]">
                  {txt(configs.todos_empreendimentos, "texto")}
                </p>
              </div>
              <BotaoLink
                href={txt(
                  configs.todos_empreendimentos,
                  "botao_url",
                  "/empreendimentos",
                )}
                className="group shrink-0"
              >
                {txt(configs.todos_empreendimentos, "botao")}
                <ArrowRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1" />
              </BotaoLink>
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
                  antes="Blog da"
                  destaque="CS"
                  atraso={120}
                  className="mt-5"
                />
                <p className="mt-4 leading-relaxed text-[var(--fg-suave)]">
                  {txt(configs.blog_home, "subtitulo")}
                </p>
              </div>
              <Link
                href="/blog"
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
                  segmentos={[{ texto: txt(configs.faixa_contato, "titulo") }]}
                  className="font-display text-display-sm sm:text-display-md font-medium text-balance text-white"
                />
                <p className="mt-5 leading-relaxed text-white/70">
                  {txt(configs.faixa_contato, "texto")}
                </p>
                <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <BotaoLink
                    href={txt(
                      configs.faixa_contato,
                      "botao_primario_url",
                      "/cadastro",
                    )}
                    aparencia="claro"
                    className="group"
                  >
                    {txt(configs.faixa_contato, "botao_primario")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1" />
                  </BotaoLink>
                  <BotaoExterno
                    href={empresa.whatsapp_link}
                    aparencia="contorno"
                    className="border-white/25 text-white hover:border-white hover:bg-white/10 hover:text-white"
                  >
                    <Whatsapp className="h-4 w-4" />
                    {txt(configs.faixa_contato, "botao_secundario")}
                  </BotaoExterno>
                </div>
              </div>
            </div>
          </div>
        </Secao>
      </div>
    </>
  );
}
