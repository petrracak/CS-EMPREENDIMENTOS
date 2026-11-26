import type { Metadata } from "next";
import Link from "next/link";

import { PaginaLegal } from "@/components/site/pagina-legal";
import { lerEmpresa } from "@/lib/settings";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a CS Empreendimentos coleta, usa e protege os dados de quem se cadastra no site, conforme a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default async function PoliticaDePrivacidade() {
  const e = await lerEmpresa();

  return (
    <PaginaLegal
      olho="Privacidade"
      titulo="Política de privacidade"
      atualizado="26 de novembro de 2026"
      introducao={
        <p>
          A <strong>{e.razao_social}</strong> (CS Empreendimentos), CNPJ{" "}
          {e.cnpj}, é a controladora dos dados pessoais recebidos por este site.
          Esta política explica, em linguagem direta, o que coletamos, para quê
          e quais são os seus direitos, conforme a Lei Geral de Proteção de
          Dados (Lei nº 13.709/2018).
        </p>
      }
      secoes={[
        {
          titulo: "Que dados coletamos",
          conteudo: (
            <>
              <p>Nos formulários de cadastro, só o que você escolhe enviar:</p>
              <ul>
                <li>nome e contato (WhatsApp ou telefone);</li>
                <li>
                  profissão, renda mensal e valor disponível para entrada,
                  quando informados;
                </li>
                <li>o empreendimento de interesse;</li>
                <li>a página do site de onde o cadastro foi enviado.</li>
              </ul>
              <p>
                Durante a navegação, o site guarda no seu navegador pequenas
                marcações para funcionar bem, como lembrar que um aviso já foi
                visto. Com a sua permissão, também podem ser usadas ferramentas
                de medição de visitas e de anúncios.
              </p>
            </>
          ),
        },
        {
          titulo: "Para que usamos",
          conteudo: (
            <ul>
              <li>
                entrar em contato e fazer o atendimento comercial que você
                pediu;
              </li>
              <li>
                indicar os empreendimentos e as condições que combinam com o seu
                perfil;
              </li>
              <li>
                entender quais páginas e campanhas trazem interessados, de forma
                agregada;
              </li>
              <li>cumprir obrigações legais e proteger o site contra abuso.</li>
            </ul>
          ),
        },
        {
          titulo: "Base legal",
          conteudo: (
            <p>
              O atendimento comercial se apoia no seu{" "}
              <strong>consentimento</strong>, dado ao marcar a caixa do
              formulário, e em procedimentos preliminares a um contrato. A
              segurança do site e a prevenção de fraude se apoiam no legítimo
              interesse da CS. Cookies de medição e de anúncios só são usados
              com a sua permissão.
            </p>
          ),
        },
        {
          titulo: "Com quem compartilhamos",
          conteudo: (
            <>
              <p>
                A CS <strong>não vende</strong> nem aluga dados pessoais. Eles
                ficam com a equipe comercial da CS e com os serviços que fazem o
                site funcionar, todos sob contrato e com medidas de segurança:
              </p>
              <ul>
                <li>hospedagem do site (Vercel);</li>
                <li>banco de dados e armazenamento (Supabase);</li>
                <li>WhatsApp, quando o atendimento acontece por lá;</li>
                <li>
                  ferramentas de medição e anúncios, só com a sua permissão.
                </li>
              </ul>
              <p>
                Alguns desses serviços podem guardar dados fora do Brasil, com
                as garantias que a LGPD exige.
              </p>
            </>
          ),
        },
        {
          titulo: "Por quanto tempo guardamos",
          conteudo: (
            <p>
              Os dados de cadastro ficam guardados enquanto houver atendimento
              em andamento e por até 2 anos depois do último contato, a menos
              que você peça para apagar antes ou que a lei exija guardar por
              mais tempo, como em contratos assinados.
            </p>
          ),
        },
        {
          titulo: "Seus direitos",
          conteudo: (
            <>
              <p>A qualquer momento, você pode pedir:</p>
              <ul>
                <li>
                  a confirmação de que tratamos os seus dados e uma cópia deles;
                </li>
                <li>a correção de dados incompletos ou desatualizados;</li>
                <li>a exclusão dos dados ou o fim do contato;</li>
                <li>informações sobre com quem eles foram compartilhados;</li>
                <li>a revogação do consentimento.</li>
              </ul>
              <p>
                É só escrever para <a href={`mailto:${e.email}`}>{e.email}</a>.
                Respondemos em até 15 dias. Você também pode procurar a
                Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </>
          ),
        },
        {
          titulo: "Cookies",
          conteudo: (
            <p>
              Na primeira visita, um aviso pergunta se você aceita os cookies de
              medição. Os essenciais, que fazem o site funcionar, ficam sempre
              ligados. Para mudar a escolha, basta limpar os dados de navegação
              do site no seu navegador; o aviso aparece de novo.
            </p>
          ),
        },
        {
          titulo: "Segurança",
          conteudo: (
            <p>
              Os dados viajam criptografados (HTTPS) e ficam num banco com
              acesso restrito à equipe autorizada da CS, com login individual e
              regras de permissão por função. Nenhum sistema é infalível, mas
              trabalhamos para reduzir os riscos e avisamos os titulares e a
              ANPD se houver um incidente relevante.
            </p>
          ),
        },
        {
          titulo: "Contato e mudanças",
          conteudo: (
            <p>
              Dúvidas sobre privacidade vão para{" "}
              <a href={`mailto:${e.email}`}>{e.email}</a> ou para o endereço{" "}
              {e.endereco}. Esta política pode ser atualizada; a data no topo
              mostra a versão em vigor. Veja também os{" "}
              <Link prefetch={false} href="/termos-de-uso">
                Termos de uso e compromisso
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
