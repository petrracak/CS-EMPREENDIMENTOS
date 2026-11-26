import type { Metadata } from "next";
import Link from "next/link";

import { PaginaLegal } from "@/components/site/pagina-legal";
import { lerEmpresa } from "@/lib/settings";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Termos de uso e compromisso",
  description:
    "As regras de uso do site da CS Empreendimentos e o compromisso da construtora com quem busca um imóvel em Santarém.",
  alternates: { canonical: "/termos-de-uso" },
};

export default async function TermosDeUso() {
  const e = await lerEmpresa();

  return (
    <PaginaLegal
      olho="Termos"
      titulo="Termos de uso e compromisso"
      atualizado="26 de novembro de 2026"
      introducao={
        <p>
          Estes termos valem para quem usa o site da{" "}
          <strong>{e.razao_social}</strong> (CS Empreendimentos), CNPJ {e.cnpj},
          com sede em {e.endereco}. Ao navegar ou enviar um cadastro, você
          concorda com o que está aqui. Se tiver qualquer dúvida, fale com a
          gente pelo e-mail <a href={`mailto:${e.email}`}>{e.email}</a>.
        </p>
      }
      secoes={[
        {
          titulo: "O que é este site",
          conteudo: (
            <p>
              O site apresenta a CS e os seus empreendimentos em Santarém,
              publica conteúdos no blog e recebe o contato de quem quer ser
              atendido. Ele é <strong>informativo</strong>: nenhuma compra,
              reserva ou proposta se conclui por aqui. Toda negociação acontece
              com a equipe comercial e só vale depois de formalizada em
              contrato.
            </p>
          ),
        },
        {
          titulo: "Imagens, valores e condições",
          conteudo: (
            <>
              <p>
                Perspectivas, renders e fotos de decoração são{" "}
                <strong>ilustrativos</strong>. Móveis, objetos, paisagismo e
                acabamentos mostrados podem não fazer parte do que é entregue. O
                que vale é o memorial descritivo e o contrato de cada unidade.
              </p>
              <p>
                Valores, metragens, disponibilidade de unidades, prazos de
                entrega e condições de pagamento podem mudar sem aviso, e são
                confirmados pela equipe comercial no momento do atendimento.
              </p>
            </>
          ),
        },
        {
          titulo: "O nosso compromisso",
          conteudo: (
            <>
              <p>Quando você fala com a CS, a gente se compromete a:</p>
              <ul>
                <li>
                  responder com informação clara sobre cada empreendimento e
                  cada unidade;
                </li>
                <li>
                  mostrar o registro de incorporação e os documentos do projeto
                  quando pedidos;
                </li>
                <li>
                  usar os seus dados só para o atendimento que você pediu;
                </li>
                <li>não enviar mensagens depois que você pedir para parar.</li>
              </ul>
            </>
          ),
        },
        {
          titulo: "O seu compromisso",
          conteudo: (
            <p>
              Ao usar o site, você se compromete a informar dados verdadeiros
              nos cadastros, a não usar o site para fins ilegais, a não tentar
              acessar áreas restritas, como o painel de administração, e a não
              copiar o conteúdo para uso comercial sem autorização.
            </p>
          ),
        },
        {
          titulo: "Propriedade intelectual",
          conteudo: (
            <p>
              Marcas, logos, textos, fotos, plantas e o desenho do site
              pertencem à CS ou a quem autorizou o uso. Você pode compartilhar
              links e páginas do site; a reprodução do conteúdo para outros fins
              depende de autorização por escrito.
            </p>
          ),
        },
        {
          titulo: "Links para outros sites",
          conteudo: (
            <p>
              O site leva a serviços de terceiros, como WhatsApp, Instagram,
              Facebook e Google Maps. Cada um tem as próprias regras e
              políticas, e a CS não responde pelo conteúdo deles.
            </p>
          ),
        },
        {
          titulo: "Dados pessoais",
          conteudo: (
            <p>
              Como a CS trata os dados que você envia está na{" "}
              <Link prefetch={false} href="/politica-de-privacidade">
                Política de privacidade
              </Link>
              , que faz parte destes termos.
            </p>
          ),
        },
        {
          titulo: "Mudanças nestes termos",
          conteudo: (
            <p>
              Podemos atualizar estes termos para acompanhar mudanças no site ou
              na lei. A data no topo da página mostra a versão em vigor.
            </p>
          ),
        },
        {
          titulo: "Foro",
          conteudo: (
            <p>
              Estes termos seguem a lei brasileira. Fica eleito o foro da
              comarca de Santarém, Pará, para resolver qualquer questão sobre
              eles, salvo quando a lei garantir ao consumidor o foro do próprio
              domicílio.
            </p>
          ),
        },
      ]}
    />
  );
}
