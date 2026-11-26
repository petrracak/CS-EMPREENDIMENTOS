import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Car,
  Clock,
  HardHat,
  House,
  LandPlot,
  Landmark,
  LayoutGrid,
  MapPin,
  Ruler,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Whatsapp } from "@/components/icones-sociais";
import { Palavras } from "@/components/site/palavras";
import { Galeria } from "@/components/site/galeria";
import { MapaPreguicoso } from "@/components/site/mapa-preguicoso";
import { VideosEmpreendimento } from "@/components/site/videos-empreendimento";
import { prepararVideo, type TipoVideo, type VideoPronto } from "@/lib/videos";
import { iconeDoTexto } from "@/components/site/icone-do-item";
import { FormularioCurto } from "@/components/site/formulario-lead";
import { Simbolo } from "@/components/site/logo";
import { Paragrafos } from "@/components/site/texto";
import { Unidades } from "@/components/site/unidades";
import {
  BotaoExterno,
  BotaoLink,
  Olho,
  Secao,
  Titulo,
} from "@/components/site/ui";
import {
  lerEmpreendimento,
  listarParaSelecao,
  listarSlugs,
} from "@/lib/queries";
import { urlDaMidia } from "@/lib/midia";
import { lerEmpresa } from "@/lib/settings";
import { SITUACOES, formatarValor, textoUtil } from "@/lib/utils";
import { medir } from "@/lib/vitrine";
import { SITE_URL, absoluta, trilha } from "@/lib/seo";
import { DadosEstruturados } from "@/components/site/dados-estruturados";

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

  const descricao =
    textoUtil(item.seo_descricao) ??
    [
      textoUtil(item.frase_impacto),
      `${item.nome}, da CS Empreendimentos, em ${item.bairro ? `${item.bairro}, ` : ""}${item.cidade}.`,
    ]
      .filter(Boolean)
      .join(" ");
  const imagem = absoluta(item.imagem_principal);

  return {
    title: textoUtil(item.seo_titulo) ?? `${item.nome} em ${item.cidade}`,
    description: descricao,
    alternates: { canonical: `/empreendimentos/${item.slug}` },
    openGraph: {
      type: "website",
      title: item.nome,
      description: descricao,
      url: `/empreendimentos/${item.slug}`,
      ...(imagem ? { images: [{ url: imagem, alt: item.nome }] } : {}),
    },
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

  // A logo ocupa sempre mais ou menos a mesma área, seja larga ou mais
  // quadrada: uma logo larga numa caixa de altura fixa ficava fina e
  // pequena. O formato vem do próprio arquivo.
  const medidas = item.logo_url ? await medir(item.logo_url) : null;
  const logo = tamanhoDaLogo(medidas ? medidas.largura / medidas.altura : 2);

  const situacao = SITUACOES[item.situacao as keyof typeof SITUACOES];
  const galeria = item.imagens.filter((i) => i.categoria === "galeria");
  const plantas = item.imagens.filter((i) => i.categoria === "planta");
  const videos = item.videos
    .map((v) => prepararVideo({ ...v, tipo: v.tipo as TipoVideo }))
    .filter((v): v is VideoPronto => v !== null);
  const local = [item.endereco, item.bairro, item.cidade]
    .filter(Boolean)
    .join(", ");

  // A ficha técnica se monta só com o que existe. A regra da copy é clara:
  // campo vazio, zerado ou pendente não aparece — nem o rótulo.
  const ficha: { rotulo: string; valor: string; Icone: LucideIcon }[] = [
    { rotulo: "Tipo", valor: item.tipo?.nome ?? "", Icone: Building2 },
    { rotulo: "Situação", valor: situacao?.rotulo ?? "", Icone: HardHat },
    { rotulo: "Localização", valor: local, Icone: MapPin },
    {
      rotulo: "Unidades",
      valor: textoUtil(item.unidades_total) ?? "",
      Icone: House,
    },
    {
      rotulo: "Área construída",
      valor: textoUtil(item.area_construida) ?? "",
      Icone: Ruler,
    },
    {
      rotulo: "Área do terreno",
      Icone: LandPlot,
      valor:
        textoUtil(item.terreno_dimensoes) && textoUtil(item.terreno_area)
          ? `${item.terreno_dimensoes} (${item.terreno_area})`
          : (textoUtil(item.terreno_dimensoes) ??
            textoUtil(item.terreno_area) ??
            ""),
    },
    {
      rotulo: "Distribuição",
      valor: textoUtil(item.distribuicao) ?? "",
      Icone: LayoutGrid,
    },
    { rotulo: "Vagas", valor: textoUtil(item.vagas) ?? "", Icone: Car },
    {
      rotulo: "Previsão de entrega",
      valor: textoUtil(item.previsao_entrega) ?? "",
      Icone: CalendarCheck,
    },
    {
      rotulo: "Valor a partir de",
      valor: formatarValor(item.valor_a_partir_de) ?? "",
      Icone: Wallet,
    },
    {
      rotulo: "Registro de incorporação",
      valor: textoUtil(item.registro_incorporacao) ?? "",
      Icone: Landmark,
    },
  ].filter((linha) => linha.valor);

  // Mapa embutido do Google, sem chave: só com o endereço escrito.
  const enderecoMapa = [item.endereco, item.bairro, item.cidade, "PA"]
    .filter(Boolean)
    .join(", ");
  const comoChegar = local
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoMapa)}`
    : null;
  const andamento =
    typeof item.andamento_obra === "number" && item.situacao !== "entregue"
      ? item.andamento_obra
      : null;

  // O que entra nas etiquetas do banner: situação, bairro e área.
  const area = textoUtil(item.area_construida);

  // Para o Google e as IAs: o que é o empreendimento, onde fica e o que
  // tem, além da trilha Início > Empreendimentos > este.
  const tipoSchema = /flat|apartamento|pr[ée]dio/i.test(
    `${item.tipo?.nome} ${item.nome}`,
  )
    ? "ApartmentComplex"
    : /condom[íi]nio|residence|casas/i.test(
          `${item.tipo?.nome} ${item.nome} ${item.sobre ?? ""}`,
        )
      ? "GatedResidenceCommunity"
      : "Residence";
  const dados = [
    {
      "@context": "https://schema.org",
      "@type": tipoSchema,
      name: item.nome,
      url: `${SITE_URL}/empreendimentos/${item.slug}`,
      description:
        textoUtil(item.frase_impacto) ?? textoUtil(item.sobre) ?? undefined,
      image: [item.imagem_principal, ...galeria.slice(0, 5).map((g) => g.url)]
        .map((c) => absoluta(c))
        .filter(Boolean),
      address: {
        "@type": "PostalAddress",
        streetAddress: item.endereco ?? undefined,
        addressLocality: item.cidade,
        addressRegion: "PA",
        addressCountry: "BR",
      },
      numberOfAccommodationUnits: textoUtil(item.unidades_total) ?? undefined,
      amenityFeature: [...item.caracteristicas, ...item.diferenciais].map(
        (c) => ({
          "@type": "LocationFeatureSpecification",
          name: c.texto,
          value: true,
        }),
      ),
      containedInPlace: item.bairro
        ? { "@type": "Place", name: `${item.bairro}, ${item.cidade}` }
        : undefined,
      provider: { "@id": `${SITE_URL}/#empresa` },
    },
    trilha([
      { nome: "Início", caminho: "/" },
      { nome: "Empreendimentos", caminho: "/empreendimentos" },
      { nome: item.nome, caminho: `/empreendimentos/${item.slug}` },
    ]),
    // Vídeos com miniatura entram para o Google (busca de vídeos).
    ...videos
      .filter((v) => v.miniatura)
      .map((v) => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.titulo || `${item.nome} em vídeo`,
        description: v.titulo || textoUtil(item.frase_impacto) || item.nome,
        thumbnailUrl: v.miniatura,
        uploadDate: item.videos.find((o) => o.id === v.id)?.created_at,
        ...(v.tipo === "arquivo"
          ? { contentUrl: v.player }
          : { embedUrl: v.player }),
      })),
  ];

  return (
    <>
      <DadosEstruturados dados={dados} />
      {/* ============================================ bloco 1: banner */}
      {/* Um banner contido, na largura do cabeçalho, e não a foto na tela
          inteira: com a foto ampliada até a borda de um monitor grande,
          qualquer imagem que não fosse de altíssima resolução ficava
          borrada. O nome (ou a logo) e as etiquetas ficam no centro. */}
      <section className="px-3 pt-3 sm:px-8 sm:pt-4">
        <div className="ficha-banner relative mx-auto max-w-[1224px] overflow-hidden rounded-[1.5rem]">
          {item.imagem_principal ? (
            <Image
              src={item.imagem_principal}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1280px) 100vw, 1224px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00552f] to-[#01261a]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(1_38_22/0.88),rgb(1_38_22/0.35)_55%,rgb(1_38_22/0.2))]" />

          <div className="relative flex h-full flex-col items-center justify-end px-5 pb-8 text-center sm:pb-12">
            {item.logo_url ? (
              <div
                data-entrada
                style={
                  {
                    "--logo-l": `${logo.largura}px`,
                    "--logo-a": `${logo.altura}px`,
                  } as React.CSSProperties
                }
                className="logo-empreendimento"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlDaMidia(item.logo_url)}
                  // A versão pequena (640 px) basta no celular; a grande
                  // pesava 130 KB para aparecer com 270 px de largura.
                  srcSet={
                    medidas
                      ? `${urlDaMidia(item.logo_url, { pequena: true })} ${Math.round(Math.min(1, 640 / Math.max(medidas.largura, medidas.altura)) * medidas.largura)}w, ${urlDaMidia(item.logo_url)} ${medidas.largura}w`
                      : undefined
                  }
                  sizes={`(min-width: 640px) ${logo.largura}px, ${Math.round(logo.largura * 0.74)}px`}
                  alt={item.nome}
                  width={logo.largura}
                  height={logo.altura}
                  fetchPriority="high"
                />
              </div>
            ) : null}

            {/* Com logo, o nome fica só para leitor de tela. */}
            <h1
              data-entrada
              className={
                item.logo_url
                  ? "sr-only"
                  : "text-[2.25rem] leading-[1.1] font-light tracking-[-0.05em] text-balance text-white sm:text-[3.5rem]"
              }
            >
              {item.nome}
            </h1>

            <ul
              data-entrada
              style={{ "--atraso": "200ms" } as React.CSSProperties}
              className="mt-5 flex flex-wrap justify-center gap-2"
            >
              {situacao ? (
                <li className="ficha-chip">
                  <HardHat className="h-3.5 w-3.5" />
                  {situacao.rotulo}
                </li>
              ) : null}
              {item.bairro ? (
                <li className="ficha-chip">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.bairro}
                </li>
              ) : null}
              {area ? (
                <li className="ficha-chip">
                  <Ruler className="h-3.5 w-3.5" />
                  {area}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================================== bloco 2: apresentação */}
      <Secao className="pt-14 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div data-revelar>
              <Olho>O projeto</Olho>
            </div>
            {item.frase_impacto ? (
              <Palavras
                como="h2"
                atraso={100}
                passo={45}
                segmentos={[{ texto: item.frase_impacto }]}
                className="mt-5 text-[2rem] leading-[1.15] font-light tracking-[-0.05em] text-balance text-[#28513f] sm:text-[2.6rem]"
              />
            ) : (
              <Titulo
                antes="Sobre o"
                destaque="empreendimento"
                className="mt-5"
              />
            )}
            {item.subtitulo ? (
              <p
                data-revelar
                className="mt-5 text-lg leading-relaxed text-[var(--fg-suave)]"
              >
                {item.subtitulo}
              </p>
            ) : null}

            {item.sobre ? (
              <div data-revelar>
                <Paragrafos texto={item.sobre} className="mt-7" />
              </div>
            ) : null}

            {item.conceito ? (
              <div data-revelar className="mt-10">
                <h3 className="text-xl font-normal tracking-[-0.04em] text-[#28513f]">
                  O conceito
                </h3>
                <Paragrafos texto={item.conceito} className="mt-3" />
              </div>
            ) : null}

            {item.historia ? (
              <div data-revelar className="mt-10">
                <h3 className="text-xl font-normal tracking-[-0.04em] text-[#28513f]">
                  A história do projeto
                </h3>
                <Paragrafos texto={item.historia} className="mt-3" />
              </div>
            ) : null}

            <div data-revelar className="mt-9 flex flex-wrap gap-3">
              <BotaoLink href="#formulario">
                {textoUtil(item.botao_primario) ?? "Quero atendimento"}
              </BotaoLink>
              <BotaoExterno
                href={empresa.whatsapp_link}
                aparencia="contorno"
                icone="zap"
              >
                {textoUtil(item.botao_secundario) ?? "Falar no WhatsApp"}
              </BotaoExterno>
            </div>
          </div>

          {/* ------------------------------------------- ficha técnica */}
          {ficha.length ? (
            <aside
              data-revelar
              className="h-fit rounded-2xl border border-[var(--borda)] bg-white p-6 sm:p-7 lg:sticky lg:top-28"
            >
              <h2 className="text-lg font-normal tracking-[-0.04em] text-[#28513f]">
                Ficha técnica
              </h2>
              <dl className="mt-4 divide-y divide-[var(--borda)]">
                {ficha.map((linha) => (
                  // dt e dd filhos diretos do div: é o que o leitor de
                  // tela espera numa lista de definições.
                  <div
                    key={linha.rotulo}
                    className="relative py-3.5 pl-[3.25rem]"
                  >
                    <dt className="text-[0.8125rem] text-[var(--fg-tenue)]">
                      <span
                        aria-hidden
                        className="absolute top-3.5 left-0 grid h-9 w-9 place-items-center rounded-full bg-[#ebfff6] text-[#004527]"
                      >
                        <linha.Icone
                          className="h-[1.05rem] w-[1.05rem]"
                          strokeWidth={1.7}
                        />
                      </span>
                      {linha.rotulo}
                    </dt>
                    <dd className="mt-0.5 text-[0.9375rem] leading-snug text-[var(--fg)]">
                      {linha.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
        </div>
      </Secao>

      {/* ===================== bloco 3: características e diferenciais */}
      {item.caracteristicas.length || item.diferenciais.length ? (
        <Secao className="pt-0 md:pt-0">
          {item.caracteristicas.length ? (
            <>
              <div data-revelar>
                <Olho>Características</Olho>
                <Titulo
                  antes="O que o imóvel"
                  destaque="oferece"
                  className="mt-5"
                />
              </div>
              <ListaComIcones itens={item.caracteristicas} />
            </>
          ) : null}

          {item.diferenciais.length ? (
            <div className={item.caracteristicas.length ? "mt-16" : ""}>
              <div data-revelar>
                <Olho>Diferenciais</Olho>
                <Titulo
                  antes="O que faz a"
                  destaque="diferença"
                  className="mt-5"
                />
              </div>
              <ListaComIcones itens={item.diferenciais} destaque />
            </div>
          ) : null}
        </Secao>
      ) : null}

      {/* ========================================= bloco 4: imagens */}
      {galeria.length ? (
        <Secao className="pt-0 md:pt-0">
          <div data-revelar className="max-w-2xl">
            <Olho>Imagens</Olho>
            <Titulo antes="Conheça o" destaque="projeto" className="mt-5" />
            {item.legenda_galeria ? (
              <p className="mt-4 text-sm text-[var(--fg-tenue)]">
                {item.legenda_galeria}
              </p>
            ) : null}
          </div>
          <div data-revelar className="mt-10">
            <Galeria fotos={galeria} />
          </div>
        </Secao>
      ) : null}

      {/* =========================================== bloco 4b: vídeos */}
      {videos.length ? (
        <Secao className="pt-0 md:pt-0">
          <div data-revelar className="max-w-2xl">
            <Olho>Vídeos</Olho>
            <Titulo antes="Veja em" destaque="movimento" className="mt-5" />
          </div>
          <div data-revelar className="mt-10">
            <VideosEmpreendimento videos={videos} />
          </div>
        </Secao>
      ) : null}

      {/* ========================================== bloco 5: plantas */}
      {plantas.length ? (
        <Secao className="blog-verde">
          <div data-revelar className="max-w-2xl">
            <Olho>Plantas</Olho>
            <h2 className="mt-5 text-[2rem] leading-[1.15] font-light tracking-[-0.05em] text-white sm:text-[2.6rem]">
              Como os espaços se <span className="destaque-ouro">dividem</span>
            </h2>
          </div>
          <div data-revelar className="mt-10">
            <Galeria fotos={plantas} tipo="planta" escuro />
          </div>
        </Secao>
      ) : null}

      {/* ========================================= bloco 6: unidades */}
      {item.unidades.length ? (
        <Secao className={plantas.length ? undefined : "pt-0 md:pt-0"}>
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
        <Secao
          className={
            item.unidades.length || !plantas.length ? "pt-0 md:pt-0" : undefined
          }
        >
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div data-revelar>
              <Olho>Localização</Olho>
              <Titulo antes="Onde" destaque="fica" className="mt-5" />

              {local ? (
                <p className="mt-6 flex items-start gap-2.5 text-[var(--fg)]">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#00ab61]" />
                  {local}
                </p>
              ) : null}

              {item.localizacao_texto ? (
                <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
                  {item.localizacao_texto}
                </p>
              ) : null}

              {item.referencias.length ? (
                <ul className="mt-7 space-y-3">
                  {item.referencias.map((r) => {
                    const Icone = iconeDoTexto(r.texto);
                    return (
                      <li
                        key={r.id}
                        className="flex items-start gap-3 text-[0.9375rem]"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ebfff6] text-[#004527]">
                          <Icone className="h-4 w-4" strokeWidth={1.7} />
                        </span>
                        <span className="pt-1 text-[var(--fg-suave)]">
                          {r.texto}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {comoChegar ? (
                  <BotaoExterno href={comoChegar}>Como chegar</BotaoExterno>
                ) : null}
                {item.mapa_link ? (
                  <BotaoExterno href={item.mapa_link} aparencia="contorno">
                    Abrir no Google Maps
                  </BotaoExterno>
                ) : null}
              </div>
            </div>

            {local ? (
              <div
                data-revelar
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--bg-fundo)] lg:aspect-auto lg:min-h-[26rem]"
              >
                <MapaPreguicoso
                  titulo={`Mapa da localização do ${item.nome}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(enderecoMapa)}&z=15&output=embed`}
                />
              </div>
            ) : item.mapa_imagem ? (
              <div
                data-revelar
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--bg-fundo)]"
              >
                <Image
                  src={item.mapa_imagem}
                  alt={`Localização do ${item.nome}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </Secao>
      ) : null}

      {/* ================================ bloco 8: andamento da obra */}
      {andamento !== null ? (
        <Secao className="pt-0 md:pt-0">
          <div
            data-revelar
            className="blog-verde relative overflow-hidden rounded-[1.75rem] px-6 py-10 sm:px-12 sm:py-14"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Olho>Acompanhe a obra</Olho>
                <p className="mt-5 text-[2rem] leading-tight font-light tracking-[-0.05em] text-white sm:text-[2.6rem]">
                  {andamento === 100 ? "Obra concluída" : "Obra em andamento"}
                </p>
                {textoUtil(item.previsao_entrega) ? (
                  <p className="mt-2 flex items-center gap-2 text-white/70">
                    <CalendarCheck className="h-4 w-4" />
                    Previsão de entrega: {item.previsao_entrega}
                  </p>
                ) : null}
              </div>
              <p className="tabular text-[3.5rem] leading-none font-light tracking-[-0.06em] text-[var(--color-ouro-300)] sm:text-[4.5rem]">
                {andamento}%
              </p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={andamento}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Andamento da obra"
              className="mt-8 h-3 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#cfa862,#f3d694)]"
                style={{ width: `${andamento}%` }}
              />
            </div>
          </div>
        </Secao>
      ) : null}

      {/* ====================================== bloco 9: atendimento */}
      <Secao id="cadastro" className="pt-0 md:pt-0">
        <div data-revelar className="max-w-2xl">
          <Olho>Atendimento</Olho>
          <Titulo
            antes="Ficou interessado no"
            destaque={item.nome}
            className="mt-5"
          />
          <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
            {textoUtil(item.atendimento_chamada) ??
              "Deixe seus dados e um consultor da CS te mostra as unidades, as condições e marca uma visita."}
          </p>
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
                aparencia="contorno"
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

        <div
          id="formulario"
          data-revelar
          className="mt-14 scroll-mt-28 rounded-2xl border border-[var(--borda)] bg-white p-6 sm:p-10"
        >
          <div className="max-w-xl">
            <h3 className="text-2xl font-light tracking-[-0.05em] text-[#28513f]">
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
      </Secao>

      {/* -------------------------------------- voltar para a lista */}
      <Secao className="pt-0 md:pt-0">
        <Link
          prefetch={false}
          href="/empreendimentos"
          className="group -my-2.5 inline-flex items-center gap-2 py-2.5 text-sm font-medium text-[#00552f]"
        >
          <Simbolo className="h-4 w-auto" />
          Ver todos os empreendimentos
          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </Secao>
    </>
  );
}

/** Características ou diferenciais em cartões, cada um com o seu ícone. */
function ListaComIcones({
  itens,
  destaque = false,
}: {
  itens: { id: string; texto: string }[];
  destaque?: boolean;
}) {
  return (
    <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {itens.map((c, i) => {
        const Icone = iconeDoTexto(c.texto);
        return (
          <li
            key={c.id}
            data-revelar
            style={{ "--atraso": `${(i % 3) * 70}ms` } as React.CSSProperties}
            className="flex items-start gap-4 rounded-2xl border border-[var(--borda)] bg-white p-5"
          >
            <span
              className={
                destaque
                  ? "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#004527,#00ab61)] text-white"
                  : "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ebfff6] text-[#004527]"
              }
            >
              <Icone className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <span className="pt-2.5 leading-snug text-[var(--fg)]">
              {c.texto}
            </span>
          </li>
        );
      })}
    </ul>
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

/** Largura e altura da logo no computador, em px (no celular, 74%). */
function tamanhoDaLogo(formato: number) {
  const AREA = 40000;
  let largura = Math.min(460, Math.sqrt(AREA * formato));
  let altura = largura / formato;
  if (altura > 170) {
    altura = 170;
    largura = altura * formato;
  }
  return { largura: Math.round(largura), altura: Math.round(altura) };
}
