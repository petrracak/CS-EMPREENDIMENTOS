import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { BlocoConteudo, Interruptor } from "@/components/admin/bloco-conteudo";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import { Area, Campo, Entrada } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Config = Record<string, unknown>;

const t = (c: Config, campo: string) => {
  const v = c?.[campo];
  return typeof v === "string" ? v : "";
};
const b = (c: Config, campo: string) => c?.[campo] === true;

export default async function PaginaConteudo() {
  await exigirPerfil();
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("chave, valor");

  const mapa: Record<string, Config> = {};
  for (const linha of data ?? []) mapa[linha.chave] = (linha.valor ?? {}) as Config;

  const hero = mapa.hero ?? {};
  const faixa = mapa.faixa_campanha ?? {};
  const construtor = mapa.construtor ?? {};
  const numeros = Array.isArray(hero.numeros)
    ? (hero.numeros as { valor: string; texto: string }[])
    : [];

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">
            Conteúdo do site
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
            Aqui você muda o que aparece na página inicial e nos textos que
            se repetem no site. Cada bloco salva sozinho.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--borda-forte)] px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
        >
          Ver o site
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </header>

      <div className="mt-8 space-y-6">
        {/* ============================================= topo da página */}
        <BlocoConteudo
          chave="hero"
          titulo="Topo da página inicial"
          apoio="A primeira coisa que aparece para quem abre o site: a foto, a frase principal e os botões."
        >
          <EnviarImagem
            nome="imagem_desktop"
            valor={t(hero, "imagem_desktop") || null}
            pasta="site"
            rotulo="Imagem de fundo"
            apoio="Escolha uma foto clara e sem texto. O título do site é escrito por cima dela, no canto de baixo à esquerda."
            larguraIdeal={2400}
            alturaIdeal={1350}
            proporcaoMobile="a foto é cortada nas laterais"
            tituloSobreposto={`${t(hero, "titulo_antes")} ${t(hero, "titulo_destaque")} ${t(hero, "titulo_depois")}`.trim()}
          />

          <Campo
            rotulo="Chamada de cima"
            apoio="A linha miúda acima do título."
          >
            <Entrada name="chamada" defaultValue={t(hero, "chamada")} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo rotulo="Título, início">
              <Entrada
                name="titulo_antes"
                defaultValue={t(hero, "titulo_antes")}
              />
            </Campo>
            <Campo
              rotulo="Palavra em destaque"
              apoio="Sai em dourado no site."
            >
              <Entrada
                name="titulo_destaque"
                defaultValue={t(hero, "titulo_destaque")}
              />
            </Campo>
            <Campo rotulo="Título, fim">
              <Entrada
                name="titulo_depois"
                defaultValue={t(hero, "titulo_depois")}
              />
            </Campo>
          </div>

          <Campo rotulo="Texto de apoio">
            <Area name="subtitulo" defaultValue={t(hero, "subtitulo")} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Botão principal">
              <Entrada
                name="botao_primario"
                defaultValue={t(hero, "botao_primario")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <Entrada
                name="botao_primario_url"
                defaultValue={t(hero, "botao_primario_url")}
              />
            </Campo>
            <Campo rotulo="Botão secundário">
              <Entrada
                name="botao_secundario"
                defaultValue={t(hero, "botao_secundario")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <Entrada
                name="botao_secundario_url"
                defaultValue={t(hero, "botao_secundario_url")}
              />
            </Campo>
          </div>

          {/* ----------------------------------------- números de apoio */}
          <fieldset className="rounded-lg border border-[var(--borda)] p-4">
            <legend className="px-1.5 text-sm font-medium">
              Números de apoio
            </legend>
            <p className="mb-4 text-xs text-[var(--fg-tenue)]">
              Os três quadros logo abaixo da foto. Deixe em branco para
              esconder um deles.
            </p>
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[160px_1fr]">
                  <Entrada
                    name={`numeros.${i}.valor`}
                    defaultValue={numeros[i]?.valor ?? ""}
                    placeholder="140"
                  />
                  <Entrada
                    name={`numeros.${i}.texto`}
                    defaultValue={numeros[i]?.texto ?? ""}
                    placeholder="unidades entregues"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </BlocoConteudo>

        {/* ======================================== faixa de campanha */}
        <BlocoConteudo
          chave="faixa_campanha"
          titulo="Faixa de campanha"
          apoio="A tarja fina no topo de todas as páginas. Use para avisos de curta duração, como a Black Friday."
        >
          <Interruptor
            nome="ativo"
            rotulo="Mostrar a faixa no site"
            apoio="Desligue quando a campanha terminar. O texto fica guardado para a próxima."
            padrao={b(faixa, "ativo")}
          />
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Campo rotulo="Começo em negrito">
              <Entrada
                name="texto_forte"
                defaultValue={t(faixa, "texto_forte")}
              />
            </Campo>
            <Campo rotulo="Resto do texto">
              <Entrada name="texto" defaultValue={t(faixa, "texto")} />
            </Campo>
            <Campo rotulo="Texto do link">
              <Entrada
                name="link_texto"
                defaultValue={t(faixa, "link_texto")}
              />
            </Campo>
            <Campo rotulo="Para onde o link leva">
              <Entrada name="link_url" defaultValue={t(faixa, "link_url")} />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ============================================== o construtor */}
        <BlocoConteudo
          chave="construtor"
          titulo="Bloco do fundador"
          apoio="O bloco do Girlan na página inicial. Enquanto não houver foto, o espaço mostra a marca da CS."
        >
          <EnviarImagem
            nome="foto"
            valor={t(construtor, "foto") || null}
            pasta="site"
            rotulo="Foto do construtor"
            apoio="Foto em pé, de boa resolução. Aparece à esquerda do texto."
            larguraIdeal={1200}
            alturaIdeal={1500}
          />
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Título, início">
              <Entrada
                name="titulo_antes"
                defaultValue={t(construtor, "titulo_antes")}
                placeholder="Conheça o"
              />
            </Campo>
            <Campo
              rotulo="Palavra em destaque"
              apoio="Sai em verde degradê no site."
            >
              <Entrada
                name="titulo_destaque"
                defaultValue={t(construtor, "titulo_destaque")}
                placeholder="Girlan"
              />
            </Campo>
          </div>

          <Campo rotulo="Legenda da foto">
            <Entrada name="legenda" defaultValue={t(construtor, "legenda")} />
          </Campo>
          <Campo
            rotulo="Texto"
            apoio="Deixe uma linha em branco entre os parágrafos."
          >
            <Area name="texto" defaultValue={t(construtor, "texto")} rows={8} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Botão">
              <Entrada name="botao" defaultValue={t(construtor, "botao")} />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <Entrada
                name="botao_url"
                defaultValue={t(construtor, "botao_url")}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ================================= títulos das outras seções */}
        <BlocoConteudo
          chave="destaques"
          titulo="Seção: empreendimentos em destaque"
          apoio="Quais projetos entram aqui você escolhe na tela de Empreendimentos, marcando “destaque”."
        >
          <Campo rotulo="Título">
            <Entrada name="titulo" defaultValue={t(mapa.destaques ?? {}, "titulo")} />
          </Campo>
          <Campo rotulo="Subtítulo">
            <Entrada
              name="subtitulo"
              defaultValue={t(mapa.destaques ?? {}, "subtitulo")}
            />
          </Campo>
        </BlocoConteudo>

        <BlocoConteudo
          chave="faixa_contato"
          titulo="Faixa de contato"
          apoio="O convite escuro que fecha a página inicial."
        >
          <Campo rotulo="Título">
            <Entrada
              name="titulo"
              defaultValue={t(mapa.faixa_contato ?? {}, "titulo")}
            />
          </Campo>
          <Campo rotulo="Texto">
            <Area
              name="texto"
              rows={3}
              defaultValue={t(mapa.faixa_contato ?? {}, "texto")}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Botão principal">
              <Entrada
                name="botao_primario"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_primario")}
              />
            </Campo>
            <Campo rotulo="Para onde ele leva">
              <Entrada
                name="botao_primario_url"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_primario_url")}
              />
            </Campo>
            <Campo rotulo="Botão do WhatsApp">
              <Entrada
                name="botao_secundario"
                defaultValue={t(mapa.faixa_contato ?? {}, "botao_secundario")}
              />
            </Campo>
          </div>
        </BlocoConteudo>

        {/* ================================================== a empresa */}
        <BlocoConteudo
          chave="empresa"
          titulo="Dados da empresa"
          apoio="Aparecem no rodapé, na página de contato e nas informações que o Google lê."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Razão social">
              <Entrada
                name="razao_social"
                defaultValue={t(mapa.empresa ?? {}, "razao_social")}
              />
            </Campo>
            <Campo rotulo="CNPJ">
              <Entrada name="cnpj" defaultValue={t(mapa.empresa ?? {}, "cnpj")} />
            </Campo>
          </div>
          <Campo rotulo="Endereço">
            <Entrada
              name="endereco"
              defaultValue={t(mapa.empresa ?? {}, "endereco")}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Entrada name="maps" defaultValue={t(mapa.empresa ?? {}, "maps")} />
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
        <BlocoConteudo chave="rodape" titulo="Rodapé">
          <Campo rotulo="Texto institucional">
            <Area
              name="institucional"
              rows={2}
              defaultValue={t(mapa.rodape ?? {}, "institucional")}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
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
    </>
  );
}
