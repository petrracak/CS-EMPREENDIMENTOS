"use client";

import { useEffect, useRef, useState } from "react";

import { FaixaVisual } from "@/components/site/faixa-campanha";
import { temaDaFaixa, type TemaFaixa } from "@/lib/temas-faixa";

/**
 * A faixa de campanha como vai aparecer no site, atualizada enquanto a
 * pessoa escreve. Usa o mesmo componente do site, com a animação.
 */
export function PreviaFaixa({
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
  const raiz = useRef<HTMLDivElement>(null);
  const [dados, setDados] = useState({ mensagem, linkTexto, linkUrl, tema });

  // Os textos moram em outros campos do mesmo formulário.
  useEffect(() => {
    const form = raiz.current?.closest("form");
    if (!form) return;
    const valor = (nome: string) => {
      const el = form.elements.namedItem(nome);
      // As cores são rádios: o formulário devolve a lista, e o valor dela
      // é o do marcado.
      return el instanceof HTMLInputElement || el instanceof RadioNodeList
        ? el.value
        : "";
    };
    const ler = () =>
      setDados({
        mensagem: valor("mensagem"),
        linkTexto: valor("link_texto"),
        linkUrl: valor("link_url"),
        tema: temaDaFaixa(valor("tema")),
      });
    form.addEventListener("input", ler);
    return () => form.removeEventListener("input", ler);
  }, []);

  return (
    <div ref={raiz}>
      <p className="mb-2 text-[0.8125rem] font-medium">Prévia</p>
      <div className="overflow-hidden rounded-xl border border-[var(--borda)]">
        <FaixaVisual {...dados} previa />
        {/* Um pedaço do topo do site embaixo, para a faixa ter contexto. */}
        <div
          aria-hidden
          className="flex h-12 items-center justify-between bg-[var(--color-verde-950)]/90 px-5"
        >
          <span className="h-2.5 w-16 rounded-full bg-white/25" />
          <span className="hidden gap-3 sm:flex">
            <span className="h-2 w-10 rounded-full bg-white/15" />
            <span className="h-2 w-10 rounded-full bg-white/15" />
            <span className="h-2 w-10 rounded-full bg-white/15" />
          </span>
          <span className="h-6 w-20 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}
