import type { Metadata, Viewport } from "next";

import { switzer } from "@/lib/fontes";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CS Empreendimentos | Casas e apartamentos em Santarém",
    template: "%s | CS Empreendimentos",
  },
  description:
    "Construtora e incorporadora em Santarém desde 2016. Casas, apartamentos e terrenos com projeto bem pensado e acabamento de qualidade.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CS Empreendimentos",
  },
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
    <html lang="pt-BR" className={switzer.variable}>
      <body>{children}</body>
    </html>
  );
}
