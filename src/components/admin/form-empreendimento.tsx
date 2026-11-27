"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";

import {
  salvarEmpreendimento,
  type EstadoEmpreendimento,
} from "@/app/actions/empreendimentos";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import { ListaComIcones } from "@/components/admin/lista-com-icones";
import {
  Abas,
  Area,
  Aviso,
  BarraSalvar,
  Campo,
  Cartao,
  Entrada,
  EntradaComPrefixo,
  Escolha,
  Salvar,
  Selecao,
  TituloBloco,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Tipo = { id: string; nome: string };

type Dados = Record<string, unknown> & {
  id?: string;
  caracteristicas?: { texto: string }[];
  diferenciais?: { texto: string }[];
  referencias?: { texto: string }[];
};

const ABAS = [
  { id: "basico", rotulo: "Básico" },
  // Logo depois do básico: no celular as abas rolam para o lado, e as
  // fotos, plantas e vídeos ficavam escondidos no fim da tela.
  { id: "midia", rotulo: "Fotos, plantas e vídeos" },
  { id: "textos", rotulo: "Textos" },
  { id: "ficha", rotulo: "Ficha técnica" },
  { id: "local", rotulo: "Localização" },
  { id: "busca", rotulo: "Google" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

/**
 * Cadastro e edição de um empreendimento.
 *
 * Regra de desenho: rótulo numa linha só, explicação no "?" ao lado. Um
 * campo com texto de apoio aberto ficava mais alto que o vizinho e a
 * linha inteira saía torta.
 */
export function FormEmpreendimento({
  dados,
  tipos,
  midia,
  abaInicial = "basico",
}: {
  dados: Dados;
  tipos: Tipo[];
  /** Galeria, plantas e vídeos (no cadastro novo, só fotos e plantas). */
  midia?: React.ReactNode;
  abaInicial?: string;
}) {
  const [estado, acao] = useActionState<EstadoEmpreendimento, FormData>(
    salvarEmpreendimento,
    {},
  );
  const [aba, setAba] = useState<Aba>(
    ABAS.some((a) => a.id === abaInicial) ? (abaInicial as Aba) : "basico",
  );

  const t = (campo: string) => {
    const v = dados[campo];
    return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
  };
  const linhas = (lista?: { texto: string }[]) =>
    (lista ?? []).map((i) => i.texto).join("\n");
  const pasta = `empreendimentos/${t("slug") || "novo"}`;

  return (
    <form action={acao}>
      <input type="hidden" name="id" value={t("id")} />

      {/* As abas só escondem visualmente: os campos continuam no
          formulário, então salvar de qualquer aba salva tudo. */}
      <Abas itens={ABAS} atual={aba} aoEscolher={setAba} />

      <div className="mt-6">
        {/* =============================================== básico */}
        <Painel ativo={aba === "basico"}>
          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={1}>Identificação</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo rotulo="Nome do empreendimento">
                <Entrada name="nome" defaultValue={t("nome")} required />
              </Campo>
              <Campo
                rotulo="Endereço da página"
                apoio="É o que aparece na barra do navegador, depois do domínio. Deixe em branco e ele é criado a partir do nome."
              >
                <EntradaComPrefixo
                  prefixo="/empreendimentos/"
                  name="slug"
                  defaultValue={t("slug")}
                  placeholder="gerado-pelo-nome"
                />
              </Campo>
              <Campo rotulo="Tipo">
                <Selecao name="tipo_id" defaultValue={t("tipo_id")}>
                  <option value="">Sem tipo</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo rotulo="Situação da obra">
                <Selecao
                  name="situacao"
                  defaultValue={t("situacao") || "em_construcao"}
                >
                  <option value="em_construcao">Em construção</option>
                  <option value="em_acabamento">Em acabamento</option>
                  <option value="entregue">Entregue</option>
                </Selecao>
              </Campo>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={2}>No site</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-[1fr_1fr_8rem]">
              <Campo
                rotulo="Publicação"
                apoio="Em rascunho, a página existe só aqui no painel. Quem visita o site não a vê."
              >
                <Escolha
                  nome="status"
                  valor={t("status") || "rascunho"}
                  opcoes={[
                    { valor: "rascunho", rotulo: "Rascunho" },
                    { valor: "publicado", rotulo: "No site" },
                  ]}
                />
              </Campo>
              <Campo
                rotulo="Destaque na página inicial"
                apoio="Os marcados aparecem nos cards de destaque da página inicial, na ordem do campo ao lado."
              >
                <Escolha
                  nome="destaque"
                  valor={dados.destaque ? "true" : "false"}
                  opcoes={[
                    { valor: "false", rotulo: "Não" },
                    { valor: "true", rotulo: "Em destaque" },
                  ]}
                />
              </Campo>
              <Campo
                rotulo="Ordem"
                apoio="Menor aparece primeiro, aqui e no site."
              >
                <Entrada
                  name="ordem"
                  type="number"
                  inputMode="numeric"
                  defaultValue={t("ordem") || "0"}
                />
              </Campo>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={3}>Imagens</TituloBloco>
            <div className="grid gap-8 lg:grid-cols-2">
              <EnviarImagem
                nome="imagem_principal"
                valor={t("imagem_principal") || null}
                pasta={pasta}
                rotulo="Foto principal"
                apoio="A capa do card e o banner do topo da página, com o nome ou a logo por cima. Prefira uma foto deitada, de boa resolução e sem texto escrito."
                larguraIdeal={2000}
                alturaIdeal={1200}
                tituloSobreposto={t("frase_impacto") || t("nome")}
              />
              <EnviarImagem
                nome="logo_url"
                valor={t("logo_url") || null}
                pasta={pasta}
                rotulo="Logo do empreendimento"
                apoio="Se houver, entra no lugar do nome escrito no topo da página. Use a versão branca, em PNG com fundo transparente. A borda vazia em volta do desenho é cortada sozinha, então a logo aparece grande."
                larguraIdeal={900}
                alturaIdeal={600}
                fundoEscuro
                encaixe="conter"
                aparar
              />
            </div>
          </Cartao>
        </Painel>

        {/* =============================================== textos */}
        <Painel ativo={aba === "textos"}>
          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={1}>Topo da página</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo
                rotulo="Frase de impacto"
                apoio="O título grande da seção “O projeto”, logo abaixo do banner. Também vira a descrição do empreendimento no Google, se a do Google ficar em branco."
              >
                <Entrada
                  name="frase_impacto"
                  defaultValue={t("frase_impacto")}
                />
              </Campo>
              <Campo
                rotulo="Subtítulo"
                apoio="A frase de apoio, logo abaixo da frase de impacto."
              >
                <Entrada name="subtitulo" defaultValue={t("subtitulo")} />
              </Campo>
              <Campo
                rotulo="Linha do card"
                apoio="O resumo de uma linha que aparece no card, na listagem de empreendimentos."
                className="sm:col-span-2"
              >
                <Entrada name="linha_card" defaultValue={t("linha_card")} />
              </Campo>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={2}>Apresentação</TituloBloco>
            <div className="space-y-5">
              <Campo
                rotulo="Sobre o empreendimento"
                apoio="Deixe uma linha em branco entre os parágrafos."
              >
                <Area name="sobre" rows={6} defaultValue={t("sobre")} />
              </Campo>
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Campo rotulo="O conceito">
                  <Area name="conceito" rows={4} defaultValue={t("conceito")} />
                </Campo>
                <Campo rotulo="A história do projeto">
                  <Area name="historia" rows={4} defaultValue={t("historia")} />
                </Campo>
              </div>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={3}>Listas</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo
                rotulo="Características do imóvel"
                apoio="Uma por linha. Cada linha vira um cartão com ícone no site. O ícone sai das palavras: “garagem” vira carro, “suíte” vira cama, “piscina” vira água. A prévia aparece embaixo da caixa."
              >
                <ListaComIcones
                  nome="caracteristicas"
                  valor={linhas(dados.caracteristicas)}
                />
              </Campo>
              <Campo
                rotulo="Diferenciais"
                apoio="Um por linha. Cada linha vira um cartão com ícone verde no site, escolhido pelas palavras. A prévia aparece embaixo da caixa."
              >
                <ListaComIcones
                  nome="diferenciais"
                  valor={linhas(dados.diferenciais)}
                />
              </Campo>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={4}>Atendimento</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo
                rotulo="Chamada do atendimento"
                apoio="O texto do bloco “Ficou interessado?”, no fim da página, acima do formulário. Em branco, usa um texto padrão."
                className="sm:col-span-2"
              >
                <Area
                  name="atendimento_chamada"
                  rows={2}
                  defaultValue={t("atendimento_chamada")}
                />
              </Campo>
              <Campo rotulo="Botão principal">
                <Entrada
                  name="botao_primario"
                  defaultValue={t("botao_primario")}
                />
              </Campo>
              <Campo rotulo="Botão do WhatsApp">
                <Entrada
                  name="botao_secundario"
                  defaultValue={t("botao_secundario")}
                />
              </Campo>
              <Campo
                rotulo="Legenda da galeria"
                apoio="Uma frase curta acima do carrossel de fotos. Ex.: Fotos reais de uma casa entregue pela CS."
                className="sm:col-span-2"
              >
                <Entrada
                  name="legenda_galeria"
                  defaultValue={t("legenda_galeria")}
                />
              </Campo>
            </div>
          </Cartao>
        </Painel>

        {/* ========================================= ficha técnica */}
        <Painel ativo={aba === "ficha"}>
          <Cartao className="p-5 sm:p-7">
            <TituloBloco apoio="Campo deixado em branco não aparece no site, nem o rótulo dele. É assim que um valor ainda não confirmado fica escondido até a CS preencher.">
              Ficha técnica
            </TituloBloco>

            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <Campo rotulo="Unidades">
                <Entrada
                  name="unidades_total"
                  defaultValue={t("unidades_total")}
                  placeholder="100 casas"
                />
              </Campo>
              <Campo rotulo="Área construída">
                <Entrada
                  name="area_construida"
                  defaultValue={t("area_construida")}
                  placeholder="56 m²"
                />
              </Campo>
              <Campo rotulo="Terreno, dimensões">
                <Entrada
                  name="terreno_dimensoes"
                  defaultValue={t("terreno_dimensoes")}
                  placeholder="10 x 25 m"
                />
              </Campo>
              <Campo rotulo="Terreno, área total">
                <Entrada
                  name="terreno_area"
                  defaultValue={t("terreno_area")}
                  placeholder="250 m²"
                />
              </Campo>
              <Campo rotulo="Vagas">
                <Entrada
                  name="vagas"
                  defaultValue={t("vagas")}
                  placeholder="2 vagas"
                />
              </Campo>
              <Campo rotulo="Previsão de entrega">
                <Entrada
                  name="previsao_entrega"
                  defaultValue={t("previsao_entrega")}
                  placeholder="Dezembro de 2027"
                />
              </Campo>
              <Campo
                rotulo="Valor a partir de"
                apoio="Só números, sem R$ nem pontos. Em branco ou zero, o valor some do site."
              >
                <Entrada
                  name="valor_a_partir_de"
                  inputMode="numeric"
                  defaultValue={t("valor_a_partir_de")}
                  placeholder="250000"
                />
              </Campo>
              <Campo rotulo="Registro de incorporação">
                <Entrada
                  name="registro_incorporacao"
                  defaultValue={t("registro_incorporacao")}
                />
              </Campo>
              <Campo
                rotulo="Andamento da obra (%)"
                apoio="Quanto da obra já foi feito, de 0 a 100. Aparece na ficha como “Acompanhe a obra”, com a barra de progresso. Em branco, ou com o empreendimento entregue, não aparece."
              >
                <Entrada
                  name="andamento_obra"
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  defaultValue={t("andamento_obra")}
                  placeholder="45"
                />
              </Campo>
            </div>

            <Campo
              rotulo="Distribuição"
              apoio="Como os cômodos se organizam. Ex.: 2 quartos, sendo 1 suíte, sala, cozinha e área de serviço."
              className="mt-5"
            >
              <Area
                name="distribuicao"
                rows={3}
                defaultValue={t("distribuicao")}
              />
            </Campo>
          </Cartao>
        </Painel>

        {/* ============================================ localização */}
        <Painel ativo={aba === "local"}>
          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={1}>Endereço</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-[2fr_1fr_1fr]">
              <Campo rotulo="Rua e número">
                <Entrada name="endereco" defaultValue={t("endereco")} />
              </Campo>
              <Campo rotulo="Bairro">
                <Entrada name="bairro" defaultValue={t("bairro")} />
              </Campo>
              <Campo rotulo="Cidade">
                <Entrada
                  name="cidade"
                  defaultValue={t("cidade") || "Santarém"}
                />
              </Campo>
              <Campo
                rotulo="Link do Google Maps"
                apoio="Vira o botão “Abrir no Google Maps”. No Google Maps, abra o local, toque em Compartilhar e copie o link. O mapa da página sai sozinho do endereço preenchido acima."
                className="sm:col-span-3"
              >
                <Entrada
                  name="mapa_link"
                  defaultValue={t("mapa_link")}
                  placeholder="https://maps.app.goo.gl/…"
                />
              </Campo>
            </div>
          </Cartao>

          <Cartao className="p-5 sm:p-7">
            <TituloBloco numero={2}>Arredores</TituloBloco>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Campo
                rotulo="Texto da localização"
                apoio="Um parágrafo curto sobre a região."
              >
                <Area
                  name="localizacao_texto"
                  rows={5}
                  defaultValue={t("localizacao_texto")}
                />
              </Campo>
              <Campo
                rotulo="Pontos de referência"
                apoio="Um por linha. Ex.: A 10 minutos do shopping. No site, cada um ganha um ícone pelas palavras."
              >
                <ListaComIcones
                  nome="referencias"
                  valor={linhas(dados.referencias)}
                  linhas={5}
                />
              </Campo>
            </div>
            <div className="mt-7">
              <EnviarImagem
                nome="mapa_imagem"
                valor={t("mapa_imagem") || null}
                pasta={pasta}
                rotulo="Imagem do mapa"
                apoio="Só aparece quando não há endereço preenchido: com endereço, a página mostra o mapa do Google, que dá para mover e ampliar."
                larguraIdeal={1600}
                alturaIdeal={1200}
              />
            </div>
          </Cartao>
        </Painel>

        {/* ================================ fotos, plantas e vídeos */}
        <Painel ativo={aba === "midia"}>
          {midia ? (
            <>
              <p className="rounded-2xl border border-[var(--borda)] bg-[#ebfff6] px-4 py-3 text-sm leading-relaxed text-[#2c6149]">
                {t("id")
                  ? "Fotos, plantas e vídeos salvam na hora em que você envia ou muda, sem precisar do botão Salvar."
                  : "Pode subir as fotos e as plantas agora. Elas ficam guardadas no empreendimento quando você tocar em Salvar empreendimento."}
              </p>
              {midia}
            </>
          ) : (
            <Cartao className="p-5 sm:p-7">
              <TituloBloco>Fotos, plantas e vídeos</TituloBloco>
              <p className="text-sm leading-relaxed text-[var(--fg-suave)]">
                Primeiro salve o empreendimento com o nome e o básico. Assim que
                salvar, esta aba abre sozinha para você subir a galeria, as
                plantas e os vídeos.
              </p>
            </Cartao>
          )}
        </Painel>

        {/* ================================================= Google */}
        <Painel ativo={aba === "busca"}>
          <Cartao className="p-5 sm:p-7">
            <TituloBloco apoio="Título e descrição desta página nos resultados de busca do Google.">
              Como aparece no Google
            </TituloBloco>
            <div className="space-y-5">
              <Campo
                rotulo="Título no Google"
                apoio="Até 60 caracteres. Em branco, usa o nome do empreendimento."
              >
                <Entrada
                  name="seo_titulo"
                  maxLength={70}
                  defaultValue={t("seo_titulo")}
                />
              </Campo>
              <Campo rotulo="Descrição no Google" apoio="Até 155 caracteres.">
                <Area
                  name="seo_descricao"
                  rows={3}
                  maxLength={170}
                  defaultValue={t("seo_descricao")}
                />
              </Campo>
            </div>
          </Cartao>
        </Painel>
      </div>

      <BarraSalvar>
        <Salvar>Salvar empreendimento</Salvar>
        {estado.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-verde-600)]">
            <Check className="h-4 w-4" />
            Salvo
          </span>
        ) : (
          <span className="hidden text-sm text-[var(--fg-tenue)] sm:inline">
            Salva todas as abas de uma vez.
          </span>
        )}
        {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      </BarraSalvar>
    </form>
  );
}

/** Esconde sem desmontar, para os campos continuarem no envio. */
function Painel({
  ativo,
  children,
}: {
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-5", !ativo && "hidden")} aria-hidden={!ativo}>
      {children}
    </div>
  );
}
