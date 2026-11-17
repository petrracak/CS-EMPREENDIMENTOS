"use client";

import { Plus, X } from "lucide-react";
import { useActionState, useTransition } from "react";

import { apagarTipo, criarTipo, type EstadoTipo } from "@/app/actions/cadastros";
import {
  Aviso,
  Cartao,
  Entrada,
  Salvar,
  TituloBloco,
} from "@/components/admin/ui";

export function GerenciadorTipos({
  grupo,
  titulo,
  apoio,
  tipos,
}: {
  grupo: "empreendimento" | "unidade";
  titulo: string;
  apoio: string;
  tipos: { id: string; nome: string }[];
}) {
  const [estado, acao] = useActionState<EstadoTipo, FormData>(criarTipo, {});
  const [pendente, iniciar] = useTransition();

  return (
    <Cartao className="p-6">
      <TituloBloco apoio={apoio}>{titulo}</TituloBloco>

      <ul className="flex flex-wrap gap-2">
        {tipos.map((tipo) => (
          <li
            key={tipo.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--borda)] py-1.5 pr-1.5 pl-3.5 text-sm"
          >
            {tipo.nome}
            <button
              type="button"
              aria-label={`Remover ${tipo.nome}`}
              disabled={pendente}
              onClick={() =>
                iniciar(() => {
                  void apagarTipo(grupo, tipo.id);
                })
              }
              className="rounded-full p-1 text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--color-acento-forte)]"
            >
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
        {!tipos.length ? (
          <li className="text-sm text-[var(--fg-tenue)]">Nenhum tipo ainda.</li>
        ) : null}
      </ul>

      <form action={acao} className="mt-5 flex flex-wrap gap-2">
        <input type="hidden" name="grupo" value={grupo} />
        <Entrada
          name="nome"
          placeholder="Nome do novo tipo"
          required
          className="min-w-0 flex-1"
        />
        <Salvar>
          <Plus className="h-4 w-4" />
          Adicionar
        </Salvar>
      </form>

      {estado.erro ? (
        <div className="mt-3">
          <Aviso tipo="erro">{estado.erro}</Aviso>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-[var(--fg-tenue)]">
        Remover um tipo não apaga nada: os empreendimentos que usavam ele
        apenas ficam sem tipo.
      </p>
    </Cartao>
  );
}
