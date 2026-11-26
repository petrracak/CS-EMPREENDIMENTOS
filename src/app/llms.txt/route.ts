import { SITE_URL } from "@/lib/seo";
import { lerEmpresa } from "@/lib/settings";
import { createPublicClient } from "@/lib/supabase/public";
import { SITUACOES } from "@/lib/utils";

export const revalidate = 3600;

/**
 * /llms.txt: um resumo do site em texto, no formato que ChatGPT, Claude,
 * Perplexity e outras IAs procuram para entender e citar uma empresa.
 * Sai do banco, então acompanha os empreendimentos e o blog sozinho.
 */
export async function GET() {
  const supabase = createPublicClient();
  const [empresa, { data: obras }, { data: posts }] = await Promise.all([
    lerEmpresa(),
    supabase
      .from("empreendimentos")
      .select(
        "slug, nome, situacao, bairro, cidade, frase_impacto, unidades_total, area_construida, previsao_entrega, tipo:tipos_empreendimento (nome)",
      )
      .eq("status", "publicado")
      .order("ordem"),
    supabase
      .from("posts")
      .select("slug, titulo, resumo")
      .eq("status", "publicado")
      .order("publicado_em", { ascending: false }),
  ]);

  const linhaObra = (o: NonNullable<typeof obras>[number]) => {
    const tipo = (o.tipo as unknown as { nome?: string } | null)?.nome;
    const situacao = SITUACOES[o.situacao as keyof typeof SITUACOES]?.rotulo;
    const detalhes = [
      tipo,
      situacao,
      o.bairro ? `${o.bairro}, ${o.cidade}` : o.cidade,
      o.unidades_total,
      o.area_construida,
      o.previsao_entrega ? `entrega prevista: ${o.previsao_entrega}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    const frase = o.frase_impacto ? ` ${o.frase_impacto}` : "";
    return `- [${o.nome}](${SITE_URL}/empreendimentos/${o.slug}): ${detalhes}.${frase}`;
  };

  const texto = [
    "# CS Empreendimentos",
    "",
    "> Construtora e incorporadora de Santarém, no Pará, desde 2016. Projeta, constrói e vende casas em condomínio fechado, apartamentos, flats e terrenos. Até 2026, entregou 140 unidades em Santarém. Fundador e CEO: Girlan Carneiro.",
    "",
    "## Contato",
    "",
    empresa.razao_social
      ? `- Razão social: ${empresa.razao_social}${empresa.cnpj ? ` (CNPJ ${empresa.cnpj})` : ""}`
      : null,
    empresa.endereco ? `- Endereço: ${empresa.endereco}` : null,
    empresa.whatsapp ? `- WhatsApp: ${empresa.whatsapp}` : null,
    empresa.email ? `- E-mail: ${empresa.email}` : null,
    empresa.atendimento ? `- Atendimento: ${empresa.atendimento}` : null,
    empresa.instagram ? `- Instagram: ${empresa.instagram}` : null,
    `- Cadastro de interessados: ${SITE_URL}/cadastro`,
    "",
    "## Empreendimentos",
    "",
    ...(obras ?? []).map(linhaObra),
    "",
    "## Blog",
    "",
    ...(posts ?? []).map(
      (p) =>
        `- [${p.titulo}](${SITE_URL}/blog/${p.slug})${p.resumo ? `: ${p.resumo}` : ""}`,
    ),
    "",
    "## Páginas",
    "",
    `- [Página inicial](${SITE_URL}/)`,
    `- [Todos os empreendimentos](${SITE_URL}/empreendimentos)`,
    `- [Blog](${SITE_URL}/blog)`,
    `- [Termos de uso e compromisso](${SITE_URL}/termos-de-uso)`,
    `- [Política de privacidade](${SITE_URL}/politica-de-privacidade)`,
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return new Response(texto, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
