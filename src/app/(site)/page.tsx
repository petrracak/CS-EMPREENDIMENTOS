import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { CardEmpreendimento } from "@/components/site/card-empreendimento";
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
import { formatarData, partirNumero } from "@/lib/utils";

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
  const numeros = lista<{ valor: string; texto: string }>(hero, "numeros");
  const imagemHero = txt(hero, "imagem_desktop");

  return (
    <>
      {/* ================================================= dobra 1: topo */}
      {/* O cabeçalho é transparente e fica por cima, então a seção sobe
          com margem negativa para a foto começar no alto da página.

          Nada aqui usa data-revelar. A primeira dobra não espera pela
          hidratação: data-entrada é animação de CSS, e já está correndo
          quando o JS termina de carregar. */}
      <section className="relative -mt-20 flex min-h-[94svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          {imagemHero ? (
            <Image
              src={imagemHero}
              alt=""
              fill
              priority
              /* Esta é a maior imagem da primeira tela, a que define o
                 LCP. O `priority` já adianta o download; o fetchPriority
                 diz ao navegador para colocá-la à frente do resto da
                 fila, que em conexão de celular é onde se ganha tempo. */
              fetchPriority="high"
              sizes="100vw"
              /* A foto cresce 7% em 34 s. É lento o bastante para a
                 pessoa não ver o movimento, só sentir que a imagem não
                 está parada. */
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

          {/* Grade fina por cima do véu: dá medida à foto, como a marcação
              de uma planta. A máscara apaga as linhas no céu e no pé. */}
          <div aria-hidden className="linhas absolute inset-0" />

          {/* O brilho da marca, atrás do título e por cima do véu. É o
              laranja da logo com o dourado do favicon, muito desfocado e
              passeando em 22 s — luz de fim de tarde, não holofote. */}
          <div
            aria-hidden
            className="brilho pointer-events-none absolute -bottom-[20vh] -left-[15vw] h-[80vh] w-[80vh] rounded-full"
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-32 pb-16 sm:px-8 md:pb-20">
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

      {/* ============================================ a régua de números */}
      {/* Antes isto eram três cartões iguais, cada um com um ícone em
          cima do número. É o desenho que todo gerador entrega, e lia
          como tal. Agora é uma régua: uma superfície só, dividida por
          fios de um pixel, com o numeral em corpo grande carregando a
          tipografia e o rótulo pequeno embaixo. Sem ícone nenhum — o
          ícone genérico é justamente o que denunciava o bloco.

          As colunas têm larguras diferentes, acompanhando o tamanho de
          cada rótulo, porque três colunas idênticas é o outro sinal de
          grade automática. */}
      {numeros.length ? (
        <section className="relative z-10 px-5 sm:px-8">
          <div className="mx-auto -mt-16 w-full max-w-6xl overflow-hidden rounded-2xl bg-[var(--bg-elevado)] shadow-[var(--sombra-alta)]">
            {/* Fio da marca atravessando o topo da régua. */}
            <div
              aria-hidden
              className="h-0.5 w-full bg-gradient-to-r from-[var(--color-acento)] via-[var(--color-ouro-300)] to-transparent"
            />

            <div className="grid divide-y divide-[var(--borda)] sm:grid-cols-[1fr_0.9fr_1.3fr] sm:divide-x sm:divide-y-0">
              {numeros.map((numero, i) => {
                const {
                  antes,
                  numero: valor,
                  depois,
                } = partirNumero(numero.valor);
                return (
                  <div
                    key={i}
                    data-entrada
                    style={
                      {
                        "--atraso": `${900 + i * 120}ms`,
                      } as React.CSSProperties
                    }
                    className="group relative px-7 py-8 sm:px-8 sm:py-10"
                  >
                    {/* Índice de dois dígitos, como numeração de prancha. */}
                    <span className="tabular text-[0.625rem] font-semibold tracking-[0.2em] text-[var(--color-ouro-600)] transition-colors duration-700 group-hover:text-[var(--color-acento-forte)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <p className="font-display mt-5 flex items-baseline gap-2 font-medium">
                      {antes ? (
                        <span className="text-lg text-[var(--fg-tenue)]">
                          {antes}
                        </span>
                      ) : null}
                      <span className="tabular text-5xl leading-none tracking-[-0.045em] sm:text-6xl">
                        {valor}
                      </span>
                      {depois ? (
                        <span className="text-lg text-[var(--fg-tenue)]">
                          {depois}
                        </span>
                      ) : null}
                    </p>

                    {/* O fio embaixo do número cresce devagar no hover. */}
                    <span
                      aria-hidden
                      className="mt-5 block h-px w-10 origin-left bg-gradient-to-r from-[var(--color-acento)] to-[var(--borda-forte)] transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-x-[4]"
                    />

                    <p className="mt-4 max-w-[28ch] text-[0.8125rem] leading-[1.65] text-[var(--fg-suave)]">
                      {numero.texto}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================= dobra 2: conheça o construtor */}
      <Secao>
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <div data-revelar className="lg:sticky lg:top-28">
            {/* A foto do Girlan ainda será produzida. Enquanto não chega,
                o espaço vira um bloco da marca em vez de um vazio. */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-verde-900)]">
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
              <Paragrafos texto={txt(construtor, "texto")} className="mt-7" />
            </div>

            {/* ------------------------------------------ linha do tempo */}
            {marcos.length ? (
              <ol className="mt-12 space-y-0">
                {marcos.map((marco, i) => (
                  <li
                    key={marco.id}
                    data-revelar
                    style={{ "--atraso": `${i * 70}ms` } as React.CSSProperties}
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
            <div key={volta} className="flex shrink-0 items-center gap-10">
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
            <CardEmpreendimento key={item.id} item={item} atraso={i * 90} />
          ))}
        </div>
      </Secao>

      {/* ============================= dobra 4: todos os empreendimentos */}
      <Secao className="pt-0 md:pt-0">
        <div
          data-revelar
          className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-8 transition-shadow duration-[1100ms] [transition-timing-function:var(--ease-lento)] hover:shadow-[var(--sombra-card)] sm:p-12 lg:flex-row lg:items-center"
        >
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
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--acento)]"
            >
              {txt(configs.blog_home, "botao")}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                data-revelar
                style={{ "--atraso": `${i * 90}ms` } as React.CSSProperties}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] transition-all duration-[1100ms] [transition-timing-function:var(--ease-lento)] hover:-translate-y-2 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-alta)]"
              >
                {/* A capa do post, no mesmo recorte da listagem do blog.
                    Sem capa o card começa pelo texto, sem buraco. */}
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

                  <h3 className="font-display mt-4 text-lg leading-snug font-medium text-balance transition-colors duration-[900ms] [transition-timing-function:var(--ease-lento)] group-hover:text-[var(--acento)]">
                    {post.titulo}
                  </h3>

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
        </Secao>
      ) : null}

      {/* ========================================== faixa de contato */}
      <Secao className="pt-0 md:pt-0">
        <div
          data-revelar
          className="relative overflow-hidden rounded-2xl bg-[var(--bg-tinta)] px-7 py-14 text-center sm:px-12 md:py-20"
        >
          <Simbolo className="pointer-events-none absolute -top-16 -left-10 h-64 w-auto text-white/[0.03]" />
          <div className="relative mx-auto max-w-2xl">
            {/* O headset com as ondas em laço. É a única coisa em
                movimento contínuo nesta dobra, então ele carrega o
                convite sozinho, sem precisar de mais nada. */}
            <IconeAtendimento
              className="mx-auto mb-7 text-[var(--color-ouro-300)]"
              data-entrada
            />

            <Palavras
              como="h2"
              passo={50}
              segmentos={[{ texto: txt(configs.faixa_contato, "titulo") }]}
              className="font-display text-display-sm sm:text-display-md font-medium text-balance text-white"
            />
            <p
              data-revelar
              data-desfoque
              style={{ "--atraso": "260ms" } as React.CSSProperties}
              className="mt-5 leading-relaxed text-white/65"
            >
              {txt(configs.faixa_contato, "texto")}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
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
                {txt(configs.faixa_contato, "botao_secundario")}
              </BotaoExterno>
            </div>
          </div>
        </div>
      </Secao>
    </>
  );
}
