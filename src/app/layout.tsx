import type { Metadata, Viewport } from "next";

import { switzer } from "@/lib/fontes";
import { IMAGEM_PADRAO, SITE_URL } from "@/lib/seo";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CS Empreendimentos | Casas e apartamentos em Santarém",
    template: "%s | CS Empreendimentos",
  },
  description:
    "Construtora e incorporadora em Santarém desde 2016. Casas, apartamentos e terrenos com projeto bem pensado e acabamento de qualidade.",
  applicationName: "CS Empreendimentos",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CS Empreendimentos",
    images: [
      {
        url: IMAGEM_PADRAO,
        width: 1200,
        height: 630,
        alt: "CS Empreendimentos, casas e apartamentos em Santarém",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/marca/favicon-fonte.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#004527",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning só vale para os atributos do próprio <html>:
    // a abertura da página inicial marca data-sem-abertura nele antes de
    // o React carregar (ver components/site/abertura.tsx).
    <html lang="pt-BR" className={switzer.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
