import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, CalendarDays, KeyRound } from "lucide-react";

import { CardEmpreendimento } from "@/components/site/card-empreendimento";
import { Palavras } from "@/components/site/palavras";
import { Paragrafos } from "@/components/site/texto";
import { Simbolo } from "@/components/site/logo";
import { BotaoExterno, BotaoLink, Olho, Secao, Titulo } from "@/components/site/ui";
import { listarDestaques, listarMarcos, listarPosts } from "@/lib/queries";
import { lerConfigs, lerEmpresa, lista, txt, bool } from "@/lib/settings";
import { formatarData } from "@/lib/utils";

// As páginas públicas são geradas e revalidadas de hora em hora. O painel
// chama revalidatePath ao salvar, então a CS nunca espera por isso.
export const revalidate = 3600;

export default async function PaginaInicial() {
  const [configs, empresa, destaques, marcos, posts] = await Promise.all([
    lerConfigs([
      "hero",
      "banner_campanha",
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
  const banner = configs.banner_campanha;
  const construtor = configs.construtor;
  const numeros = lista<{ valor: string; texto: string }>(hero, "numeros");
  const imagemHero = txt(hero, "imagem_desktop");

  const ICONES = [CalendarDays, KeyRound, Building2];

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
                <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1" />
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

      {/* ======================================= números, em bento curto */}
      {numeros.length ? (
        <section className="relative z-10 px-5 sm:px-8">
          <div className="mx-auto -mt-14 grid w-full max-w-6xl gap-px overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--borda)] shadow-[var(--sombra-card)] sm:grid-cols-3">
            {numeros.map((numero, i) => {
              const Icone = ICONES[i % ICONES.length];
              return (
                <div
                  key={i}
                  /* Em tela grande estes quadros sobem por cima da foto,
                     dentro da primeira dobra: também entram sem esperar
                     o observador, depois dos botões do topo. */
                  data-entrada
                  style={
                    { "--atraso": `${900 + i * 110}ms` } as React.CSSProperties
                  }
                  className="group relative overflow-hidden bg-[var(--bg-elevado)] p-7 transition-colors duration-700 hover:bg-[var(--color-verde-50)]"
                >
                  {/* O fio do acento cresce no topo do quadro no hover. */}
                  <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--color-acento)] via-[var(--color-ouro-300)] to-transparent transition-transform duration-700 [transition-timing-function:var(--ease-suave)] group-hover:scale-x-100" />
                  <Icone className="h-5 w-5 text-[var(--color-ouro-600)] transition-all duration-700 [transition-timing-function:var(--ease-suave)] group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-[var(--color-acento-forte)]" />
                  <p className="font-display mt-4 text-3xl font-medium tracking-tight transition-colors duration-700 group-hover:text-[var(--acento)]">
                    {numero.valor}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-suave)]">
                    {numero.texto}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ===================================== dobra 2: banner da campanha */}
      {/* A seção da campanha do momento — hoje a Black Friday. Nada aqui
          é fixo no código: título, texto, botão, foto e o próprio
          interruptor saem de site_settings, em Conteúdo do site. Com o
          interruptor desligado a seção não existe na página, e o texto
          fica guardado para a campanha seguinte. */}
      {bool(banner, "ativo") ? (
        <Secao className="pb-0 md:pb-0">
          <div
            data-revelar
            className="relative overflow-hidden rounded-2xl bg-[var(--bg-tinta)] px-7 py-10 sm:px-12 sm:py-14"
          >
            {/* Brilho dourado no canto, o mesmo recurso do topo em dose
                menor: dá calor ao bloco escuro sem pedir atenção. */}
            <div
              aria-hidden
              className="brilho pointer-events-none absolute -top-[30%] -right-[10%] h-[36rem] w-[36rem] rounded-full opacity-50"
            />
            <Simbolo className="pointer-events-none absolute -right-6 -bottom-10 h-48 w-auto text-white/[0.04]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                {txt(banner, "olho") ? (
                  <span className="olho text-[var(--color-ouro-300)] [&::before]:from-[var(--color-acento)] [&::before]:to-[var(--color-ouro-300)]">
                    {txt(banner, "olho")}
                  </span>
                ) : null}

                <Palavras
                  como="p"
                  passo={45}
                  segmentos={[{ texto: txt(banner, "titulo") }]}
                  className="font-display mt-4 text-2xl font-medium text-[var(--color-ouro-300)] sm:text-3xl"
                />

                <p
                  data-revelar
                  data-desfoque
                  style={{ "--atraso": "180ms" } as React.CSSProperties}
                  className="mt-3 leading-relaxed text-white/70"
                >
                  {txt(banner, "texto")}
                </p>

                <BotaoLink
                  href={txt(banner, "botao_url", "/cadastro")}
                  aparencia="claro"
                  className="group mt-7"
                >
                  {txt(banner, "botao")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1" />
                </BotaoLink>
              </div>

              {/* A foto é opcional: sem ela o bloco fica só com o texto e
                  a marca d'água, do jeito que está hoje. */}
              {txt(banner, "imagem") ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl lg:w-80">
                  <Image
                    src={txt(banner, "imagem")}
                    alt=""
                    fill
                    data-quadro
                    sizes="(max-width: 1024px) 100vw, 20rem"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </Secao>
      ) : null}

      {/* ================================= dobra 3: conheça o construtor */}
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
                escalonamento das palavras se perderia no caminho. */}
            <div data-revelar>
              <Olho>A CS</Olho>
            </div>
            <Titulo
              antes="Conheça o"
              destaque="construtor"
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
              <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1" />
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
        <div className="esteira flex w-max gap-10" style={{ "--duracao": "48s" } as React.CSSProperties}>
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

      {/* ================================ dobra 4: destaques */}
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

      {/* ============================= dobra 5: todos os empreendimentos */}
      <Secao className="pt-0 md:pt-0">
        <div
          data-revelar
          className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-8 transition-shadow duration-700 hover:shadow-[var(--sombra-card)] sm:p-12 lg:flex-row lg:items-center"
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
            href={txt(configs.todos_empreendimentos, "botao_url", "/empreendimentos")}
            className="group shrink-0"
          >
            {txt(configs.todos_empreendimentos, "botao")}
            <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1" />
          </BotaoLink>
        </div>
      </Secao>

      {/* ============================================== dobra 6: o blog */}
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
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                data-revelar
                style={{ "--atraso": `${i * 90}ms` } as React.CSSProperties}
                className="group flex flex-col rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-7 transition-all duration-700 [transition-timing-function:var(--ease-suave)] hover:-translate-y-1.5 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-alta)]"
              >
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

                <h3 className="font-display mt-4 text-lg leading-snug font-medium text-balance transition-colors duration-500 group-hover:text-[var(--acento)]">
                  {post.titulo}
                </h3>

                {post.resumo ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--fg-suave)]">
                    {post.resumo}
                  </p>
                ) : null}

                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-[var(--acento)]">
                  Ler publicação
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
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
                href={txt(configs.faixa_contato, "botao_primario_url", "/cadastro")}
                aparencia="claro"
                className="group"
              >
                {txt(configs.faixa_contato, "botao_primario")}
                <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--ease-suave)] group-hover:translate-x-1" />
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
