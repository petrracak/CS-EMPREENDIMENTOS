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
    // A Light entrou com o redesenho do site: título e texto
    // corrido em 300, só o destaque em 500.
    { path: "../fontes/Switzer-300.woff2", weight: "300", style: "normal" },
    { path: "../fontes/Switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../fontes/Switzer-500.woff2", weight: "500", style: "normal" },
    // 600 e 700 saíram: o layout novo é Light, e os poucos negritos
    // ficam em 500 (ver font-synthesis em globals.css). Duas fontes a
    // menos para baixar antes do primeiro texto, ~40 KB.
  ],
  variable: "--font-switzer",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
