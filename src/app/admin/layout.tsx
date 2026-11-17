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
  return children;
}
