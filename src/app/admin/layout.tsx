import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel da CS",
  // O painel não deve aparecer em busca nenhuma.
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  // .painel leva o design novo para o painel e a tela de login (ver
  // globals.css): mesma fonte, cores e botões do site.
  return <div className="painel">{children}</div>;
}
