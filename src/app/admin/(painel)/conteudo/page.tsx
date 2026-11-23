import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  BlocoConteudo,
  Interruptor,
  Trecho,
} from "@/components/admin/bloco-conteudo";
import { EditorTitulo } from "@/components/admin/editor-titulo";
import { EscolhaDeCor } from "@/components/admin/escolha-de-cor";
import { EntradaLink } from "@/components/admin/entrada-link";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import { classeBotao } from "@/components/admin/estilos";
import { FundoTopo } from "@/components/admin/fundo-topo";
import { PreviaFaixa } from "@/components/admin/previa-faixa";
import {
  Area,
  Cabecalho,
  Campo,
  Entrada,
  Selecao,
} from "@/components/admin/ui";
import { ICONES_NUMERO } from "@/components/site/numeros-bento";
import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { temaDaFaixa } from "@/lib/temas-faixa";
import { lerMensagemDaFaixa, lerTitulo } from "@/lib/texto-rico";

type Config = Record<string, unknown>;

const t = (c: Config, campo: string) => {
  const v = c?.[campo];
  return typeof v === "string" ? v : "";
};
const b = (c: Config, campo: string) => c?.[campo] === true;

export default async function PaginaConteudo() {
  await exigirArea("conteudo");
  const supabase = await createClient();
  const [{ data }, { data: obras }] = await Promise.all([
    supabase.from("site_settings").select("chave, valor"),
    supabase
      .from("empreendimentos")
      .select("slug, nome")
      .order("ordem", { ascending: true }),
  ]);

  const mapa: Record<string, Config> = {};
  for (const linha of data ?? [])
    mapa[linha.chave] = (linha.valor ?? {}) as Config;

  const hero = mapa.hero ?? {};
  const faixa = mapa.faixa_campanha ?? {};
  const construtor = mapa.construtor ?? {};
  const saida = mapa.popup_saida ?? {};
  const numeros = Array.isArray(hero.numeros)
    ? (hero.numeros as {
        valor: string;
        texto: string;
        icone?: string | null;
        imagem?: string | null;
      }[])
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

  const INDICE = [
    { id: "topo", rotulo: "Topo" },
    { id: "campanha", rotulo: "Faixa de campanha" },
    { id: "popup", rotulo: "Pop-up de saída" },
    { id: "fundador", rotulo: "Fundador" },
    { id: "destaques", rotulo: "Destaques" },
    { id: "todos", rotulo: "Todos os empreendimentos" },
    { id: "blog", rotulo: "Blog" },
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
          apoio="A primeira tela de quem abre o site: a foto de fundo, a frase principal, os botões e os três números logo abaixo."
        >
          <Trecho titulo="Imagem de fundo">
            <FundoTopo
              computador={t(hero, "imagem_desktop") || null}
              celular={t(hero, "imagem_mobile") || null}
              textos={{
                chamada: t(hero, "chamada"),
                titulo: lerTitulo(hero),
                subtitulo: t(hero, "subtitulo"),
                botao_primario: t(hero, "botao_primario"),
                botao_secundario: t(hero, "botao_secundario"),
              }}
            />
          </Trecho>

          <Trecho
            titulo="Textos"
            apoio="A prévia nos aparelhos acima muda enquanto você digita. Só vai para o site quando você salvar."
          >
            <Campo
              rotulo="Chamada de cima"
              apoio="A linha miúda, em dourado, acima do título."
            >
              <Entrada name="chamada" defaultValue={t(hero, "chamada")} />
            </Campo>
            <Campo
              rotulo="Título"
              apoio={`${AJUDA_TITULO} Aqui o destaque sai em dourado, com um brilho que passa por dentro.`}
            >
              <EditorTitulo
                nome="titulo"
                valor={lerTitulo(hero)}
                rotulo="Título do topo"
              />
            </Campo>
            <Campo
              rotulo="Texto de apoio"
              apoio="O parágrafo abaixo do título. Duas ou três linhas no máximo."
            >
              <Area
                name="subtitulo"
                rows={3}
                defaultValue={t(hero, "subtitulo")}
              />
            </Campo>
          </Trecho>

          <Trecho titulo="Botões">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo rotulo="Botão principal" apoio="O botão branco.">
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
              <Campo rotulo="Botão secundário" apoio="O botão só com contorno.">
                <Entrada
                  name="botao_secundario"
                  defaultValue={t(hero, "botao_secundario")}
                />
              </Campo>
              <Campo
                rotulo="Para onde ele leva"
                apoio="Escolha uma página em “Escolher página” ou cole um link completo, de dentro ou de fora do site."
              >
                <EntradaLink
                  name="botao_secundario_url"
                  defaultValue={t(hero, "botao_secundario_url")}
                  {...link}
                />
              </Campo>
            </div>
          </Trecho>

          {/* ----------------------------------------- números de apoio */}
          <Trecho
            titulo="Números de apoio"
            apoio="As três peças logo abaixo da foto do topo. O número conta até o valor quando a pessoa rola até ele. Com foto, a peça mostra a foto com o número por cima; sem foto, alterna entre verde e claro. Deixe o número em branco para esconder a peça."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="min-w-0 space-y-4 rounded-2xl border border-[var(--borda)] bg-[var(--bg)] p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="tabular grid h-6 w-6 place-items-center rounded-full bg-[var(--color-verde-950)] text-[0.6875rem] font-semibold text-[var(--color-ouro-300)]">
                      {i + 1}
                    </span>
                    Peça {i + 1}
                  </p>
                  <div className="grid gap-4">
                    <Campo rotulo="Número" apoio="Pode ter palavra antes, como “Desde 2016”. Só a parte numérica conta.">
                      <Entrada
                        name={`numeros.${i}.valor`}
                        defaultValue={numeros[i]?.valor ?? ""}
                        placeholder="140"
                      />
                    </Campo>
                    <Campo rotulo="Texto">
                      <Entrada
                        name={`numeros.${i}.texto`}
                        defaultValue={numeros[i]?.texto ?? ""}
                        placeholder="unidades entregues"
                      />
                    </Campo>
                  </div>
                  <Campo
                    rotulo="Ícone"
                    apoio="Em automático, cada posição usa o seu ícone padrão."
                  >
                    <Selecao
                      name={`numeros.${i}.icone`}
                      defaultValue={numeros[i]?.icone ?? ""}
                    >
                      <option value="">Automático</option>
                      {Object.entries(ICONES_NUMERO).map(
                        ([chave, { rotulo }]) => (
                          <option key={chave} value={chave}>
                            {rotulo}
                          </option>
                        ),
                      )}
                    </Selecao>
                  </Campo>
                  <EnviarImagem
                    nome={`numeros.${i}.imagem`}
                    valor={numeros[i]?.imagem || null}
                    pasta="site"
                    rotulo="Foto (opcional)"
                    apoio="Uma foto real de obra ou de empreendimento. O número e o texto ficam por cima, em branco."
                    larguraIdeal={1200}
                    alturaIdeal={800}
                  />
                </div>
              ))}
            </div>
          </Trecho>
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
          <Campo
            rotulo="Chamada de cima"
            apoio="A linha miúda em caixa alta, acima do título."
          >
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
          <Campo rotulo="Texto" apoio="Uma ou duas frases, acima do formulário.">
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

        {/* ============================================== o construtor */}
        <BlocoConteudo
          chave="construtor"
          id="fundador"
          titulo="Bloco do fundador"
          apoio="O bloco do Girlan na página inicial. Enquanto não houver foto, o espaço mostra a marca da CS."
        >
          <div className="grid gap-x-7 gap-y-6 lg:grid-cols-[17rem_1fr]">
            <EnviarImagem
              nome="foto"
              valor={t(construtor, "foto") || null}
              pasta="site"
              rotulo="Foto do Girlan"
              apoio="Foto em pé, de boa resolução. Aparece ao lado do texto."
              larguraIdeal={1200}
              alturaIdeal={1500}
            />
            <div className="min-w-0 space-y-5">
              <Campo
                rotulo="Chamada de cima"
                apoio="A linha miúda em caixa alta, acima do título."
              >
                <Entrada
                  name="olho"
                  defaultValue={t(construtor, "olho")}
                  placeholder="A CS"
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
              <Campo rotulo="Legenda da foto">
                <Entrada
                  name="legenda"
                  defaultValue={t(construtor, "legenda")}
                />
              </Campo>
              <Campo
                rotulo="Texto"
                apoio="Deixe uma linha em branco entre os parágrafos."
              >
                <Area
                  name="texto"
                  defaultValue={t(construtor, "texto")}
                  rows={8}
                />
              </Campo>
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Campo rotulo="Botão">
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
            </div>
          </div>
        </BlocoConteudo>

        {/* ================================= títulos das outras seções */}
        <BlocoConteudo
          chave="destaques"
          id="destaques"
          titulo="Seção: empreendimentos em destaque"
          apoio="Quais projetos entram aqui você escolhe na tela de Empreendimentos, marcando “destaque”."
        >
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
          <Campo rotulo="Subtítulo">
            <Entrada
              name="subtitulo"
              defaultValue={t(mapa.destaques ?? {}, "subtitulo")}
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
          <Campo rotulo="Texto">
            <Area
              name="texto"
              rows={2}
              defaultValue={t(mapa.todos_empreendimentos ?? {}, "texto")}
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
          apoio="Aparece na página inicial quando houver ao menos uma publicação."
        >
          <Campo rotulo="Título" apoio={AJUDA_TITULO}>
            <EditorTitulo
              nome="titulo"
              valor={lerTitulo(mapa.blog_home, "titulo", "Blog da <mark>CS</mark>")}
              rotulo="Título da seção do blog"
              tamanho="medio"
            />
          </Campo>
          <Campo rotulo="Subtítulo">
            <Entrada
              name="subtitulo"
              defaultValue={t(mapa.blog_home ?? {}, "subtitulo")}
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

        <BlocoConteudo
          chave="faixa_contato"
          id="contato"
          titulo="Faixa de contato"
          apoio="O convite escuro que fecha a página inicial."
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
          <Campo rotulo="Texto">
            <Area
              name="texto"
              rows={3}
              defaultValue={t(mapa.faixa_contato ?? {}, "texto")}
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
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_secundario_url")}
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
