"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";

import {
  salvarEmpreendimento,
  type EstadoEmpreendimento,
} from "@/app/actions/empreendimentos";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import {
  Area,
  Aviso,
  Campo,
  Cartao,
  Entrada,
  Salvar,
  Selecao,
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
  { id: "textos", rotulo: "Textos" },
  { id: "ficha", rotulo: "Ficha técnica" },
  { id: "local", rotulo: "Localização" },
  { id: "busca", rotulo: "Google" },
] as const;

export function FormEmpreendimento({
  dados,
  tipos,
}: {
  dados: Dados;
  tipos: Tipo[];
}) {
  const [estado, acao] = useActionState<EstadoEmpreendimento, FormData>(
    salvarEmpreendimento,
    {},
  );
  const [aba, setAba] = useState<string>("basico");

  const t = (campo: string) => {
    const v = dados[campo];
    return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
  };
  const linhas = (lista?: { texto: string }[]) =>
    (lista ?? []).map((i) => i.texto).join("\n");

  return (
    <form action={acao}>
      <input type="hidden" name="id" value={t("id")} />

      {/* As abas só escondem visualmente: os campos continuam no
          formulário, então salvar de qualquer aba salva tudo. */}
      <div className="flex flex-wrap gap-1 border-b border-[var(--borda)]">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAba(item.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
              aba === item.id
                ? "border-[var(--acento)] font-medium text-[var(--acento)]"
                : "border-transparent text-[var(--fg-tenue)] hover:text-[var(--fg)]",
            )}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {/* =============================================== básico */}
        <Painel ativo={aba === "basico"}>
          <Cartao className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome do empreendimento">
                <Entrada name="nome" defaultValue={t("nome")} required />
              </Campo>
              <Campo
                rotulo="Endereço da página"
                apoio="Aparece na barra do navegador. Deixe em branco para gerar a partir do nome."
              >
                <Entrada name="slug" defaultValue={t("slug")} />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="Publicação">
                <Selecao name="status" defaultValue={t("status") || "rascunho"}>
                  <option value="rascunho">Rascunho (fora do site)</option>
                  <option value="publicado">Publicado (no site)</option>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <Campo
                rotulo="Destaque na página inicial"
                apoio="Os marcados aparecem nos três cards da home, na ordem abaixo."
              >
                <Selecao
                  name="destaque"
                  defaultValue={dados.destaque ? "true" : "false"}
                >
                  <option value="false">Não</option>
                  <option value="true">Sim, mostrar em destaque</option>
                </Selecao>
              </Campo>
              <Campo rotulo="Ordem">
                <Entrada
                  name="ordem"
                  type="number"
                  defaultValue={t("ordem") || "0"}
                />
              </Campo>
            </div>
          </Cartao>

          <Cartao className="space-y-5 p-6">
            <EnviarImagem
              nome="imagem_principal"
              valor={t("imagem_principal") || null}
              pasta={`empreendimentos/${t("slug") || "novo"}`}
              rotulo="Foto principal"
              apoio="É a capa do card e a foto do topo da página. Escolha uma imagem larga, sem texto."
              larguraIdeal={2000}
              alturaIdeal={1200}
              tituloSobreposto={t("frase_impacto")}
            />
            <EnviarImagem
              nome="logo_url"
              valor={t("logo_url") || null}
              pasta={`empreendimentos/${t("slug") || "novo"}`}
              rotulo="Logo do empreendimento"
              apoio="Se houver, entra no lugar do nome escrito no topo da página. Use a versão branca, com fundo transparente."
              larguraIdeal={900}
              alturaIdeal={600}
            />
          </Cartao>
        </Painel>

        {/* =============================================== textos */}
        <Painel ativo={aba === "textos"}>
          <Cartao className="space-y-5 p-6">
            <Campo
              rotulo="Frase de impacto"
              apoio="A frase grande no topo da página."
            >
              <Entrada
                name="frase_impacto"
                defaultValue={t("frase_impacto")}
              />
            </Campo>
            <Campo rotulo="Subtítulo">
              <Entrada name="subtitulo" defaultValue={t("subtitulo")} />
            </Campo>
            <Campo
              rotulo="Linha do card"
              apoio="O resumo de uma linha que aparece na listagem."
            >
              <Entrada name="linha_card" defaultValue={t("linha_card")} />
            </Campo>
            <Campo
              rotulo="Sobre o empreendimento"
              apoio="Deixe uma linha em branco entre os parágrafos."
            >
              <Area name="sobre" rows={6} defaultValue={t("sobre")} />
            </Campo>
            <Campo rotulo="O conceito">
              <Area name="conceito" rows={3} defaultValue={t("conceito")} />
            </Campo>
            <Campo rotulo="A história do projeto">
              <Area name="historia" rows={3} defaultValue={t("historia")} />
            </Campo>
          </Cartao>

          <Cartao className="space-y-5 p-6">
            <Campo
              rotulo="Características do imóvel"
              apoio="Uma por linha."
            >
              <Area
                name="caracteristicas"
                rows={5}
                defaultValue={linhas(dados.caracteristicas)}
              />
            </Campo>
            <Campo rotulo="Diferenciais" apoio="Um por linha.">
              <Area
                name="diferenciais"
                rows={6}
                defaultValue={linhas(dados.diferenciais)}
              />
            </Campo>
          </Cartao>

          <Cartao className="space-y-5 p-6">
            <Campo rotulo="Chamada do atendimento">
              <Area
                name="atendimento_chamada"
                rows={2}
                defaultValue={t("atendimento_chamada")}
              />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <Campo rotulo="Legenda da galeria">
              <Entrada
                name="legenda_galeria"
                defaultValue={t("legenda_galeria")}
              />
            </Campo>
          </Cartao>
        </Painel>

        {/* ========================================= ficha técnica */}
        <Painel ativo={aba === "ficha"}>
          <Cartao className="space-y-5 p-6">
            <p className="text-sm leading-relaxed text-[var(--fg-tenue)]">
              Campo deixado em branco não aparece no site — nem o rótulo
              dele. É assim que valores ainda não confirmados ficam
              escondidos até a CS preencher.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Unidades" apoio="Ex.: 100 casas">
                <Entrada
                  name="unidades_total"
                  defaultValue={t("unidades_total")}
                />
              </Campo>
              <Campo rotulo="Área construída" apoio="Ex.: 56 m²">
                <Entrada
                  name="area_construida"
                  defaultValue={t("area_construida")}
                />
              </Campo>
              <Campo
                rotulo="Terreno, dimensões"
                apoio="Ex.: 10 x 25 m"
              >
                <Entrada
                  name="terreno_dimensoes"
                  defaultValue={t("terreno_dimensoes")}
                />
              </Campo>
              <Campo rotulo="Terreno, área total" apoio="Ex.: 250 m²">
                <Entrada
                  name="terreno_area"
                  defaultValue={t("terreno_area")}
                />
              </Campo>
              <Campo rotulo="Vagas">
                <Entrada name="vagas" defaultValue={t("vagas")} />
              </Campo>
              <Campo rotulo="Previsão de entrega">
                <Entrada
                  name="previsao_entrega"
                  defaultValue={t("previsao_entrega")}
                />
              </Campo>
              <Campo
                rotulo="Valor a partir de"
                apoio="Só números. Em branco ou zero, o campo some do site."
              >
                <Entrada
                  name="valor_a_partir_de"
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
            </div>

            <Campo rotulo="Distribuição">
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
          <Cartao className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="Endereço">
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
            </div>
            <Campo rotulo="Texto da localização">
              <Area
                name="localizacao_texto"
                rows={2}
                defaultValue={t("localizacao_texto")}
              />
            </Campo>
            <Campo
              rotulo="Pontos de referência"
              apoio="Um por linha. Ex.: A 10 minutos do shopping"
            >
              <Area
                name="referencias"
                rows={4}
                defaultValue={linhas(dados.referencias)}
              />
            </Campo>
            <Campo rotulo="Link do Google Maps">
              <Entrada name="mapa_link" defaultValue={t("mapa_link")} />
            </Campo>
            <EnviarImagem
              nome="mapa_imagem"
              valor={t("mapa_imagem") || null}
              pasta={`empreendimentos/${t("slug") || "novo"}`}
              rotulo="Imagem do mapa"
              apoio="A imagem personalizada da localização, com a identidade do empreendimento."
              larguraIdeal={1600}
              alturaIdeal={1200}
            />
          </Cartao>
        </Painel>

        {/* ================================================= Google */}
        <Painel ativo={aba === "busca"}>
          <Cartao className="space-y-5 p-6">
            <Campo
              rotulo="Título no Google"
              apoio="Até 60 caracteres. Em branco, usa o nome do empreendimento."
            >
              <Entrada name="seo_titulo" defaultValue={t("seo_titulo")} />
            </Campo>
            <Campo rotulo="Descrição no Google" apoio="Até 155 caracteres.">
              <Area
                name="seo_descricao"
                rows={3}
                defaultValue={t("seo_descricao")}
              />
            </Campo>
          </Cartao>
        </Painel>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--borda)] bg-[var(--bg)] py-4">
        <Salvar>Salvar empreendimento</Salvar>
        {estado.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-verde-600)]">
            <Check className="h-4 w-4" />
            Salvo
          </span>
        ) : null}
        {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      </div>
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
    <div className={cn("space-y-6", !ativo && "hidden")} aria-hidden={!ativo}>
      {children}
    </div>
  );
}
