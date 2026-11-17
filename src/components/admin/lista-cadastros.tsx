"use client";

import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";

import { Whatsapp } from "@/components/icones-sociais";
import { anotarLead, mudarSituacaoLead } from "@/app/actions/cadastros";
import { Area, Botao, Cartao, Etiqueta, Selecao } from "@/components/admin/ui";
import { formatarData } from "@/lib/utils";

type Lead = {
  id: string;
  nome: string;
  contato: string;
  profissao: string | null;
  renda_mensal: string | null;
  valor_entrada: string | null;
  mensagem: string | null;
  origem: string | null;
  situacao: string;
  anotacoes: string | null;
  created_at: string;
  empreendimento: { nome: string } | null;
  unidade: { identificacao: string } | null;
};

const SITUACOES = [
  { valor: "novo", rotulo: "Novo" },
  { valor: "em_atendimento", rotulo: "Em atendimento" },
  { valor: "convertido", rotulo: "Convertido" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

/**
 * Lista de interessados.
 *
 * Cada cadastro abre no lugar, sem trocar de página: o perfil que a ata
 * pede (profissão, renda, entrada) é justamente o que o consultor lê
 * antes de ligar, então ele precisa estar a um clique.
 */
export function ListaCadastros({ leads }: { leads: Lead[] }) {
  const [filtro, setFiltro] = useState("todos");
  const visiveis =
    filtro === "todos" ? leads : leads.filter((l) => l.situacao === filtro);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {[{ valor: "todos", rotulo: "Todos" }, ...SITUACOES].map((o) => {
          const total =
            o.valor === "todos"
              ? leads.length
              : leads.filter((l) => l.situacao === o.valor).length;
          return (
            <button
              key={o.valor}
              type="button"
              onClick={() => setFiltro(o.valor)}
              className={
                "rounded-lg px-3.5 py-2 text-sm transition-colors " +
                (filtro === o.valor
                  ? "bg-[var(--color-verde-800)] text-white"
                  : "border border-[var(--borda)] text-[var(--fg-suave)] hover:border-[var(--borda-forte)]")
              }
            >
              {o.rotulo}
              <span className="tabular ml-1.5 opacity-60">{total}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visiveis.length ? (
          visiveis.map((lead) => <Linha key={lead.id} lead={lead} />)
        ) : (
          <p className="text-sm text-[var(--fg-tenue)]">
            Nenhum cadastro nesta situação.
          </p>
        )}
      </div>
    </>
  );
}

function Linha({ lead }: { lead: Lead }) {
  const [aberto, setAberto] = useState(false);
  const [anotacoes, setAnotacoes] = useState(lead.anotacoes ?? "");
  const [pendente, iniciar] = useTransition();

  // Só os dígitos: é o formato que o link do WhatsApp aceita.
  const zap = lead.contato.replace(/\D/g, "");

  return (
    <Cartao>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{lead.nome}</p>
          <p className="truncate text-sm text-[var(--fg-tenue)]">
            {lead.contato}
            {lead.empreendimento ? ` · ${lead.empreendimento.nome}` : ""}
            {lead.unidade ? ` · ${lead.unidade.identificacao}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lead.situacao === "novo" ? <Etiqueta tom="verde">Novo</Etiqueta> : null}
          <span className="text-xs text-[var(--fg-tenue)]">
            {formatarData(lead.created_at)}
          </span>
          <ChevronDown
            className={
              "h-4 w-4 text-[var(--fg-tenue)] transition-transform " +
              (aberto ? "rotate-180" : "")
            }
          />
        </div>
      </button>

      {aberto ? (
        <div className="border-t border-[var(--borda)] p-5">
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ["Profissão", lead.profissao],
              ["Renda mensal", lead.renda_mensal],
              ["Entrada disponível", lead.valor_entrada],
              ["Veio da página", lead.origem],
            ]
              .filter(([, v]) => v)
              .map(([rotulo, valor]) => (
                <div key={rotulo}>
                  <dt className="text-xs tracking-wide text-[var(--fg-tenue)] uppercase">
                    {rotulo}
                  </dt>
                  <dd className="mt-0.5 text-sm">{valor}</dd>
                </div>
              ))}
          </dl>

          {lead.mensagem ? (
            <p className="mt-4 rounded-lg bg-[var(--bg-fundo)] p-4 text-sm leading-relaxed">
              {lead.mensagem}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-[200px_1fr]">
            <div>
              <label className="text-xs tracking-wide text-[var(--fg-tenue)] uppercase">
                Situação
              </label>
              <Selecao
                className="mt-1.5"
                defaultValue={lead.situacao}
                disabled={pendente}
                onChange={(e) =>
                  iniciar(() => {
                    void mudarSituacaoLead(lead.id, e.target.value);
                  })
                }
              >
                {SITUACOES.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.rotulo}
                  </option>
                ))}
              </Selecao>
            </div>

            <div>
              <label className="text-xs tracking-wide text-[var(--fg-tenue)] uppercase">
                Anotações
              </label>
              <Area
                className="mt-1.5"
                rows={2}
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                onBlur={() =>
                  iniciar(() => {
                    void anotarLead(lead.id, anotacoes);
                  })
                }
              />
            </div>
          </div>

          {zap.length >= 10 ? (
            <a
              href={`https://wa.me/55${zap}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--acento)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--acento-hover)]"
            >
              <Whatsapp className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          ) : (
            <Botao type="button" tom="neutro" disabled className="mt-4">
              Contato sem número de WhatsApp
            </Botao>
          )}
        </div>
      ) : null}
    </Cartao>
  );
}
