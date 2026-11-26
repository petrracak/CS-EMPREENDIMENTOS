import type { CSSProperties, ReactNode } from "react";

import { BotaoNovo } from "@/components/site/botao-novo";
import { Simbolo } from "@/components/site/logo";
import { Palavras } from "@/components/site/palavras";
import { VitrineLogo } from "@/components/site/vitrine-logo";
import type { FotoVitrine } from "@/lib/vitrine";

/**
 * A primeira dobra do redesenho (Figma "DOBRAS SITE PRINCIPAL", 83:96 e
 * 83:124), a primeira dobra da página inicial.
 *
 * O fundo é uma imagem só, exportada do Figma: as linhas da marca sobre
 * o menta. À direita, a logo da CS com os empreendimentos passando por
 * dentro em preto e branco (VitrineLogo; quem escolhe as fotos é
 * lib/vitrine.ts). O texto e os botões ficam por cima, em HTML.
 *
 * No computador tudo é medido na unidade do quadro do Figma (--u, ver
 * .topo-novo em globals.css): 1 px do desenho até 1280 px de tela, e
 * proporcional abaixo disso. Assim foto, texto e botões encolhem juntos
 * e não se atropelam. Abaixo de 1024 px (celular e tablet em pé) vale o
 * quadro MOBILE: a logo no topo, centrada, e o texto logo abaixo.
 */
export function TopoNovo({
  chamada,
  titulo,
  subtitulo,
  botaoPrimario,
  botaoPrimarioUrl,
  botaoSecundario,
  whatsapp,
  fotos,
}: {
  chamada: string;
  titulo: string;
  subtitulo: ReactNode;
  botaoPrimario: string;
  botaoPrimarioUrl: string;
  botaoSecundario: string;
  whatsapp: string;
  fotos: FotoVitrine[];
}) {
  const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

  return (
    <section className="topo-novo">
      {/* O fundo do Figma: as linhas da marca sobre o menta. No celular é
          a mesma imagem em escala menor (ver .topo-novo-foto). */}
      <div className="topo-novo-foto" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/topo-fundo.webp"
          srcSet="/site/topo-fundo.webp 1464w, /site/topo-fundo@2x.webp 2928w"
          sizes="(min-width: 1280px) 1464px, (min-width: 1024px) 114.4vw, min(142vw, 796px)"
          width={1464}
          height={962}
          alt=""
          // É o maior elemento da primeira tela (o que o Google mede como
          // LCP): pede prioridade para baixar antes do resto.
          fetchPriority="high"
          className="topo-novo-fundo"
        />
      </div>

      {/* A logo da CS com os empreendimentos passando por dentro. */}
      <div
        className="topo-novo-vitrine"
        role="img"
        aria-label="Empreendimentos da CS em Santarém"
        data-entrada
        style={atraso(300)}
      >
        <VitrineLogo fotos={fotos} />
      </div>

      <div className="topo-novo-texto">
        <p className="topo-novo-chamada" data-entrada>
          <Simbolo className="topo-novo-chamada-icone" />
          {chamada}
        </p>

        <Palavras
          como="h1"
          modo="entrada"
          atraso={120}
          passo={60}
          html={titulo}
          className="topo-novo-titulo"
        />

        <p className="topo-novo-subtitulo" data-entrada style={atraso(620)}>
          {subtitulo}
        </p>

        <div className="topo-novo-botoes" data-entrada style={atraso(760)}>
          <BotaoNovo href={botaoPrimarioUrl}>{botaoPrimario}</BotaoNovo>
          <BotaoNovo href={whatsapp} tipo="secundario" icone="zap">
            {botaoSecundario}
          </BotaoNovo>
        </div>
      </div>
    </section>
  );
}
