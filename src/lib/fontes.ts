import localFont from "next/font/local";

/**
 * Switzer, do Fontshare, servida pelo próprio site.
 *
 * Os arquivos ficam em src/fontes e não no CDN do Fontshare: uma família
 * baixada de outro domínio custa uma conexão nova antes do primeiro texto
 * aparecer, e o site é lido em Santarém, longe dos nós de borda.
 *
 * `swap` deixa o texto aparecer na fonte do sistema enquanto a Switzer
 * carrega — ninguém fica olhando para um título invisível.
 */
export const switzer = localFont({
  src: [
    { path: "../fontes/Switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../fontes/Switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../fontes/Switzer-600.woff2", weight: "600", style: "normal" },
    { path: "../fontes/Switzer-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
