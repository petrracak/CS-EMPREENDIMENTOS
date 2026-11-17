import type { Metadata } from "next";

import { FiltrosEmpreendimentos } from "@/components/site/filtros-empreendimentos";
import { Olho, Secao, Titulo } from "@/components/site/ui";
import { listarEmpreendimentos, listarTipos } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Empreendimentos em Santarém",
  description:
    "Casas, apartamentos e terrenos da CS em Santarém, em obra e já entregues. Veja as unidades de cada empreendimento.",
};

export default async function PaginaEmpreendimentos() {
  const [itens, tipos] = await Promise.all([
    listarEmpreendimentos(),
    listarTipos(),
  ]);

  return (
    <Secao className="pt-14 md:pt-20">
      <div data-revelar className="max-w-2xl">
        <Olho>O que construímos</Olho>
        <Titulo
          nivel="h1"
          antes="Nossos"
          destaque="empreendimentos"
          className="text-display-md sm:text-display-lg mt-5"
        />
        <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
          Projetos da CS em Santarém, em obra e já entregues. Abra um
          empreendimento para ver as unidades disponíveis.
        </p>
      </div>

      <FiltrosEmpreendimentos itens={itens} tipos={tipos} />
    </Secao>
  );
}
