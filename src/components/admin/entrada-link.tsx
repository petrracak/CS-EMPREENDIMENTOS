"use client";

import { ArrowUpRight, ChevronDown, Link2 } from "lucide-react";
import { useRef, useState } from "react";

import { ENTRADA, useIdDoCampo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * "Para onde o botão leva": um link escrito à mão ou uma página do site
 * escolhida na lista.
 *
 * O campo continua sendo texto livre, porque o destino pode ser qualquer
 * coisa (uma página, um empreendimento, o Instagram, um formulário de
 * fora). A lista ao lado só poupa a pessoa de saber o endereço de cor.
 */

export type PaginaDoSite = { rotulo: string; caminho: string };

const FIXAS: PaginaDoSite[] = [
  { rotulo: "Página inicial", caminho: "/" },
  { rotulo: "Empreendimentos", caminho: "/empreendimentos" },
  { rotulo: "Cadastro (quero ser atendido)", caminho: "/cadastro" },
  { rotulo: "Blog", caminho: "/blog" },
];

export function EntradaLink({
  name,
  defaultValue,
  id,
  placeholder = "/empreendimentos ou https://…",
  empreendimentos = [],
  extras = [],
}: {
  name: string;
  defaultValue?: string;
  id?: string;
  placeholder?: string;
  /** Cada empreendimento vira uma opção na lista. */
  empreendimentos?: PaginaDoSite[];
  /** Destinos de fora do site, como o WhatsApp da empresa. */
  extras?: PaginaDoSite[];
}) {
  const idDaCaixa = useIdDoCampo(id);
  const [valor, setValor] = useState(defaultValue ?? "");
  const campo = useRef<HTMLInputElement>(null);

  const escolher = (caminho: string) => {
    setValor(caminho);
    // Mantém o "input" do formulário avisado, como se fosse digitado.
    requestAnimationFrame(() =>
      campo.current?.dispatchEvent(new Event("input", { bubbles: true })),
    );
  };

  const todas = [...FIXAS, ...empreendimentos, ...extras];
  const conhecida = todas.find((p) => p.caminho === valor.trim());

  return (
    <div>
      <div className="relative">
        <Link2
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--fg-tenue)]"
          strokeWidth={1.9}
        />
        <input
          ref={campo}
          id={idDaCaixa}
          name={name}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={placeholder}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn(ENTRADA, "pr-11 pl-10")}
        />
        {valor.trim() ? (
          <a
            href={valor.trim()}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir o link numa aba nova, para conferir"
            aria-label="Abrir o link numa aba nova"
            className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--color-verde-800)]"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
          </a>
        ) : null}
      </div>

      <div className="mt-1.5 flex min-h-8 items-center justify-between gap-3 pl-1">
        <p className="min-w-0 truncate text-xs text-[var(--fg-tenue)]">
          {conhecida ? `Leva para: ${conhecida.rotulo}` : null}
        </p>
        {/* Um <select> invisível por cima do botão: no celular abre a
            roda nativa de opções, que é o que a pessoa já sabe usar. */}
        <label className="relative inline-flex min-h-10 shrink-0 sm:min-h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-medium text-[var(--color-verde-800)] transition-colors hover:bg-[var(--bg-fundo)] focus-within:ring-2 focus-within:ring-[var(--color-verde-600)]/40">
          Escolher página
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
          <select
            aria-label="Escolher uma página do site"
            value=""
            onChange={(e) => escolher(e.target.value)}
            // text-base: invisível, mas abaixo de 16 px o iPhone dá zoom ao tocar.
            className="absolute inset-0 cursor-pointer text-base opacity-0"
          >
            <option value="" disabled>
              Escolher uma página
            </option>
            <optgroup label="Páginas do site">
              {FIXAS.map((p) => (
                <option key={p.caminho} value={p.caminho}>
                  {p.rotulo}
                </option>
              ))}
            </optgroup>
            {empreendimentos.length ? (
              <optgroup label="Empreendimentos">
                {empreendimentos.map((p) => (
                  <option key={p.caminho} value={p.caminho}>
                    {p.rotulo}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {extras.length ? (
              <optgroup label="Fora do site">
                {extras.map((p) => (
                  <option key={p.caminho} value={p.caminho}>
                    {p.rotulo}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </label>
      </div>
    </div>
  );
}
