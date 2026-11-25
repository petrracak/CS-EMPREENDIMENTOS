import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Navigation,
  UserRound,
} from "lucide-react";

import { Whatsapp } from "@/components/icones-sociais";
import { Palavras } from "@/components/site/palavras";
import { Galeria } from "@/components/site/galeria";
import { FormularioCurto } from "@/components/site/formulario-lead";
import { Simbolo } from "@/components/site/logo";
import { Paragrafos } from "@/components/site/texto";
import { Unidades } from "@/components/site/unidades";
import {
  BotaoExterno,
  BotaoLink,
  Olho,
  Secao,
  Selo,
  Titulo,
} from "@/components/site/ui";
import {
  lerEmpreendimento,
  listarParaSelecao,
  listarSlugs,
} from "@/lib/queries";
import { lerEmpresa } from "@/lib/settings";
import { SITUACOES, formatarValor, textoUtil } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listarSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await lerEmpreendimento(slug);
  if (!item) return {};

  return {
    title: textoUtil(item.seo_titulo) ?? item.nome,
    description:
      textoUtil(item.seo_descricao) ??
      textoUtil(item.frase_impacto) ??
      undefined,
    openGraph: item.imagem_principal
      ? { images: [{ url: item.imagem_principal }] }
      : undefined,
  };
}

export default async function PaginaEmpreendimento({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, empresa, empreendimentos] = await Promise.all([
    lerEmpreendimento(slug),
    lerEmpresa(),
    listarParaSelecao(),
  ]);

  if (!item) notFound();

  const situacao = SITUACOES[item.situacao as keyof typeof SITUACOES];
  const galeria = item.imagens.filter((i) => i.categoria === "galeria");
  const plantas = item.imagens.filter((i) => i.categoria === "planta");
  const local = [item.endereco, item.bairro, item.cidade]
    .filter(Boolean)
    .join(", ");

  // A ficha técnica se monta só com o que existe. A regra da copy é clara:
  // campo vazio, zerado ou pendente não aparece — nem o rótulo.
  const ficha: { rotulo: string; valor: string }[] = [
    { rotulo: "Tipo", valor: item.tipo?.nome ?? "" },
    { rotulo: "Situação", valor: situacao?.rotulo ?? "" },
    { rotulo: "Localização", valor: local },
    { rotulo: "Unidades", valor: textoUtil(item.unidades_total) ?? "" },
    { rotulo: "Área construída", valor: textoUtil(item.area_construida) ?? "" },
    {
      rotulo: "Área do terreno",
      valor:
        textoUtil(item.terreno_dimensoes) && textoUtil(item.terreno_area)
          ? `${item.terreno_dimensoes} (${item.terreno_area})`
          : (textoUtil(item.terreno_dimensoes) ??
            textoUtil(item.terreno_area) ??
            ""),
    },
    { rotulo: "Distribuição", valor: textoUtil(item.distribuicao) ?? "" },
    { rotulo: "Vagas", valor: textoUtil(item.vagas) ?? "" },
    {
      rotulo: "Previsão de entrega",
      valor: textoUtil(item.previsao_entrega) ?? "",
    },
    {
      rotulo: "Valor a partir de",
      valor: formatarValor(item.valor_a_partir_de) ?? "",
    },
    {
      rotulo: "Registro de incorporação",
      valor: textoUtil(item.registro_incorporacao) ?? "",
    },
  ].filter((linha) => linha.valor);

  return (
    <>
      {/* ============================================ bloco 1: abertura */}
      {/* O palco, como na página inicial: parado enquanto o resto da
          ficha sobe por cima. Ver .cortina em globals.css. */}
      <section className="sticky top-0 -mt-20 flex min-h-[100svh] items-end overflow-hidden">
        <div className="palco-fundo absolute inset-0">
          {item.imagem_principal ? (
            <Image
              src={item.imagem_principal}
              alt={item.nome}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="respirar object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-verde-800)] to-[var(--color-verde-950)]" />
          )}
          {/* Esta página tem mais texto sobre a foto que a inicial — selo,
              logo, frase e subtítulo. Em vez de escurecer a foto inteira,
              que apagaria o render, o véu vem de dois lados: de baixo e da
              esquerda, que é onde o texto fica. O lado direito da imagem
              continua limpo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/92 via-[var(--color-verde-950)]/35 via-55% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-verde-950)]/80 via-[var(--color-verde-950)]/25 via-45% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-verde-950)]/50 to-transparent" />

          {/* O mesmo brilho da página inicial, para o topo das duas ter
              o mesmo gesto. A foto fica limpa, sem grade por cima. */}
          <div
            aria-hidden
            className="brilho pointer-events-none absolute -bottom-[25vh] -left-[18vw] h-[75vh] w-[75vh] rounded-full"
          />
          <div
            aria-hidden
            className="palco-sombra absolute inset-0 bg-[var(--color-verde-950)]"
          />
        </div>

        <div className="palco-conteudo relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20 sm:px-8 sm:pt-32 md:pb-28">
          {/* Primeira dobra: data-entrada em vez do observador, senão o
              nome do empreendimento só aparece depois da hidratação. */}
          <div className="max-w-3xl">
            <div data-entrada className="flex flex-wrap items-center gap-4">
              <Selo tipo={item.situacao}>{situacao?.rotulo}</Selo>
              {local ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/65">
                  <MapPin className="h-3.5 w-3.5" />
                  {local}
                </span>
              ) : null}
            </div>

            {/* A logo própria do empreendimento, quando existe, entra no
                lugar do nome escrito — é assim que a CS apresenta cada
                projeto no material impresso. */}
            {item.logo_url ? (
              <div
                data-entrada
                style={{ "--atraso": "120ms" } as React.CSSProperties}
                className="relative mt-7 h-20 w-56 sm:h-24 sm:w-72"
              >
                <Image
                  src={item.logo_url}
                  alt={item.nome}
                  fill
                  className="object-contain object-left"
                />
              </div>
            ) : null}

            {/* Com logo, o nome fica só para leitor de tela; sem logo, é
                ele que entra palavra por palavra. */}
            {item.logo_url ? (
              <h1 className="sr-only">{item.nome}</h1>
            ) : (
              <Palavras
                como="h1"
                modo="entrada"
                atraso={140}
                passo={60}
                segmentos={[{ texto: item.nome }]}
                className="font-display text-display-md sm:text-display-lg mt-6 font-medium text-balance text-white"
              />
            )}

            {item.frase_impacto ? (
              <Palavras
                como="p"
                modo="entrada"
                atraso={320}
                passo={45}
                segmentos={[{ texto: item.frase_impacto }]}
                className="font-display mt-6 max-w-2xl text-2xl leading-snug font-medium text-balance text-white sm:text-3xl"
              />
            ) : null}

            {item.subtitulo ? (
              <p
                data-entrada
                style={{ "--atraso": "620ms" } as React.CSSProperties}
                className="mt-4 max-w-xl leading-relaxed text-white/70"
              >
                {item.subtitulo}
              </p>
            ) : null}

            <div
              data-entrada
              style={{ "--atraso": "760ms" } as React.CSSProperties}
              className="mt-8 flex flex-wrap gap-3"
            >
              <BotaoLink href="#cadastro">
                {textoUtil(item.botao_primario) ?? "Quero atendimento"}
              </BotaoLink>
              <BotaoExterno
                href={empresa.whatsapp_link}
                aparencia="claro"
                icone="zap"
              >
                {textoUtil(item.botao_secundario) ?? "Falar no WhatsApp"}
              </BotaoExterno>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ cortina */}
      <div className="cortina">
        {/* ===================== blocos 2 e 3: apresentação, conceito, ficha */}
        <Secao>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.75fr] lg:gap-16">
            <div>
              {item.sobre ? (
                <div data-revelar>
                  <Olho>O projeto</Olho>
                  <Titulo
                    antes="Sobre o"
                    destaque="empreendimento"
                    className="mt-5"
                  />
                  <Paragrafos texto={item.sobre} className="mt-7" />
                </div>
              ) : null}

              {item.conceito ? (
                <div data-revelar className="mt-14">
                  <h3 className="font-display text-xl font-medium">
                    O conceito
                  </h3>
                  <Paragrafos texto={item.conceito} className="mt-4" />
                </div>
              ) : null}

              {item.historia ? (
                <div data-revelar className="mt-10">
                  <h3 className="font-display text-xl font-medium">
                    A história do projeto
                  </h3>
                  <Paragrafos texto={item.historia} className="mt-4" />
                </div>
              ) : null}
            </div>

            {/* --------------------------------------------- ficha técnica */}
            {ficha.length ? (
              <aside
                data-revelar
                className="h-fit rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-7 lg:sticky lg:top-28"
              >
                <h2 className="font-display text-lg font-medium">
                  Características do imóvel
                </h2>
                <dl className="mt-5 divide-y divide-[var(--borda)]">
                  {ficha.map((linha) => (
                    <div key={linha.rotulo} className="py-3.5">
                      <dt className="text-xs tracking-wide text-[var(--fg-tenue)] uppercase">
                        {linha.rotulo}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-[var(--fg)]">
                        {linha.valor}
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </Secao>

        {/* =============================== bloco 4: características e mais */}
        {item.caracteristicas.length || item.diferenciais.length ? (
          <Secao className="pt-0 md:pt-0">
            <div className="grid gap-10 md:grid-cols-2 md:gap-14">
              {item.caracteristicas.length ? (
                <div data-revelar>
                  <h2 className="font-display text-2xl font-medium">
                    Características do imóvel
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {item.caracteristicas.map((c) => (
                      <li key={c.id} className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-verde-600)]" />
                        <span className="leading-relaxed text-[var(--fg-suave)]">
                          {c.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {item.diferenciais.length ? (
                <div
                  data-revelar
                  style={{ "--atraso": "90ms" } as React.CSSProperties}
                >
                  <h2 className="font-display text-2xl font-medium">
                    Diferenciais
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {item.diferenciais.map((d) => (
                      <li key={d.id} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-acento)]"
                        />
                        <span className="leading-relaxed text-[var(--fg-suave)]">
                          {d.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Secao>
        ) : null}

        {/* ================================== bloco 5: planta e imagens */}
        {galeria.length ? (
          <Secao className="pt-0 md:pt-0">
            <div data-revelar className="max-w-2xl">
              <Olho>O projeto por dentro</Olho>
              <Titulo antes="Imagens" className="mt-5" />
              {item.legenda_galeria ? (
                <p className="mt-4 text-sm text-[var(--fg-tenue)]">
                  {item.legenda_galeria}
                </p>
              ) : null}
            </div>
            <div className="mt-10">
              <Galeria fotos={galeria} />
            </div>
          </Secao>
        ) : null}

        {plantas.length ? (
          <Secao className="pt-0 md:pt-0">
            <div data-revelar>
              <Titulo antes="Planta" className="text-display-sm" />
            </div>
            <div className="mt-8 space-y-6">
              {plantas.map((planta) => (
                <figure
                  key={planta.id}
                  data-revelar
                  className="overflow-hidden rounded-2xl border border-[var(--borda)] bg-white p-4"
                >
                  <Image
                    src={planta.url}
                    alt={planta.legenda ?? "Planta"}
                    width={1600}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    className="h-auto w-full object-contain"
                  />
                  {planta.legenda ? (
                    <figcaption className="pt-4 text-sm text-[var(--fg-tenue)]">
                      {planta.legenda}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </Secao>
        ) : null}

        {/* ===================================== bloco 6: as unidades */}
        {item.unidades.length ? (
          <Secao className="pt-0 md:pt-0">
            <div data-revelar className="max-w-2xl">
              <Olho>Catálogo</Olho>
              <Titulo antes="Unidades" className="mt-5" />
              <p className="mt-4 leading-relaxed text-[var(--fg-suave)]">
                Veja o que está disponível neste empreendimento.
              </p>
            </div>
            <div className="mt-10">
              <Unidades
                unidades={item.unidades as never}
                slugEmpreendimento={item.slug}
                observacao={item.unidades[0]?.observacao}
              />
            </div>
          </Secao>
        ) : null}

        {/* ====================================== bloco 7: localização */}
        {local || item.mapa_imagem || item.referencias.length ? (
          <Secao className="pt-0 md:pt-0">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div data-revelar>
                <Olho>Localização</Olho>
                <Titulo antes="Onde" destaque="fica" className="mt-5" />

                {item.localizacao_texto ? (
                  <p className="mt-6 leading-relaxed text-[var(--fg-suave)]">
                    {item.localizacao_texto}
                  </p>
                ) : null}

                {local ? (
                  <p className="mt-5 flex items-start gap-2.5 text-sm text-[var(--fg-suave)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fg-tenue)]" />
                    {local}
                  </p>
                ) : null}

                {item.referencias.length ? (
                  <ul className="mt-7 space-y-3">
                    {item.referencias.map((r) => (
                      <li key={r.id} className="flex gap-3 text-sm">
                        <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-ouro-600)]" />
                        <span className="text-[var(--fg-suave)]">
                          {r.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.mapa_link ? (
                  <BotaoExterno href={item.mapa_link} className="mt-8">
                    Ver no mapa
                  </BotaoExterno>
                ) : null}
              </div>

              {item.mapa_imagem ? (
                <div
                  data-revelar
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--bg-fundo)]"
                >
                  <Image
                    src={item.mapa_imagem}
                    alt={`Localização do ${item.nome}`}
                    fill
                    data-quadro
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </Secao>
        ) : null}

        {/* ====================================== bloco 8: atendimento */}
        <Secao id="cadastro" className="pt-0 md:pt-0">
          <div data-revelar className="max-w-2xl">
            <Olho>Atendimento</Olho>
            <Titulo
              antes="Como você quer ser"
              destaque="atendido?"
              className="mt-5"
            />
            {item.atendimento_chamada ? (
              <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
                {item.atendimento_chamada}
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Opcao
              Icone={MapPin}
              titulo="Atendimento presencial"
              texto={`Venha conhecer o projeto e tirar suas dúvidas com a nossa equipe. ${empresa.endereco}`}
              rodape={empresa.atendimento}
            />
            <Opcao
              Icone={Whatsapp}
              titulo="Contato comercial"
              texto={`Fale direto com o nosso time comercial pelo WhatsApp ${empresa.whatsapp}.`}
              acao={
                <BotaoExterno
                  href={empresa.whatsapp_link}
                  icone="zap"
                  className="mt-5"
                >
                  Chamar no WhatsApp
                </BotaoExterno>
              }
            />
            <Opcao
              Icone={UserRound}
              titulo="Cadastro de interessados"
              texto="Deixe seus dados e receba um atendimento feito para o seu perfil."
              acao={
                <BotaoLink href="#formulario" className="mt-5">
                  Quero ser atendido
                </BotaoLink>
              }
            />
          </div>

          {/* ------------------------------------------ formulário curto */}
          <div
            id="formulario"
            data-revelar
            className="mt-14 scroll-mt-28 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-7 sm:p-10"
          >
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-medium">
                Tenho interesse neste empreendimento
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--fg-suave)]">
                Deixe seus dados e receba o atendimento de um consultor da CS.
              </p>
            </div>
            <FormularioCurto
              empreendimentos={empreendimentos}
              empreendimentoPadrao={item.id}
              origem={`/empreendimentos/${item.slug}`}
            />
          </div>

          <p className="mt-8 text-xs leading-relaxed text-[var(--fg-tenue)]">
            Imagens meramente ilustrativas. Valores, condições e prazos podem
            ser alterados sem aviso prévio.
          </p>
        </Secao>

        {/* ---------------------------------------- voltar para a lista */}
        <Secao className="pt-0 md:pt-0">
          <Link
            href="/empreendimentos"
            className="group -my-2.5 inline-flex items-center gap-2 py-2.5 text-sm font-medium text-[var(--acento)]"
          >
            <Simbolo className="h-4 w-auto" />
            Ver todos os empreendimentos
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Secao>
      </div>
    </>
  );
}

function Opcao({
  Icone,
  titulo,
  texto,
  rodape,
  acao,
}: {
  Icone: React.ComponentType<{ className?: string }>;
  titulo: string;
  texto: string;
  rodape?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div
      data-revelar
      className="flex flex-col rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-7"
    >
      <Icone className="h-5 w-5 text-[var(--color-ouro-600)]" />
      <h3 className="font-display mt-4 text-lg font-medium">{titulo}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--fg-suave)]">
        {texto}
      </p>
      {rodape ? (
        <p className="mt-3 inline-flex items-start gap-2 text-xs text-[var(--fg-tenue)]">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {rodape}
        </p>
      ) : null}
      {acao ? <div className="mt-auto">{acao}</div> : null}
    </div>
  );
}
