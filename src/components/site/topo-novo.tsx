import Link from "next/link";
import type { CSSProperties } from "react";

import { Whatsapp } from "@/components/icones-sociais";
import { Simbolo } from "@/components/site/logo";
import { Palavras } from "@/components/site/palavras";

/**
 * A primeira dobra do redesenho (Figma "DOBRAS SITE PRINCIPAL", 83:96 e
 * 83:124), em teste em /home-nova.
 *
 * O fundo é uma imagem só, exportada do Figma: as linhas da marca, o
 * prédio dentro do "C" e o Girlan, já com o esfumado do pé. O texto, o
 * selo do fundador e os botões ficam por cima, em HTML.
 *
 * No computador tudo é medido na unidade do quadro do Figma (--u, ver
 * .topo-novo em globals.css): 1 px do desenho até 1280 px de tela, e
 * proporcional abaixo disso. Assim foto, texto e botões encolhem juntos
 * e não se atropelam. Abaixo de 1024 px (celular e tablet em pé) vale o
 * quadro MOBILE: foto grande no topo, selo sobre o peito do Girlan e o
 * texto centrado logo abaixo, subindo sobre o esfumado da foto.
 */
export function TopoNovo({
  chamada,
  titulo,
  subtitulo,
  botaoPrimario,
  botaoPrimarioUrl,
  botaoSecundario,
  whatsapp,
}: {
  chamada: string;
  titulo: string;
  subtitulo: string;
  botaoPrimario: string;
  botaoPrimarioUrl: string;
  botaoSecundario: string;
  whatsapp: string;
}) {
  const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

  return (
    <section className="topo-novo">
      {/* Uma imagem só, a do quadro do computador. No celular ela é a
          mesma composição em escala menor e recortada em volta do Girlan,
          como no quadro MOBILE do Figma (ver .topo-novo-foto). */}
      <div className="topo-novo-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-nova/topo-computador.webp"
          srcSet="/home-nova/topo-computador.webp 1464w, /home-nova/topo-computador@2x.webp 2928w"
          sizes="(min-width: 1280px) 1464px, (min-width: 1024px) 114.4vw, min(142vw, 796px)"
          width={1464}
          height={962}
          alt="Girlan Carneiro, CEO e fundador da CS, em frente a um dos prédios da construtora"
          fetchPriority="high"
          className="topo-novo-fundo"
        />
      </div>

      {/* Selo do fundador: o quadro de vidro do Figma com a assinatura
          no centro. Por fora, a entrada; por dentro, a flutuação lenta —
          as duas são animação, e no mesmo elemento uma apagaria a outra. */}
      <div className="topo-novo-selo" data-entrada style={atraso(900)}>
        <div className="topo-novo-selo-quadro">
          {/* "CEO e fundador" e a assinatura vêm num SVG só, em curvas:
              a fonte manuscrita não precisa vir junto com o site. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home-nova/selo-girlan.svg"
            alt="Girlan Carneiro, CEO e fundador"
            width={288}
            height={35}
            className="topo-novo-assinatura"
          />
        </div>
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
          <Link href={botaoPrimarioUrl} className="topo-novo-botao topo-novo-botao-primario">
            <span className="topo-novo-botao-rotulo">{botaoPrimario}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home-nova/seta.svg" alt="" width={24} height={24} className="topo-novo-seta" />
          </Link>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="topo-novo-botao topo-novo-botao-secundario"
          >
            <Whatsapp className="topo-novo-zap" />
            <span className="topo-novo-gradiente">{botaoSecundario}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
