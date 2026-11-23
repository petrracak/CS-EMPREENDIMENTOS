"use client";

import { Check, Plus, Trash2, Upload, X } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import {
  importarUnidades,
  removerUnidade,
  salvarUnidade,
  type EstadoUnidade,
} from "@/app/actions/empreendimentos";
import {
  Area,
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Salvar,
  Selecao,
  TituloBloco,
} from "@/components/admin/ui";
import { cn, formatarValor } from "@/lib/utils";

type Unidade = {
  id: string;
  identificacao: string;
  andar: string | null;
  area_construida: string | null;
  terreno_dimensoes: string | null;
  terreno_area: string | null;
  valor: number | null;
  situacao: string;
  status: string;
  ordem: number;
  tipo_id: string | null;
};

type Tipo = { id: string; nome: string };

const CORES: Record<string, string> = {
  disponivel:
    "border-[var(--color-verde-300)] bg-[var(--color-verde-50)] text-[var(--color-verde-900)]",
  reservada:
    "border-[var(--color-ouro-400)] bg-[var(--color-ouro-100)] text-[var(--color-ouro-900)]",
  vendida: "border-[var(--borda)] bg-[var(--bg-fundo)] text-[var(--fg-tenue)]",
};

const ROTULOS: Record<string, string> = {
  disponivel: "Disponível",
  reservada: "Reservada",
  vendida: "Vendida",
};

/**
 * Mapa de unidades.
 *
 * A lista vira uma grade colorida por situação, em vez de uma tabela
 * comprida: com as 100 casas do House Premium, encontrar a casa 62 em uma
 * tabela é trabalhoso, e na grade ela está à vista. Clicar abre a edição.
 */
export function GerenciadorUnidades({
  empreendimentoId,
  unidades,
  tipos,
}: {
  empreendimentoId: string;
  unidades: Unidade[];
  tipos: Tipo[];
}) {
  const [editando, setEditando] = useState<Unidade | null>(null);
  const [criando, setCriando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [pendente, iniciar] = useTransition();

  const contagem = {
    disponivel: unidades.filter((u) => u.situacao === "disponivel").length,
    reservada: unidades.filter((u) => u.situacao === "reservada").length,
    vendida: unidades.filter((u) => u.situacao === "vendida").length,
  };

  return (
    <div className="space-y-6">
      <Cartao className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <TituloBloco apoio="Clique em uma unidade para editar. A cor mostra a situação.">
              {unidades.length} unidade{unidades.length === 1 ? "" : "s"}
            </TituloBloco>
            <div className="flex flex-wrap gap-3 text-xs">
              {(["disponivel", "reservada", "vendida"] as const).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border",
                      CORES[s],
                    )}
                  />
                  {ROTULOS[s]}
                  <span className="tabular text-[var(--fg-tenue)]">
                    {contagem[s]}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Botao
              type="button"
              tom="neutro"
              onClick={() => setImportando((v) => !v)}
            >
              <Upload className="h-4 w-4" />
              Importar lista
            </Botao>
            <Botao
              type="button"
              onClick={() => {
                setEditando(null);
                setCriando(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova unidade
            </Botao>
          </div>
        </div>

        {/* ---------------------------------------------------- a grade */}
        {unidades.length ? (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {unidades.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setCriando(false);
                  setEditando(u);
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition-transform duration-150 hover:-translate-y-0.5",
                  CORES[u.situacao] ?? CORES.vendida,
                  editando?.id === u.id && "ring-2 ring-[var(--anel)]",
                )}
              >
                <p className="truncate text-sm font-medium">
                  {u.identificacao}
                </p>
                <p className="tabular mt-0.5 truncate text-xs opacity-70">
                  {formatarValor(u.valor) ?? u.area_construida ?? "—"}
                </p>
                {u.status === "rascunho" ? (
                  <p className="mt-1 text-[0.625rem] tracking-wide uppercase opacity-60">
                    rascunho
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-[var(--fg-tenue)]">
            Nenhuma unidade cadastrada ainda.
          </p>
        )}
      </Cartao>

      {/* ------------------------------------------------- importação */}
      {importando ? (
        <ImportarLote
          empreendimentoId={empreendimentoId}
          tipos={tipos}
          aoFechar={() => setImportando(false)}
        />
      ) : null}

      {/* ----------------------------------------------- edição/criação */}
      {criando || editando ? (
        <FormUnidade
          key={editando?.id ?? "nova"}
          empreendimentoId={empreendimentoId}
          unidade={editando}
          tipos={tipos}
          aoFechar={() => {
            setCriando(false);
            setEditando(null);
          }}
          aoRemover={
            editando
              ? () =>
                  iniciar(() => {
                    void removerUnidade(editando.id, empreendimentoId);
                    setEditando(null);
                  })
              : undefined
          }
          removendo={pendente}
        />
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- formulário */

function FormUnidade({
  empreendimentoId,
  unidade,
  tipos,
  aoFechar,
  aoRemover,
  removendo,
}: {
  empreendimentoId: string;
  unidade: Unidade | null;
  tipos: Tipo[];
  aoFechar: () => void;
  aoRemover?: () => void;
  removendo?: boolean;
}) {
  const [estado, acao] = useActionState<EstadoUnidade, FormData>(
    salvarUnidade,
    {},
  );

  return (
    <Cartao className="p-5 sm:p-7">
      <form action={acao}>
        <input type="hidden" name="id" value={unidade?.id ?? ""} />
        <input
          type="hidden"
          name="empreendimento_id"
          value={empreendimentoId}
        />

        <div className="mb-5 flex items-start justify-between gap-4">
          <TituloBloco>
            {unidade ? `Editar ${unidade.identificacao}` : "Nova unidade"}
          </TituloBloco>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--fg-tenue)] hover:bg-[var(--bg-fundo)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo rotulo="Identificação" apoio="Ex.: Casa 06, Apartamento 304">
            <Entrada
              name="identificacao"
              defaultValue={unidade?.identificacao ?? ""}
              required
            />
          </Campo>
          <Campo rotulo="Tipo">
            <Selecao name="tipo_id" defaultValue={unidade?.tipo_id ?? ""}>
              <option value="">Sem tipo</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </Selecao>
          </Campo>
          <Campo rotulo="Andar">
            <Entrada name="andar" defaultValue={unidade?.andar ?? ""} />
          </Campo>

          <Campo rotulo="Área construída">
            <Entrada
              name="area_construida"
              defaultValue={unidade?.area_construida ?? ""}
              placeholder="143 m²"
            />
          </Campo>
          <Campo rotulo="Terreno, dimensões">
            <Entrada
              name="terreno_dimensoes"
              defaultValue={unidade?.terreno_dimensoes ?? ""}
              placeholder="10 x 25 m"
            />
          </Campo>
          <Campo rotulo="Terreno, área">
            <Entrada
              name="terreno_area"
              defaultValue={unidade?.terreno_area ?? ""}
              placeholder="250 m²"
            />
          </Campo>

          <Campo rotulo="Valor" apoio="Em branco, o preço não aparece.">
            <Entrada
              name="valor"
              defaultValue={unidade?.valor ?? ""}
              placeholder="250000"
            />
          </Campo>
          <Campo rotulo="Situação">
            <Selecao
              name="situacao"
              defaultValue={unidade?.situacao ?? "disponivel"}
            >
              <option value="disponivel">Disponível</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
            </Selecao>
          </Campo>
          <Campo rotulo="Publicação">
            <Selecao name="status" defaultValue={unidade?.status ?? "rascunho"}>
              <option value="rascunho">Rascunho (fora do site)</option>
              <option value="publicado">Publicada (no site)</option>
            </Selecao>
          </Campo>
        </div>

        <Campo rotulo="Observação" className="mt-4">
          <Entrada name="observacao" defaultValue="" />
        </Campo>

        <input type="hidden" name="ordem" value={unidade?.ordem ?? 0} />

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--borda)] pt-5">
          <Salvar />
          {aoRemover ? (
            <Botao
              type="button"
              tom="perigo"
              onClick={aoRemover}
              disabled={removendo}
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Botao>
          ) : null}
          {estado.ok ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-verde-600)]">
              <Check className="h-4 w-4" />
              Salvo
            </span>
          ) : null}
          {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
        </div>
      </form>
    </Cartao>
  );
}

/* --------------------------------------------------------- importação */

function ImportarLote({
  empreendimentoId,
  tipos,
  aoFechar,
}: {
  empreendimentoId: string;
  tipos: Tipo[];
  aoFechar: () => void;
}) {
  const [estado, acao] = useActionState<EstadoUnidade, FormData>(
    importarUnidades,
    {},
  );

  return (
    <Cartao className="p-5 sm:p-7">
      <form action={acao}>
        <input
          type="hidden"
          name="empreendimento_id"
          value={empreendimentoId}
        />

        <div className="mb-5 flex items-start justify-between gap-4">
          <TituloBloco apoio="Cole a lista da planilha, uma unidade por linha. Separe as colunas com ponto e vírgula.">
            Importar unidades
          </TituloBloco>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--fg-tenue)] hover:bg-[var(--bg-fundo)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 rounded-xl bg-[var(--bg-fundo)] px-4 py-3 font-mono text-xs leading-relaxed text-[var(--fg-suave)]">
          identificação; área construída; terreno; valor; situação
          <br />
          Casa 06; 133,81 m²; 10 x 25 m; 250000; disponivel
          <br />
          Casa 07; 143 m²; 10 x 25 m; ; vendida
        </p>

        <Campo rotulo="Tipo das unidades">
          <Selecao name="tipo_id" defaultValue={tipos[0]?.id ?? ""}>
            <option value="">Sem tipo</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Selecao>
        </Campo>

        <Campo rotulo="Lista" className="mt-4">
          <Area name="linhas" rows={10} className="font-mono text-xs" />
        </Campo>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--borda)] pt-5">
          <Salvar>Importar</Salvar>
          <span className="text-xs text-[var(--fg-tenue)]">
            As unidades entram como rascunho, para você conferir antes de
            publicar.
          </span>
          {estado.ok ? (
            <Aviso tipo="ok">Unidades importadas.</Aviso>
          ) : null}
          {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
        </div>
      </form>
    </Cartao>
  );
}
