import { Cabecalho } from "@/components/site/cabecalho";
import { FaixaCampanha } from "@/components/site/faixa-campanha";
import { Revelar } from "@/components/site/revelar";
import { Rodape } from "@/components/site/rodape";
import { WhatsappFlutuante } from "@/components/site/whatsapp-flutuante";
import { bool, lerConfigs, lerEmpresa, txt } from "@/lib/settings";
import { lerMensagemDaFaixa } from "@/lib/texto-rico";

export default async function LayoutDoSite({
  children,
}: {
  children: React.ReactNode;
}) {
  const [configs, empresa] = await Promise.all([
    lerConfigs(["faixa_campanha", "whatsapp_flutuante"]),
    lerEmpresa(),
  ]);

  const faixa = configs.faixa_campanha;
  const zap = configs.whatsapp_flutuante;

  return (
    <>
      {bool(faixa, "ativo") ? (
        <FaixaCampanha
          mensagem={lerMensagemDaFaixa(faixa)}
          linkTexto={txt(faixa, "link_texto")}
          linkUrl={txt(faixa, "link_url", "/cadastro")}
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

      {/* Liga as animações de entrada depois que a página monta. */}
      <Revelar />
    </>
  );
}
