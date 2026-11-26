import type { ReactNode } from "react";

import { Olho, Secao } from "@/components/site/ui";

/**
 * O desenho das páginas legais (termos e privacidade): título, data da
 * versão e as seções numeradas, com um índice no computador. O texto em
 * si fica em cada página.
 */
export type SecaoLegal = { titulo: string; conteudo: ReactNode };

export function PaginaLegal({
  olho,
  titulo,
  atualizado,
  introducao,
  secoes,
}: {
  olho: string;
  titulo: string;
  atualizado: string;
  introducao: ReactNode;
  secoes: SecaoLegal[];
}) {
  return (
    <Secao className="pt-14 md:pt-20">
      <div className="max-w-3xl">
        <Olho>{olho}</Olho>
        <h1 className="mt-5 text-[2.25rem] leading-[1.1] font-light tracking-[-0.05em] text-[#28513f] sm:text-[3rem]">
          {titulo}
        </h1>
        <p className="mt-4 text-sm text-[var(--fg-tenue)]">
          Versão em vigor desde {atualizado}.
        </p>
        <div className="texto-blog mt-8">{introducao}</div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <nav aria-label="Seções" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2.5 text-sm text-[var(--fg-suave)]">
            {secoes.map((s, i) => (
              <li key={s.titulo}>
                <a
                  href={`#secao-${i + 1}`}
                  className="transition-colors hover:text-[#00552f]"
                >
                  {i + 1}. {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-3xl space-y-12">
          {secoes.map((s, i) => (
            <section
              key={s.titulo}
              id={`secao-${i + 1}`}
              className="scroll-mt-28"
            >
              <h2 className="text-[1.5rem] leading-tight font-light tracking-[-0.05em] text-[#28513f]">
                {i + 1}. {s.titulo}
              </h2>
              <div className="texto-blog mt-4">{s.conteudo}</div>
            </section>
          ))}
        </div>
      </div>
    </Secao>
  );
}
