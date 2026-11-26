import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  BlocoConteudo,
  Interruptor,
  Trecho,
} from "@/components/admin/bloco-conteudo";
import { ArtesDoBanner } from "@/components/admin/banner-campanha";
import { EditorTitulo } from "@/components/admin/editor-titulo";
import { EscolhaDeCor } from "@/components/admin/escolha-de-cor";
import { EntradaLink } from "@/components/admin/entrada-link";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import { classeBotao } from "@/components/admin/estilos";
import { PreviaFaixa } from "@/components/admin/previa-faixa";
import { Area, Cabecalho, Campo, Entrada } from "@/components/admin/ui";
import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { temaDaFaixa } from "@/lib/temas-faixa";
import { lerMensagemDaFaixa, lerTitulo } from "@/lib/texto-rico";
import { fotosDaVitrine } from "@/lib/vitrine";

type Config = Record<string, unknown>;

const t = (c: Config, campo: string) => {
  const v = c?.[campo];
  return typeof v === "string" ? v : "";
};
const b = (c: Config, campo: string) => c?.[campo] === true;

export default async function PaginaConteudo() {
  await exigirArea("conteudo");
  const supabase = await createClient();
  const [{ data }, { data: obras }, vitrine] = await Promise.all([
    supabase.from("site_settings").select("chave, valor"),
    supabase
      .from("empreendimentos")
      .select("slug, nome")
      .order("ordem", { ascending: true }),
    fotosDaVitrine(),
  ]);

  const mapa: Record<string, Config> = {};
  for (const linha of data ?? [])
    mapa[linha.chave] = (linha.valor ?? {}) as Config;

  const hero = mapa.hero ?? {};
  const faixa = mapa.faixa_campanha ?? {};
  const construtor = mapa.construtor ?? {};
  const saida = mapa.popup_saida ?? {};
  const banner = mapa.banner_campanha ?? {};
  const marcos = Array.isArray(construtor.marcos)
    ? (construtor.marcos as { ano?: string | null; texto?: string | null }[])
    : [];

  // Destinos prontos para os botões: as páginas de cada empreendimento e
  // o WhatsApp da empresa.
  const paginasObras = (obras ?? []).map((o) => ({
    rotulo: o.nome,
    caminho: `/empreendimentos/${o.slug}`,
  }));
  const whatsapp = t(mapa.empresa ?? {}, "whatsapp_link");
  const destinosFora = whatsapp
    ? [{ rotulo: "WhatsApp da CS", caminho: whatsapp }]
    : [];
  const link = { empreendimentos: paginasObras, extras: destinosFora };

  const AJUDA_TITULO =
    "Escreva a frase inteira. Para destacar, selecione as palavras e toque em Destaque. Dá para destacar mais de um trecho, em qualquer ponto da frase.";
  const AJUDA_TEXTO =
    "Selecione um trecho e toque em B para pôr em negrito. No site, o negrito marca as partes que importam: use em uma ou duas por texto.";
  const AJUDA_OLHO = "O selo menta, com o símbolo da CS, acima do título.";

  const INDICE = [
    { id: "topo", rotulo: "Topo" },
    { id: "banner", rotulo: "Banner de campanha" },
    { id: "campanha", rotulo: "Faixa de campanha" },
    { id: "popup", rotulo: "Pop-up de saída" },
    { id: "destaques", rotulo: "Destaques" },
    { id: "todos", rotulo: "Todos os empreendimentos" },
    { id: "blog", rotulo: "Blog" },
    { id: "fundador", rotulo: "Fundador" },
    { id: "contato", rotulo: "Faixa de contato" },
    { id: "empresa", rotulo: "Empresa" },
    { id: "rodape", rotulo: "Rodapé" },
    { id: "whatsapp", rotulo: "WhatsApp" },
    { id: "google", rotulo: "Google" },
  ];

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Conteúdo do site"
        descricao="O que aparece na página inicial e nos textos que se repetem no site. Cada bloco salva sozinho e vai ao ar na hora."
        acoes={
          <Link href="/" target="_blank" className={classeBotao("neutro")}>
            Ver o site
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        }
      />

      {/* Índice: a página é longa, e no celular rolar até o rodapé
          para achar um bloco é o que faz desistir. */}
      <nav
        aria-label="Blocos desta página"
        className="sticky top-16 z-20 -mx-4 overflow-x-auto bg-[var(--painel-fundo)]/90 px-4 py-2 backdrop-blur-xl [scrollbar-width:none] sm:mx-0 sm:rounded-full sm:px-0 lg:top-3 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max gap-1.5">
          {INDICE.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex min-h-9 items-center rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] px-3.5 text-sm text-[var(--fg-suave)] transition-colors hover:border-[var(--borda-forte)] hover:text-[var(--fg)]"
              >
                {item.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        {/* ============================================= topo da página */}
        <BlocoConteudo
          chave="hero"
          id="topo"
          titulo="Topo da página inicial"
          apoio="A primeira tela de quem abre o site: o selo, a frase principal, o texto de apoio e os dois botões. Ao lado, a logo da CS com os empreendimentos passando por dentro."
        >
          <Trecho titulo="Textos">
            <Campo rotulo="Selo de cima" apoio={AJUDA_OLHO}>
              <Entrada name="chamada" defaultValue={t(hero, "chamada")} />
            </Campo>
            <Campo
              rotulo="Título"
              apoio={`${AJUDA_TITULO} Aqui o destaque sai no verde da marca, em degradê.`}
            >
              <EditorTitulo
                nome="titulo"
                valor={lerTitulo(hero)}
                rotulo="Título do topo"
              />
            </Campo>
            <Campo
              rotulo="Texto de apoio"
              apoio={`${AJUDA_TEXTO} Duas linhas no máximo.`}
            >
              <EditorTitulo
                nome="subtitulo"
                valor={t(hero, "subtitulo")}
                rotulo="Texto de apoio do topo"
                tamanho="texto"
              />
            </Campo>
          </Trecho>

          <Trecho titulo="Botões">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo
                rotulo="Botão principal"
                apoio="O botão verde, com a seta."
              >
                <Entrada
                  name="botao_primario"
                  defaultValue={t(hero, "botao_primario")}
                />
              </Campo>
              <Campo
                rotulo="Para onde ele leva"
                apoio="Escolha uma página em “Escolher página” ou cole um link completo, de dentro ou de fora do site."
              >
                <EntradaLink
                  name="botao_primario_url"
                  defaultValue={t(hero, "botao_primario_url")}
                  {...link}
                />
              </Campo>
              <Campo
                rotulo="Botão secundário"
                apoio="O botão claro, com o ícone do WhatsApp."
              >
                <Entrada
                  name="botao_secundario"
                  defaultValue={t(hero, "botao_secundario")}
                />
              </Campo>
              <Campo
                rotulo="Para onde ele leva"
                apoio="Em branco, leva ao WhatsApp cadastrado em Dados da empresa."
              >
                <EntradaLink
                  name="botao_secundario_url"
                  defaultValue={t(hero, "botao_secundario_url")}
                  placeholder="WhatsApp da empresa"
                  {...link}
                />
              </Campo>
            </div>
          </Trecho>

          {/* ------------------------------------ as fotos dentro da logo */}
          <Trecho
            titulo="Fotos dentro da logo"
            apoio="Ninguém escolhe à mão. A cada foto que entra ou sai de um empreendimento, o site refaz a seleção: capa e galeria dos publicados, só fotos boas (1200 px ou mais) e de preferência em pé, que aparecem inteiras na logo. Fotos de obra, planta e mapa ficam de fora, e cada empreendimento entra com a mesma quantidade."
          >
            {vitrine.length ? (
              <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
                {vitrine.map((foto) => (
                  <li key={foto.grande} className="min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.pequena}
                      alt=""
                      loading="lazy"
                      className="aspect-[453/840] w-full rounded-lg object-cover grayscale"
                    />
                    <p className="mt-1.5 truncate text-xs text-[var(--fg-tenue)]">
                      {foto.nome}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--fg-tenue)]">
                Nenhum empreendimento publicado tem foto boa o bastante ainda.
                Enquanto isso, a logo aparece só com o degradê verde.
              </p>
            )}
            <Link
              href="/admin/empreendimentos"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-verde-700)] hover:underline"
            >
              Mudar as fotos dos empreendimentos
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Link>
          </Trecho>
        </BlocoConteudo>

        {/* ======================================= banner de campanha */}
        <BlocoConteudo
          chave="banner_campanha"
          id="banner"
          titulo="Banner de campanha"
          apoio="Uma arte que abre como pop-up por cima do site, para campanhas e ações pontuais, como a Black Friday. Abre uma vez por visita, alguns segundos depois da página aparecer, com o botão da campanha e um botão de fechar bem à vista."
        >
          <Interruptor
            nome="ativo"
            rotulo="Mostrar o banner no site"
            apoio="Sem a arte do computador, ele não aparece, mesmo ligado. Trocar a arte faz o banner voltar para quem já tinha fechado o anterior."
            padrao={b(banner, "ativo")}
          />
          <ArtesDoBanner
            computador={t(banner, "imagem_desktop") || null}
            celular={t(banner, "imagem_mobile") || null}
            textos={{
              descricao: t(banner, "descricao"),
              botao: t(banner, "botao"),
              fechar: t(banner, "botao_fechar"),
            }}
          />
          <Campo
            rotulo="O que a arte diz"
            apoio="Uma frase com o texto principal da arte. É lida para quem usa leitor de tela e aparece se a imagem não carregar."
          >
            <Entrada
              name="descricao"
              defaultValue={t(banner, "descricao")}
              placeholder="Black Friday CS: condições especiais até dia 30"
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo
              rotulo="Botão da campanha"
              apoio="O botão verde, embaixo da arte. A arte inteira também leva para o mesmo lugar."
            >
              <Entrada
                name="botao"
                defaultValue={t(banner, "botao")}
                placeholder="Quero saber as condições"
              />
            </Campo>
            <Campo
              rotulo="Para onde ele leva"
              apoio="Escolha uma página em “Escolher página” ou cole um link completo, de dentro ou de fora do site."
            >
              <EntradaLink
                name="botao_url"
                defaultValue={t(banner, "botao_url")}
                {...link}
              />
            </Campo>
            <Campo
              rotulo="Botão de fechar"
              apoio="Do mesmo tamanho que o da campanha, ao lado dele. O X do canto também fecha."
            >
              <Entrada
                name="botao_fechar"
                defaultValue={t(banner, "botao_fechar")}
                placeholder="Agora não"
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ======================================== faixa de campanha */}
        <BlocoConteudo
          chave="faixa_campanha"
          id="campanha"
          titulo="Faixa de campanha"
          apoio="A tarja fina no topo de todas as páginas. Use para avisos de curta duração, como a Black Friday."
        >
          <Interruptor
            nome="ativo"
            rotulo="Mostrar a faixa no site"
            apoio="Desligue quando a campanha terminar. O texto fica guardado para a próxima."
            padrao={b(faixa, "ativo")}
          />
          <Campo
            rotulo="Mensagem"
            apoio="Selecione um trecho e use negrito, itálico, sublinhado ou Destaque. Na faixa, o destaque sai em dourado. Trocar a mensagem faz a faixa voltar para quem já tinha fechado."
          >
            <EditorTitulo
              nome="mensagem"
              valor={lerMensagemDaFaixa(faixa)}
              rotulo="Mensagem da faixa de campanha"
              placeholder="Black Friday CS: condições especiais até dia 30"
              tamanho="texto"
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo
              rotulo="Texto do botão"
              apoio="Em branco, a faixa fica sem botão."
            >
              <Entrada
                name="link_texto"
                defaultValue={t(faixa, "link_texto")}
              />
            </Campo>
            <Campo
              rotulo="Para onde ele leva"
              apoio="Escolha uma página em “Escolher página” ou cole um link completo, de dentro ou de fora do site."
            >
              <EntradaLink
                name="link_url"
                defaultValue={t(faixa, "link_url")}
                {...link}
              />
            </Campo>
          </div>
          <Campo
            rotulo="Cor da faixa"
            apoio="Todas as cores têm o mesmo movimento. No amarelo, o texto e o botão ficam escuros para dar leitura."
          >
            <EscolhaDeCor nome="tema" valor={temaDaFaixa(faixa.tema)} />
          </Campo>
          <PreviaFaixa
            mensagem={lerMensagemDaFaixa(faixa)}
            linkTexto={t(faixa, "link_texto")}
            linkUrl={t(faixa, "link_url")}
            tema={temaDaFaixa(faixa.tema)}
          />
        </BlocoConteudo>

        {/* ========================================== pop-up de saída */}
        <BlocoConteudo
          chave="popup_saida"
          id="popup"
          titulo="Pop-up de saída"
          apoio="Aparece quando a pessoa vai sair do site: no computador, quando o cursor sobe para fechar a aba; no celular, quando ela rola rápido para cima depois de ler um pouco. Mostra o cadastro curto e os empreendimentos marcados como destaque. Uma vez por visita, e nunca para quem já se cadastrou."
        >
          <Interruptor
            nome="ativo"
            rotulo="Mostrar o pop-up no site"
            apoio="Desligado, ninguém vê. Os textos ficam guardados."
            padrao={b(saida, "ativo")}
          />
          <Campo rotulo="Selo de cima" apoio={AJUDA_OLHO}>
            <Entrada
              name="olho"
              defaultValue={t(saida, "olho")}
              placeholder="Antes de ir"
            />
          </Campo>
          <Campo rotulo="Título" apoio={AJUDA_TITULO}>
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(saida)}
              rotulo="Título do pop-up de saída"
              tamanho="medio"
            />
          </Campo>
          <Campo
            rotulo="Texto"
            apoio="Uma ou duas frases, acima do formulário."
          >
            <Area name="texto" rows={2} defaultValue={t(saida, "texto")} />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Botão do formulário">
              <Entrada
                name="botao"
                defaultValue={t(saida, "botao")}
                placeholder="Quero ser atendido"
              />
            </Campo>
            <Campo
              rotulo="Chamada dos empreendimentos"
              apoio="Acima da lista de empreendimentos em destaque, ao lado do formulário. Quais aparecem você escolhe na tela de Empreendimentos, marcando “destaque”."
            >
              <Entrada
                name="titulo_destaques"
                defaultValue={t(saida, "titulo_destaques")}
                placeholder="Ou conheça o que está em obra"
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ================================= títulos das outras seções */}
        <BlocoConteudo
          chave="destaques"
          id="destaques"
          titulo="Seção: empreendimentos em destaque"
          apoio="Quais projetos entram aqui você escolhe na tela de Empreendimentos, marcando “destaque”."
        >
          <Campo rotulo="Selo de cima" apoio={AJUDA_OLHO}>
            <Entrada
              name="olho"
              defaultValue={t(mapa.destaques ?? {}, "olho")}
              placeholder="Em obra agora"
            />
          </Campo>
          <Campo rotulo="Título" apoio={AJUDA_TITULO}>
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(
                mapa.destaques,
                "titulo",
                "Empreendimentos em <mark>destaque</mark>",
              )}
              rotulo="Título da seção de destaques"
              tamanho="medio"
            />
          </Campo>
          <Campo rotulo="Texto" apoio={AJUDA_TEXTO}>
            <EditorTitulo
              nome="subtitulo"
              valor={t(mapa.destaques ?? {}, "subtitulo")}
              rotulo="Texto da seção de destaques"
              tamanho="texto"
            />
          </Campo>
        </BlocoConteudo>

        <BlocoConteudo
          chave="todos_empreendimentos"
          id="todos"
          titulo="Seção: todos os empreendimentos"
          apoio="O cartão que convida a ver a lista completa de projetos."
        >
          <Campo rotulo="Título" apoio={AJUDA_TITULO}>
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(
                mapa.todos_empreendimentos,
                "titulo",
                "Todos os <mark>empreendimentos</mark>",
              )}
              rotulo="Título da seção de todos os empreendimentos"
              tamanho="medio"
            />
          </Campo>
          <Campo rotulo="Texto" apoio={AJUDA_TEXTO}>
            <EditorTitulo
              nome="texto"
              valor={t(mapa.todos_empreendimentos ?? {}, "texto")}
              rotulo="Texto da seção de todos os empreendimentos"
              tamanho="texto"
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Botão">
              <Entrada
                name="botao"
                defaultValue={t(mapa.todos_empreendimentos ?? {}, "botao")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <EntradaLink
                name="botao_url"
                defaultValue={t(mapa.todos_empreendimentos ?? {}, "botao_url")}
                {...link}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        <BlocoConteudo
          chave="blog_home"
          id="blog"
          titulo="Seção: blog"
          apoio="O bloco verde da página inicial. Aparece quando houver ao menos uma publicação."
        >
          <Campo rotulo="Selo de cima" apoio={AJUDA_OLHO}>
            <Entrada
              name="olho"
              defaultValue={t(mapa.blog_home ?? {}, "olho")}
              placeholder="Blog"
            />
          </Campo>
          <Campo
            rotulo="Título"
            apoio={`${AJUDA_TITULO} No fundo verde, o destaque sai em dourado.`}
          >
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(
                mapa.blog_home,
                "titulo",
                "Blog da <mark>CS</mark>",
              )}
              rotulo="Título da seção do blog"
              tamanho="medio"
            />
          </Campo>
          <Campo
            rotulo="Texto"
            apoio={`${AJUDA_TEXTO} No fundo verde, o negrito sai em branco.`}
          >
            <EditorTitulo
              nome="subtitulo"
              valor={t(mapa.blog_home ?? {}, "subtitulo")}
              rotulo="Texto da seção do blog"
              tamanho="texto"
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Link do topo da seção">
              <Entrada
                name="botao"
                defaultValue={t(mapa.blog_home ?? {}, "botao")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <EntradaLink
                name="botao_url"
                defaultValue={t(mapa.blog_home ?? {}, "botao_url")}
                {...link}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ============================================== o construtor */}
        <BlocoConteudo
          chave="construtor"
          id="fundador"
          titulo="Bloco do fundador"
          apoio="O bloco do Girlan na página inicial, depois do blog: foto, texto e a linha do tempo."
        >
          <div className="grid gap-x-7 gap-y-6 lg:grid-cols-[17rem_1fr]">
            <EnviarImagem
              nome="foto"
              valor={t(construtor, "foto") || null}
              pasta="site"
              rotulo="Foto do Girlan"
              apoio="Foto em pé, de boa resolução. Aparece ao lado do texto, sem legenda."
              larguraIdeal={1200}
              alturaIdeal={1600}
            />
            <div className="min-w-0 space-y-5">
              <Campo rotulo="Selo de cima" apoio={AJUDA_OLHO}>
                <Entrada
                  name="olho"
                  defaultValue={t(construtor, "olho")}
                  placeholder="Quem está por trás da CS"
                />
              </Campo>
              <Campo
                rotulo="Título"
                apoio={`${AJUDA_TITULO} Aqui o destaque sai no verde da marca, em degradê.`}
              >
                <EditorTitulo
                  nome="titulo"
                  valor={lerTitulo(construtor)}
                  rotulo="Título do bloco do fundador"
                  placeholder="Conheça o Girlan Carneiro"
                />
              </Campo>
              <Campo
                rotulo="Texto"
                apoio={`${AJUDA_TEXTO} Enter abre um parágrafo novo.`}
              >
                <EditorTitulo
                  nome="texto"
                  valor={t(construtor, "texto")}
                  rotulo="Texto do bloco do fundador"
                  tamanho="texto"
                  paragrafos
                />
              </Campo>
            </div>
          </div>

          <Trecho
            titulo="Linha do tempo"
            apoio="Os anos que aparecem embaixo do texto, na ordem daqui. Deixe o ano em branco para tirar uma linha."
          >
            <div className="space-y-3">
              {Array.from({ length: Math.max(6, marcos.length + 1) }).map(
                (_, i) => (
                  <div key={i} className="grid grid-cols-[5.5rem_1fr] gap-3">
                    <Entrada
                      name={`marcos.${i}.ano`}
                      defaultValue={marcos[i]?.ano ?? ""}
                      placeholder="Ano"
                      aria-label={`Ano da linha ${i + 1}`}
                      inputMode="numeric"
                    />
                    <Entrada
                      name={`marcos.${i}.texto`}
                      defaultValue={marcos[i]?.texto ?? ""}
                      placeholder={i === 0 ? "O que aconteceu naquele ano" : ""}
                      aria-label={`O que aconteceu, linha ${i + 1}`}
                    />
                  </div>
                ),
              )}
            </div>
          </Trecho>

          <Trecho titulo="Botão">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo rotulo="Texto do botão">
                <Entrada name="botao" defaultValue={t(construtor, "botao")} />
              </Campo>
              <Campo rotulo="Para onde ele leva">
                <EntradaLink
                  name="botao_url"
                  defaultValue={t(construtor, "botao_url")}
                  {...link}
                />
              </Campo>
            </div>
          </Trecho>
        </BlocoConteudo>

        <BlocoConteudo
          chave="faixa_contato"
          id="contato"
          titulo="Faixa de contato"
          apoio="O convite verde que fecha a página inicial."
        >
          <Campo
            rotulo="Título"
            apoio={`${AJUDA_TITULO} Aqui o destaque sai em dourado.`}
          >
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(mapa.faixa_contato)}
              rotulo="Título da faixa de contato"
              tamanho="medio"
            />
          </Campo>
          <Campo
            rotulo="Texto"
            apoio={`${AJUDA_TEXTO} No fundo verde, o negrito sai em branco.`}
          >
            <EditorTitulo
              nome="texto"
              valor={t(mapa.faixa_contato ?? {}, "texto")}
              rotulo="Texto da faixa de contato"
              tamanho="texto"
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Botão principal">
              <Entrada
                name="botao_primario"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_primario")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <EntradaLink
                name="botao_primario_url"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_primario_url")}
                {...link}
              />
            </Campo>
            <Campo rotulo="Botão do WhatsApp">
              <Entrada
                name="botao_secundario"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_secundario")}
              />
            </Campo>
            <Campo
              rotulo="Para onde ele leva"
              apoio="Em branco, leva ao WhatsApp cadastrado em Dados da empresa."
            >
              <EntradaLink
                name="botao_secundario_url"
                defaultValue={t(
                  mapa.faixa_contato ?? {},
                  "botao_secundario_url",
                )}
                placeholder="WhatsApp da empresa"
                {...link}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ================================================== a empresa */}
        <BlocoConteudo
          chave="empresa"
          id="empresa"
          titulo="Dados da empresa"
          apoio="Aparecem no rodapé, na página de contato e nas informações que o Google lê."
        >
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Razão social">
              <Entrada
                name="razao_social"
                defaultValue={t(mapa.empresa ?? {}, "razao_social")}
              />
            </Campo>
            <Campo rotulo="CNPJ">
              <Entrada
                name="cnpj"
                defaultValue={t(mapa.empresa ?? {}, "cnpj")}
              />
            </Campo>
          </div>
          <Campo rotulo="Endereço">
            <Entrada
              name="endereco"
              defaultValue={t(mapa.empresa ?? {}, "endereco")}
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="E-mail">
              <Entrada
                name="email"
                defaultValue={t(mapa.empresa ?? {}, "email")}
              />
            </Campo>
            <Campo rotulo="WhatsApp, como aparece escrito">
              <Entrada
                name="whatsapp"
                defaultValue={t(mapa.empresa ?? {}, "whatsapp")}
              />
            </Campo>
            <Campo rotulo="Link do WhatsApp">
              <Entrada
                name="whatsapp_link"
                defaultValue={t(mapa.empresa ?? {}, "whatsapp_link")}
              />
            </Campo>
            <Campo rotulo="Link do Google Maps">
              <Entrada
                name="maps"
                defaultValue={t(mapa.empresa ?? {}, "maps")}
              />
            </Campo>
            <Campo rotulo="Instagram">
              <Entrada
                name="instagram"
                defaultValue={t(mapa.empresa ?? {}, "instagram")}
              />
            </Campo>
            <Campo rotulo="Facebook">
              <Entrada
                name="facebook"
                defaultValue={t(mapa.empresa ?? {}, "facebook")}
              />
            </Campo>
          </div>
          <Campo rotulo="Horário de atendimento">
            <Entrada
              name="atendimento"
              defaultValue={t(mapa.empresa ?? {}, "atendimento")}
            />
          </Campo>
        </BlocoConteudo>

        {/* =================================================== rodapé */}
        <BlocoConteudo chave="rodape" id="rodape" titulo="Rodapé">
          <Campo rotulo="Texto institucional">
            <Area
              name="institucional"
              rows={2}
              defaultValue={t(mapa.rodape ?? {}, "institucional")}
            />
          </Campo>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <Campo rotulo="Aviso legal">
              <Entrada
                name="aviso"
                defaultValue={t(mapa.rodape ?? {}, "aviso")}
              />
            </Campo>
            <Campo rotulo="Direitos autorais">
              <Entrada
                name="copyright"
                defaultValue={t(mapa.rodape ?? {}, "copyright")}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ============================================ botão flutuante */}
        <BlocoConteudo
          chave="whatsapp_flutuante"
          id="whatsapp"
          titulo="Botão flutuante do WhatsApp"
          apoio="O botão verde que acompanha a rolagem, no canto de baixo."
        >
          <Interruptor
            nome="ativo"
            rotulo="Mostrar o botão"
            padrao={b(mapa.whatsapp_flutuante ?? {}, "ativo")}
          />
          <Campo rotulo="Texto do botão">
            <Entrada
              name="texto"
              defaultValue={t(mapa.whatsapp_flutuante ?? {}, "texto")}
            />
          </Campo>
        </BlocoConteudo>

        {/* ================================================= no Google */}
        <BlocoConteudo
          chave="seo"
          id="google"
          titulo="Como o site aparece no Google"
          apoio="Título e descrição da página inicial nos resultados de busca."
        >
          <Campo rotulo="Título" apoio="Até 60 caracteres.">
            <Entrada name="titulo" defaultValue={t(mapa.seo ?? {}, "titulo")} />
          </Campo>
          <Campo rotulo="Descrição" apoio="Até 155 caracteres.">
            <Area
              name="descricao"
              rows={3}
              defaultValue={t(mapa.seo ?? {}, "descricao")}
            />
          </Campo>
        </BlocoConteudo>
      </div>
    </div>
  );
}
