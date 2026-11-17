"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Faixa fina no topo, para campanhas pontuais (Black Friday e afins).
 *
 * A CS liga e desliga pelo painel. Quem fecha a faixa não a vê de novo
 * naquele navegador, mas trocar o texto no painel faz a faixa voltar:
 * a marca guardada é o próprio texto, então campanha nova é faixa nova.
 */
export function FaixaCampanha({
  textoForte,
  texto,
  linkTexto,
  linkUrl,
}: {
  textoForte: string;
  texto: string;
  linkTexto: string;
  linkUrl: string;
}) {
  const assinatura = `${textoForte}${texto}`;
  const [aberta, setAberta] = useState(true);

  useEffect(() => {
    try {
      setAberta(localStorage.getItem("cs:faixa") !== assinatura);
    } catch {
      // Navegador anônimo ou armazenamento bloqueado: mostra a faixa.
      setAberta(true);
    }
  }, [assinatura]);

  if (!aberta) return null;

  function fechar() {
    setAberta(false);
    try {
      localStorage.setItem("cs:faixa", assinatura);
    } catch {
      // Não poder lembrar não é motivo para falhar.
    }
  }

  return (
    <div className="relative z-50 bg-[var(--color-verde-900)] text-[var(--fg-sobre-tinta)]">
      {/* No celular o texto e o link empilham. Em linha, cada um ficava
          com metade de 375 px e a frase virava seis linhas. */}
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-center text-[0.8125rem] sm:flex-row sm:flex-wrap">
        <p className="leading-snug">
          <strong className="font-semibold text-[var(--color-ouro-300)]">
            {textoForte}
          </strong>{" "}
          {texto}
        </p>
        {linkTexto ? (
          <Link
            href={linkUrl || "/cadastro"}
            className="group inline-flex shrink-0 items-center gap-1 font-medium text-white underline-offset-4 hover:underline"
          >
            {linkTexto}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>

      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar aviso"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
