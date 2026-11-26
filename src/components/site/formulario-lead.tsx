"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { enviarCadastro, type EstadoDoFormulario } from "@/app/actions/leads";
import { registrarConversao } from "@/lib/conversao";
import { cn } from "@/lib/utils";

type Opcao = { id: string; nome: string };

const INICIAL: EstadoDoFormulario = { ok: false };

/**
 * Quem já se cadastrou não vê mais o pop-up de saída naquele navegador.
 * Vale para qualquer formulário do site.
 */
export const MARCA_CADASTRO = "cs:cadastrado";

/**
 * Depois de um cadastro: marca o navegador (o pop-up de saída não volta)
 * e conta a conversão nos pixels ligados no painel.
 */
function useLembrarCadastro(ok: boolean) {
  useEffect(() => {
    if (!ok) return;
    try {
      localStorage.setItem(MARCA_CADASTRO, "1");
    } catch {
      // Sem armazenamento, o pop-up só pode aparecer de novo. Tudo bem.
    }
    registrarConversao(window.location.pathname);
  }, [ok]);
}

/* ------------------------------------------------------------ campos */

function Campo({
  nome,
  rotulo,
  apoio,
  tipo = "text",
  obrigatorio = false,
  padrao,
}: {
  nome: string;
  rotulo: string;
  apoio?: string;
  tipo?: string;
  obrigatorio?: boolean;
  padrao?: string;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-sm font-medium text-[var(--fg)]">
        {rotulo}
        {obrigatorio ? (
          <span className="ml-1 text-[var(--color-acento-forte)]">*</span>
        ) : null}
      </span>
      {apoio ? (
        <span className="mt-1 block text-xs leading-relaxed text-[var(--fg-tenue)]">
          {apoio}
        </span>
      ) : null}
      {/* Empurra a caixa para baixo: lado a lado, as caixas ficam          alinhadas mesmo com textos de apoio de tamanhos diferentes. */}
      <span aria-hidden className="flex-1" />
      <input
        type={tipo}
        name={nome}
        required={obrigatorio}
        defaultValue={padrao}
        className={cn(
          "mt-2 w-full rounded-xl border border-[var(--borda)] bg-[var(--bg)]",
          "px-4 py-3 text-base sm:text-sm transition-colors duration-400",
          "placeholder:text-[var(--fg-tenue)]",
          "focus:border-[var(--acento)] focus:outline-none",
        )}
      />
    </label>
  );
}

function Enviar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      // O botão principal do site (.botao-novo), com a seta do Figma.
      className="botao-novo botao-novo-primario disabled:pointer-events-none disabled:opacity-60"
    >
      <span>{pending ? "Enviando…" : rotulo}</span>
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/site/seta.svg" alt="" width={24} height={24} className="botao-novo-seta" />
      )}
    </button>
  );
}

function Sucesso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div
      role="status"
      className="mt-8 flex gap-4 rounded-2xl border border-[var(--color-verde-200)] bg-[var(--color-verde-50)] p-6"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-verde-600)]" />
      <div>
        <p className="font-medium text-[var(--color-verde-900)]">{titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--fg-suave)]">
          {texto}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------ formulário completo */

export function FormularioCompleto({
  empreendimentos,
  empreendimentoPadrao,
  unidadePadrao,
  consentimento,
  botao,
  sucessoTitulo,
  sucessoTexto,
}: {
  empreendimentos: Opcao[];
  empreendimentoPadrao?: string;
  unidadePadrao?: string;
  consentimento: string;
  botao: string;
  sucessoTitulo: string;
  sucessoTexto: string;
}) {
  const [estado, acao] = useActionState(enviarCadastro, INICIAL);
  useLembrarCadastro(estado.ok);

  if (estado.ok) {
    return <Sucesso titulo={sucessoTitulo} texto={sucessoTexto} />;
  }

  return (
    <form action={acao} className="mt-10 space-y-6">
      <input type="hidden" name="origem" value="/cadastro" />
      <input type="hidden" name="unidade_id" value={unidadePadrao ?? ""} />
      <Armadilha />

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo
          nome="nome"
          rotulo="Nome completo"
          apoio="Como você se chama?"
          obrigatorio
        />
        <Campo
          nome="contato"
          rotulo="Contato"
          apoio="WhatsApp ou telefone, com DDD"
          obrigatorio
        />
        <Campo
          nome="profissao"
          rotulo="Profissão"
          apoio="Qual é a sua profissão?"
        />
        <Campo
          nome="renda_mensal"
          rotulo="Renda mensal"
          apoio="Essa informação ajuda a indicar as melhores condições. Ela fica só entre você e a CS."
        />
        <Campo
          nome="valor_entrada"
          rotulo="Valor disponível para entrada"
          apoio="Quanto você tem hoje para a entrada? Se ainda não sabe, pode deixar em branco."
        />

        <label className="flex flex-col">
          <span className="text-sm font-medium text-[var(--fg)]">
            Empreendimento de interesse
          </span>
          <span className="mt-1 block text-xs text-[var(--fg-tenue)]">
            Escolha um empreendimento
          </span>
          <span aria-hidden className="flex-1" />
          <select
            name="empreendimento_id"
            defaultValue={empreendimentoPadrao ?? ""}
            className="mt-2 w-full rounded-xl border border-[var(--borda)] bg-[var(--bg)] px-4 py-3 text-base sm:text-sm focus:border-[var(--acento)] focus:outline-none"
          >
            <option value="">Ainda não sei</option>
            {empreendimentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Consentimento texto={consentimento} />
      {estado.erro ? <Erro texto={estado.erro} /> : null}
      <Enviar rotulo={botao} />
    </form>
  );
}

/* --------------------------------------------------- versão curta */

export function FormularioCurto({
  empreendimentos,
  empreendimentoPadrao,
  origem,
}: {
  empreendimentos: Opcao[];
  empreendimentoPadrao?: string;
  origem: string;
}) {
  const [estado, acao] = useActionState(enviarCadastro, INICIAL);
  useLembrarCadastro(estado.ok);

  if (estado.ok) {
    return (
      <Sucesso
        titulo="Recebemos o seu cadastro."
        texto="Em breve, um consultor da CS vai falar com você pelo WhatsApp."
      />
    );
  }

  return (
    <form action={acao} className="mt-8 space-y-6">
      <input type="hidden" name="origem" value={origem} />
      <input
        type="hidden"
        name="empreendimento_id"
        value={empreendimentoPadrao ?? ""}
      />
      <Armadilha />

      <div className="grid gap-6 sm:grid-cols-3">
        <Campo nome="nome" rotulo="Nome completo" obrigatorio />
        <Campo
          nome="contato"
          rotulo="Contato"
          apoio="WhatsApp com DDD"
          obrigatorio
        />
        <Campo nome="profissao" rotulo="Profissão" />
      </div>

      {/* Quem vem da página do empreendimento já demonstrou o interesse;
          o seletor só aparece se não houver um escolhido. */}
      {!empreendimentoPadrao && empreendimentos.length ? (
        <select
          name="empreendimento_id"
          defaultValue=""
          className="w-full rounded-xl border border-[var(--borda)] bg-[var(--bg)] px-4 py-3 text-base sm:text-sm focus:border-[var(--acento)] focus:outline-none"
        >
          <option value="">Ainda não sei</option>
          {empreendimentos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      ) : null}

      <Consentimento texto="Concordo em receber contato da CS Empreendimentos pelos dados informados. Meus dados serão usados apenas para o atendimento comercial." />
      {estado.erro ? <Erro texto={estado.erro} /> : null}
      <Enviar rotulo="Quero ser atendido" />
    </form>
  );
}

/* ------------------------------------------- versão do pop-up de saída */

/**
 * O mínimo para a CS ligar de volta: nome, WhatsApp e, se a pessoa
 * quiser, o empreendimento. Quem está saindo não preenche renda.
 */
export function FormularioSaida({
  empreendimentos,
  origem,
  botao,
}: {
  empreendimentos: Opcao[];
  origem: string;
  botao: string;
}) {
  const [estado, acao] = useActionState(enviarCadastro, INICIAL);
  useLembrarCadastro(estado.ok);

  if (estado.ok) {
    return (
      <Sucesso
        titulo="Recebemos o seu cadastro."
        texto="Em breve, um consultor da CS vai falar com você pelo WhatsApp."
      />
    );
  }

  return (
    <form action={acao} className="mt-6 space-y-4">
      <input type="hidden" name="origem" value={origem} />
      <Armadilha />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nome="nome" rotulo="Nome" obrigatorio />
        <Campo
          nome="contato"
          rotulo="WhatsApp"
          tipo="tel"
          obrigatorio
        />
      </div>

      {empreendimentos.length ? (
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[var(--fg)]">
            Empreendimento de interesse
          </span>
          <span aria-hidden className="flex-1" />
          <select
            name="empreendimento_id"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-[var(--borda)] bg-[var(--bg)] px-4 py-3 text-base sm:text-sm focus:border-[var(--acento)] focus:outline-none"
          >
            <option value="">Ainda não sei</option>
            {empreendimentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <Consentimento texto="Concordo em receber contato da CS Empreendimentos pelos dados informados. Meus dados serão usados apenas para o atendimento comercial." />
      {estado.erro ? <Erro texto={estado.erro} /> : null}
      <Enviar rotulo={botao} />
    </form>
  );
}

/* ------------------------------------------------------- auxiliares */

function Consentimento({ texto }: { texto: string }) {
  return (
    <label className="flex cursor-pointer gap-3">
      <input
        type="checkbox"
        name="consentimento"
        required
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--acento)]"
      />
      <span className="text-xs leading-relaxed text-[var(--fg-suave)]">
        {texto}{" "}
        <a
          href="/politica-de-privacidade"
          target="_blank"
          className="text-[#00552f] underline underline-offset-2"
        >
          Ver a Política de privacidade
        </a>
        .
      </span>
    </label>
  );
}

function Erro({ texto }: { texto: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-[var(--color-acento-forte)]/40 bg-[var(--color-acento)]/10 px-4 py-3 text-sm text-[var(--fg)]"
    >
      {texto}
    </p>
  );
}

/** Campo invisível para gente, visível para robô de formulário. */
function Armadilha() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Não preencha
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
