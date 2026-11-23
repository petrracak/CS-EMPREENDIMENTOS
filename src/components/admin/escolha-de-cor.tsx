"use client";

import { Check } from "lucide-react";

import { useIdDoCampo } from "@/components/admin/ui";
import { TEMAS_FAIXA, type TemaFaixa } from "@/lib/temas-faixa";

/**
 * As cores da faixa, como amostras. São rádios nativos: entram no envio
 * do formulário sem JavaScript e avisam a prévia pelo evento "input".
 */
export function EscolhaDeCor({
  nome,
  valor,
  id,
}: {
  nome: string;
  valor: TemaFaixa;
  id?: string;
}) {
  return (
    <div
      id={useIdDoCampo(id)}
      role="radiogroup"
      className="grid grid-cols-4 gap-2 sm:grid-cols-8"
    >
      {TEMAS_FAIXA.map((tema) => (
        <label key={tema.id} className="group min-w-0 cursor-pointer">
          <input
            type="radio"
            name={nome}
            value={tema.id}
            defaultChecked={tema.id === valor}
            className="peer sr-only"
          />
          <span
            data-tema={tema.id}
            className="faixa-amostra relative grid h-11 place-items-center rounded-xl shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] ring-offset-2 ring-offset-[var(--bg-elevado)] transition-[box-shadow,transform] duration-200 group-hover:-translate-y-px peer-checked:ring-2 peer-checked:ring-[var(--color-verde-800)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-verde-600)]/50 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
          >
            <Check
              aria-hidden
              className="h-4 w-4 text-[var(--faixa-texto)] drop-shadow transition-opacity"
              strokeWidth={2.6}
            />
          </span>
          <span className="mt-1.5 block truncate text-center text-xs text-[var(--fg-tenue)] peer-checked:font-medium peer-checked:text-[var(--fg)]">
            {tema.rotulo}
          </span>
        </label>
      ))}
    </div>
  );
}
