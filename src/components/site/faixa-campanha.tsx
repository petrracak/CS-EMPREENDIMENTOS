"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { TextoRico } from "@/components/site/palavras";
import type { TemaFaixa } from "@/lib/temas-faixa";
import { cn } from "@/lib/utils";

/**
 * Faixa fina no topo, para campanhas pontuais (Black Friday e afins).
 *
 * A CS liga e desliga pelo painel. Quem fecha a faixa não a vê de novo
 * naquele navegador, mas trocar o texto no painel faz a faixa voltar:
 * a marca guardada é o próprio texto, então campanha nova é faixa nova.
 *
 * A mensagem vem do mesmo editor dos títulos (ver lib/texto-rico.ts):
 * negrito, itálico, sublinhado e o destaque dourado onde a CS marcar.
 */
export function FaixaCampanha({
  mensagem,
  linkTexto,
  linkUrl,
  tema,
}: {
  mensagem: string;
  linkTexto: string;
  linkUrl: string;
  tema: TemaFaixa;
}) {
  const [aberta, setAberta] = useState(true);

  useEffect(() => {
    try {
      setAberta(localStorage.getItem("cs:faixa") !== mensagem);
    } catch {
      // Navegador anônimo ou armazenamento bloqueado: mostra a faixa.
      setAberta(true);
    }
  }, [mensagem]);

  if (!aberta) return null;

  function fechar() {
    setAberta(false);
    try {
      localStorage.setItem("cs:faixa", mensagem);
    } catch {
      // Não poder lembrar não é motivo para falhar.
    }
  }

  return (
    <FaixaVisual
      mensagem={mensagem}
      linkTexto={linkTexto}
      linkUrl={linkUrl}
      tema={tema}
      aoFechar={fechar}
    />
  );
}

/**
 * O desenho da faixa, sem a lógica de fechar. O painel usa este mesmo
 * componente na prévia, então o que a CS vê lá é o que vai ao ar.
 */
export function FaixaVisual({
  mensagem,
  linkTexto,
  linkUrl,
  tema = "verde",
  aoFechar,
  previa,
}: {
  mensagem: string;
  linkTexto: string;
  linkUrl: string;
  tema?: TemaFaixa;
  aoFechar?: () => void;
  /** Na prévia do painel o link não navega. */
  previa?: boolean;
}) {
  const externo = /^(https?:|mailto:|tel:)/.test(linkUrl);
  const classeLink =
    "group inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-[var(--faixa-botao)] px-4 text-[0.8125rem] font-semibold text-[var(--faixa-botao-texto)] sm:min-h-8 sm:px-3.5 shadow-[0_0_0_1px_rgb(255_255_255/0.25),0_4px_14px_-4px_rgb(0_0_0/0.35)] transition-[background-color,transform] duration-300 hover:-translate-y-px hover:bg-[var(--faixa-botao-hover)]";

  const conteudoLink = (
    <>
      {linkTexto}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
    </>
  );

  return (
    <div
      data-tema={tema}
      className={cn(
        "faixa-campanha relative isolate overflow-hidden",
        !previa && "z-50",
      )}
    >
      {/* No celular o texto e o link empilham. Em linha, cada um ficava
          com metade de 375 px e a frase virava seis linhas. */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-4 gap-y-2 px-10 py-2.5 text-center text-[0.8125rem] sm:flex-row sm:flex-wrap">
        <p className="leading-snug">
          {/* O ponto que pulsa: diz "isto é agora" sem precisar de texto.
              Fica na linha do texto, para acompanhar a frase quando ela
              quebra em duas. */}
          <span
            aria-hidden
            className="relative mr-2.5 inline-flex h-2 w-2 -translate-y-px align-middle"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--faixa-ponto)] opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--faixa-ponto)]" />
          </span>
          <TextoRico html={mensagem} tom="ouro" />
        </p>
        {linkTexto ? (
          previa ? (
            <span className={classeLink}>{conteudoLink}</span>
          ) : (
            <Link
              href={linkUrl || "/cadastro"}
              className={classeLink}
              {...(externo
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {conteudoLink}
            </Link>
          )
        ) : null}
      </div>

      {aoFechar || previa ? (
        <button
          type="button"
          onClick={aoFechar}
          tabIndex={previa ? -1 : undefined}
          aria-label="Fechar aviso"
          className="absolute top-1/2 right-1 z-10 -translate-y-1/2 rounded-full p-3 opacity-60 transition-[opacity,background-color] hover:bg-black/10 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
