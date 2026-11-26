import { Suspense } from "react";

import { TelaLogin } from "@/components/admin/tela-login";
import { fotosDaVitrine } from "@/lib/vitrine";

export const metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

// As fotos mudam pouco: a página é refeita no máximo de hora em hora.
export const revalidate = 3600;

export default async function PaginaLogin() {
  // As mesmas fotos que passam dentro da logo no topo do site.
  const fotos = await fotosDaVitrine();

  return (
    // useSearchParams (o redirect e o aviso de acesso) pede Suspense.
    <Suspense>
      <TelaLogin fotos={fotos} />
    </Suspense>
  );
}
