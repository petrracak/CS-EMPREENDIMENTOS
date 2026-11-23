import { Suspense } from "react";

import { TelaLogin, type Slide } from "@/components/admin/tela-login";
import { listarEmpreendimentos } from "@/lib/queries";

export const metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

// As fotos mudam pouco: a página é refeita no máximo de hora em hora.
export const revalidate = 3600;

const SITUACAO: Record<string, string> = {
  em_construcao: "Em construção",
  em_acabamento: "Em acabamento",
  entregue: "Entregue",
};

export default async function PaginaLogin() {
  const empreendimentos = await listarEmpreendimentos();

  const slides: Slide[] = empreendimentos
    .filter((e) => e.imagem_principal)
    .slice(0, 6)
    .map((e) => ({
      nome: e.nome,
      local: [e.bairro, e.cidade].filter(Boolean).join(", "),
      imagem: e.imagem_principal!,
      situacao: SITUACAO[e.situacao] ?? "Empreendimento CS",
    }));

  return (
    // useSearchParams (o redirect e o aviso de acesso) pede Suspense.
    <Suspense>
      <TelaLogin slides={slides} />
    </Suspense>
  );
}
