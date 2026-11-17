"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";

import { salvarConteudo, type EstadoSalvo } from "@/app/actions/conteudo";
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
  children,
}: {
  chave: string;
  titulo: string;
  apoio?: string;
  children: React.ReactNode;
}) {
  const [estado, acao] = useActionState<EstadoSalvo, FormData>(
    salvarConteudo,
    {},
  );

  return (
    <Cartao className="p-6">
      <form action={acao}>
        <input type="hidden" name="__chave" value={chave} />

        <div className="mb-5">
          <h2 className="font-display text-lg font-medium">{titulo}</h2>
          {apoio ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--fg-tenue)]">
              {apoio}
            </p>
          ) : null}
        </div>

        <div className="space-y-5">{children}</div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--borda)] pt-5">
          <Salvar />
          {estado.ok ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-verde-600)]">
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

/** Caixa de ligar/desligar que sobrevive ao envio mesmo desmarcada. */
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--borda)] bg-[var(--bg-fundo)] p-4">
      {/* Caixa desmarcada não entra no FormData; este campo garante o
          "false" chegar ao servidor. */}
      <input type="hidden" name={nome} value="false" />
      <input
        type="checkbox"
        name={nome}
        value="true"
        defaultChecked={padrao}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--acento)]"
      />
      <span>
        <span className="block text-sm font-medium">{rotulo}</span>
        {apoio ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-[var(--fg-tenue)]">
            {apoio}
          </span>
        ) : null}
      </span>
    </label>
  );
}
