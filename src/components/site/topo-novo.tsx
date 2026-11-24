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
 * e não se atropelam. Abaixo de 1024 px (celular e tablet em pé) a foto
 * vira uma faixa no topo e o texto desce para baixo dela, no fluxo normal.
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
      {/* Uma imagem só, a do quadro do computador. No celular ela é
          recortada em volta do Girlan (ver .topo-novo-foto): a versão
          de celular do Figma deixava ele com 95 px de largura. */}
      <div className="topo-novo-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-nova/topo-computador.webp"
          srcSet="/home-nova/topo-computador.webp 1464w, /home-nova/topo-computador@2x.webp 2928w"
          sizes="(min-width: 1280px) 1464px, (min-width: 1024px) 114.4vw, min(103vw, 659px)"
          width={1464}
          height={962}
          alt="Girlan Carneiro, CEO e fundador da CS, em frente a um dos prédios da construtora"
          fetchPriority="high"
          className="topo-novo-fundo"
        />
      </div>

      <div className="topo-novo-selo" data-entrada style={atraso(900)}>
        <span className="topo-novo-selo-cargo">CEO e fundador</span>
        {/* A assinatura é o desenho do Figma convertido em curva: a fonte
            manuscrita não precisa vir junto com o site. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-nova/assinatura-girlan.svg"
          alt="Girlan Carneiro"
          width={183}
          height={31}
          className="topo-novo-assinatura"
        />
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
            {botaoPrimario}
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
