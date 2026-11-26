/**
 * Dados estruturados (schema.org) na página, para o Google e as IAs
 * entenderem quem é a CS, o que é cada empreendimento e cada publicação.
 * O "<" vira <: um texto do painel com "</script>" não fecha a tag.
 */
export function DadosEstruturados({ dados }: { dados: object | object[] }) {
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
