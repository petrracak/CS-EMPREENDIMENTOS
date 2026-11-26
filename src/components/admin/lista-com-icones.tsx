"use client";

import { useState } from "react";

import { Area } from "@/components/admin/ui";
import { iconeDoTexto } from "@/components/site/icone-do-item";

/**
 * Caixa de "um por linha" com a prévia dos ícones logo abaixo: cada
 * linha aparece com o ícone que o site vai usar, escolhido pelas
 * palavras do texto. Quem quer outro ícone troca a palavra ("vaga" vira
 * carro, "portaria" vira escudo).
 */
export function ListaComIcones({
  nome,
  valor,
  linhas = 7,
}: {
  nome: string;
  valor: string;
  linhas?: number;
}) {
  const [texto, setTexto] = useState(valor);
  const itens = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div>
      <Area
        name={nome}
        rows={linhas}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {itens.length ? (
        <ul aria-label="Como fica no site" className="mt-3 space-y-1.5">
          {itens.map((item, i) => {
            const Icone = iconeDoTexto(item);
            return (
              <li
                key={i}
                className="flex items-center gap-2.5 text-[0.8125rem] text-[var(--fg-suave)]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#ebfff6] text-[#004527]">
                  <Icone className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <span className="truncate">{item}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
