"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";

import { salvarConteudo, type EstadoSalvo } from "@/app/actions/conteudo";
import { Dica } from "@/components/admin/dica";
import { Aviso, Cartao, Salvar } from "@/components/admin/ui";

/**
 * Um bloco editável do site: um formulário, um botão, um aviso.
 *
 * Cada bloco salva sozinho. A Carolina pode mexer só na faixa de campanha
 * e salvar, sem passar por cima do resto da página.
 */
export function BlocoConteudo({
  chave,
  titulo,
  apoio,
  id,
  children,
}: {
  chave: string;
  titulo: string;
  apoio?: string;
  /** Âncora para o índice da página. */
  id?: string;
  children: React.ReactNode;
}) {
  const [estado, acao] = useActionState<EstadoSalvo, FormData>(
    salvarConteudo,
    {},
  );

  return (
    <Cartao id={id} className="scroll-mt-24 overflow-hidden">
      <form action={acao}>
        <input type="hidden" name="__chave" value={chave} />

        <div className="border-b border-[var(--borda)] px-5 py-5 sm:px-7">
          <h2 className="font-display text-lg leading-tight font-medium tracking-[-0.01em]">
            {titulo}
          </h2>
          {apoio ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
              {apoio}
            </p>
          ) : null}
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-7">{children}</div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--borda)] bg-[var(--bg)] px-5 py-3.5 sm:px-7">
          <Salvar />
          {estado.ok ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-verde-600)]">
              <Check className="h-4 w-4" />
              Salvo e publicado no site
            </span>
          ) : null}
          {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
        </div>
      </form>
    </Cartao>
  );
}

/** Divisão dentro de um bloco longo: um título pequeno e uma linha. */
export function Trecho({
  titulo,
  apoio,
  children,
}: {
  titulo: string;
  apoio?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--borda)] pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center gap-1.5">
        <h3 className="text-[0.6875rem] font-semibold tracking-[0.12em] text-[var(--color-verde-800)] uppercase">
          {titulo}
        </h3>
        {apoio ? <Dica>{apoio}</Dica> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Liga/desliga que sobrevive ao envio mesmo desligado. */
export function Interruptor({
  nome,
  rotulo,
  apoio,
  padrao,
}: {
  nome: string;
  rotulo: string;
  apoio?: string;
  padrao: boolean;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--borda)] bg-[var(--bg)] px-4 py-3">
      {/* Caixa desmarcada não entra no FormData; este campo garante o
          "false" chegar ao servidor. O servidor fica com o último valor. */}
      <input type="hidden" name={nome} value="false" />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{rotulo}</span>
        {apoio ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-[var(--fg-tenue)]">
            {apoio}
          </span>
        ) : null}
      </span>
      <input
        type="checkbox"
        name={nome}
        value="true"
        defaultChecked={padrao}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-[var(--borda-forte)] transition-colors duration-300 after:absolute after:top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-300 peer-checked:bg-[var(--color-verde-700)] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-verde-600)]/40"
      />
    </label>
  );
}
