import type { Metadata, Viewport } from "next";

import { RegistrarApp } from "@/components/admin/instalar-app";
import { Abertura } from "@/components/site/abertura";

/**
 * O manifesto do app mora aqui, no layout de todo o /admin, e não no da
 * área logada: assim quem instala a partir da tela de login também ganha
 * o app do painel (abre em /admin), e não o do site.
 */
export const metadata: Metadata = {
  title: "Painel da CS",
  // O painel não deve aparecer em busca nenhuma.
  robots: { index: false, follow: false },
  manifest: "/painel.webmanifest",
  appleWebApp: { capable: true, title: "Painel CS", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/marca/favicon-fonte.svg", type: "image/svg+xml" }],
    apple: [{ url: "/painel/apple-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f3faf6",
  viewportFit: "cover",
};

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  // .painel leva o design novo para o painel e a tela de login (ver
  // globals.css): mesma fonte, cores e botões do site.
  return (
    <div className="painel">
      <Abertura onde="painel" />
      {children}
      <RegistrarApp />
    </div>
  );
}
