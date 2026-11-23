import type { Metadata } from "next";

import { Cabecalho } from "@/components/site/cabecalho";
import { FaixaCampanha } from "@/components/site/faixa-campanha";
import { PopupSaida } from "@/components/site/popup-saida";
import { Rastreamento } from "@/components/site/rastreamento";
import { Revelar } from "@/components/site/revelar";
import { Rodape } from "@/components/site/rodape";
import { WhatsappFlutuante } from "@/components/site/whatsapp-flutuante";
import { bool, lerConfigs, lerEmpresa, txt } from "@/lib/settings";
import { temaDaFaixa } from "@/lib/temas-faixa";
import { lerMensagemDaFaixa, lerTitulo } from "@/lib/texto-rico";
import { listarDestaques, listarParaSelecao } from "@/lib/queries";
import { lerRastreamento, temRastreio } from "@/lib/rastreamento";

/** As tags de verificação de domínio do Meta e do Google, do painel. */
export async function generateMetadata(): Promise<Metadata> {
  const { rastreamento } = await lerConfigs(["rastreamento"]);
  const r = lerRastreamento(rastreamento);
  const outras: Record<string, string> = {};
  if (r.verificacao_meta) outras["facebook-domain-verification"] = r.verificacao_meta;
  return {
    verification: {
      ...(r.verificacao_google ? { google: r.verificacao_google } : {}),
      ...(Object.keys(outras).length ? { other: outras } : {}),
    },
  };
}

export default async function LayoutDoSite({
  children,
}: {
  children: React.ReactNode;
}) {
  const [configs, empresa, destaques, empreendimentos] = await Promise.all([
    lerConfigs(["faixa_campanha", "whatsapp_flutuante", "popup_saida", "rastreamento"]),
    lerEmpresa(),
    listarDestaques(3),
    listarParaSelecao(),
  ]);

  const faixa = configs.faixa_campanha;
  const zap = configs.whatsapp_flutuante;
  const saida = configs.popup_saida;
  const rastreio = lerRastreamento(configs.rastreamento);

  return (
    <>
      {bool(faixa, "ativo") ? (
        <FaixaCampanha
          mensagem={lerMensagemDaFaixa(faixa)}
          linkTexto={txt(faixa, "link_texto")}
          linkUrl={txt(faixa, "link_url", "/cadastro")}
          tema={temaDaFaixa(faixa?.tema)}
        />
      ) : null}

      <Cabecalho whatsapp={empresa.whatsapp_link} />

      <main id="conteudo">{children}</main>

      <Rodape />

      {bool(zap, "ativo") ? (
        <WhatsappFlutuante
          link={empresa.whatsapp_link}
          texto={txt(zap, "texto", "Fale com a CS")}
        />
      ) : null}

      {bool(saida, "ativo") ? (
        <PopupSaida
          olho={txt(saida, "olho")}
          titulo={lerTitulo(saida, "titulo", "Antes de ir, fale com a <mark>CS</mark>")}
          texto={txt(saida, "texto")}
          botao={txt(saida, "botao", "Quero ser atendido")}
          tituloDestaques={txt(
            saida,
            "titulo_destaques",
            "Ou conheça o que está em obra",
          )}
          destaques={destaques}
          empreendimentos={empreendimentos}
        />
      ) : null}

      {temRastreio(rastreio) ? <Rastreamento config={rastreio} /> : null}

      {/* Liga as animações de entrada depois que a página monta. */}
      <Revelar />
    </>
  );
}
