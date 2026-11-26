"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";

import { BotaoNovo } from "@/components/site/botao-novo";
import { urlDaMidia } from "@/lib/midia";

/**
 * Banner de campanha: a arte que o designer faz para uma ação (Black
 * Friday, feirão, lançamento), aberta como pop-up por cima do site.
 *
 * Duas artes: a do computador, deitada (1920 × 1080), e a do celular, em
 * pé (1080 × 1350). A do celular é opcional; sem ela, o celular mostra a
 * do computador inteira, na largura da tela.
 *
 * Embaixo da arte, o botão da campanha e um botão de fechar do mesmo
 * tamanho, escrito, para ninguém ficar caçando o X. O X também existe, no
 * canto, e o Esc e o toque fora fecham.
 *
 * Abre uma vez por visita, alguns segundos depois de a página aparecer
 * (na página inicial, depois da abertura). Trocar a arte no painel faz o
 * banner voltar para quem já tinha fechado o anterior.
 */

export type DadosBanner = {
  computador: string;
  celular: string | null;
  /** Texto alternativo da arte: o que ela diz, para quem não vê. */
  descricao: string;
  botao: string;
  botaoUrl: string;
  fechar: string;
};

/** Formatos das artes, largura sobre altura. */
export const FORMATO_COMPUTADOR = 16 / 9;
export const FORMATO_CELULAR = 4 / 5;

const VISTO = "cs:banner";

export function BannerCampanha({ dados }: { dados: DadosBanner }) {
  const caminho = usePathname();
  const dialogo = useRef<HTMLDialogElement>(null);
  const versao = `${dados.computador}|${dados.celular ?? ""}`;

  const fechar = useCallback(() => dialogo.current?.close(), []);

  // O botão da campanha leva a outra página do site sem recarregar: o
  // banner fecha junto com a troca de página.
  useEffect(() => fechar(), [caminho, fechar]);

  useEffect(() => {
    // Não abre na página para onde o próprio banner leva, nem no cadastro.
    const destino = dados.botaoUrl.split(/[?#]/)[0];
    if (caminho === "/cadastro" || caminho === destino) return;
    try {
      if (sessionStorage.getItem(VISTO) === versao) return;
    } catch {
      // Sem armazenamento, abre uma vez por página carregada.
    }

    // Na página inicial, a abertura com a logo dura uns 3 s na primeira
    // visita: o banner espera por ela.
    const comAbertura =
      caminho === "/" &&
      !document.documentElement.hasAttribute("data-sem-abertura");
    const timer = window.setTimeout(
      () => {
        const el = dialogo.current;
        if (!el || el.open || document.querySelector("dialog[open]")) return;
        try {
          sessionStorage.setItem(VISTO, versao);
        } catch {}
        el.showModal();
      },
      comAbertura ? 4200 : 1600,
    );
    return () => window.clearTimeout(timer);
  }, [caminho, versao, dados.botaoUrl]);

  return (
    <dialog
      ref={dialogo}
      aria-label={dados.descricao || "Campanha da CS"}
      className="banner-campanha"
      style={
        {
          "--formato-celular": dados.celular
            ? FORMATO_CELULAR
            : FORMATO_COMPUTADOR,
        } as CSSProperties
      }
      // Toque no fundo escuro fecha; toque no cartão, não.
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
    >
      <CartaoDoBanner dados={dados} aoFechar={fechar} />
    </dialog>
  );
}

/**
 * O cartão em si, sem a lógica de abrir. A prévia do painel usa o mesmo,
 * dentro do notebook e do iPhone, com `modo` fixo: lá a largura da
 * janela é a do painel, e não a do aparelho.
 */
export function CartaoDoBanner({
  dados,
  modo = "auto",
  aoFechar,
}: {
  dados: DadosBanner;
  modo?: "auto" | "computador" | "celular";
  aoFechar?: () => void;
}) {
  const grande = urlDaMidia(dados.computador || dados.celular);
  const doCelular = dados.celular ? urlDaMidia(dados.celular) : grande;
  const imagem =
    modo === "computador" ? grande : modo === "celular" ? doCelular : null;

  return (
    <div className="banner-cartao" data-modo={modo}>
      <a
        href={dados.botaoUrl}
        onClick={aoFechar}
        className="banner-arte"
        aria-label={dados.botao}
        tabIndex={-1}
      >
        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem} alt={dados.descricao} />
        ) : (
          <picture>
            <source media="(min-width: 768px)" srcSet={grande} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doCelular} alt={dados.descricao} />
          </picture>
        )}
      </a>

      <button
        type="button"
        onClick={aoFechar}
        className="banner-x"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="banner-acoes">
        <BotaoNovo href={dados.botaoUrl} className="banner-acao">
          {dados.botao}
        </BotaoNovo>
        <button
          type="button"
          onClick={aoFechar}
          className="botao-novo botao-novo-secundario banner-acao banner-fechar"
        >
          <X className="h-[1.1em] w-[1.1em]" strokeWidth={2} />
          <span>{dados.fechar}</span>
        </button>
      </div>
    </div>
  );
}
