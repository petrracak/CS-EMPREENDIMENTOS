"use client";

import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Children,
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

import { Dica } from "@/components/admin/dica";
import {
  BASE_BOTAO,
  TOM_BOTAO,
  type TomBotao,
} from "@/components/admin/estilos";
import { cn } from "@/lib/utils";

/**
 * Peças do painel.
 *
 * O painel não repete o site: lá é vitrine, aqui é bancada. Fundo creme,
 * folhas brancas com sombra baixa, verde só onde há ação, dourado só para
 * marcar onde a pessoa está. Nada de animação de entrada — quem trabalha
 * aqui repete a mesma tarefa dezenas de vezes e não quer esperar.
 *
 * Duas regras valem para tudo:
 *  - campo com 16 px no celular. Abaixo disso o Safari do iPhone dá zoom
 *    ao tocar, e a Carolina edita o site pelo telefone;
 *  - alvo de toque com pelo menos 44 px de altura.
 */

/* ---------------------------------------------------------- estrutura */

/** Título da tela, com volta opcional e ações à direita. */
export function Cabecalho({
  titulo,
  descricao,
  acoes,
  voltar,
  selo,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  voltar?: { href: string; rotulo: string };
  selo?: ReactNode;
}) {
  return (
    <header className="min-w-0">
      {voltar ? (
        <Link
          href={voltar.href}
          className="group -ml-1 mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-full pr-3 pl-1 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--fg)]"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] transition-transform duration-300 group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          {voltar.rotulo}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-72">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-display text-[1.75rem] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-[var(--color-verde-950)] sm:text-[2rem]">
              {titulo}
            </h1>
            {selo}
          </div>
          {descricao ? (
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-pretty text-[var(--fg-tenue)]">
              {descricao}
            </p>
          ) : null}
        </div>
        {acoes ? (
          <div className="flex flex-wrap items-center gap-2">{acoes}</div>
        ) : null}
      </div>
    </header>
  );
}

export function Cartao({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[1.25rem] border border-[var(--borda)] bg-[var(--bg-elevado)] shadow-[var(--sombra-painel)]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Título de um bloco dentro de uma folha. A explicação, quando existe,
 * fica no ícone de ajuda ao lado — o texto aberto empurrava os campos e
 * desalinhava as colunas.
 */
export function TituloBloco({
  children,
  apoio,
  numero,
  acao,
}: {
  children: ReactNode;
  apoio?: string;
  /** Marca a ordem dos blocos numa tela longa: 01, 02… */
  numero?: number;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {numero !== undefined ? (
          <span className="tabular grid h-7 min-w-7 place-items-center rounded-full bg-[var(--color-verde-950)] px-2 text-[0.6875rem] font-semibold text-[var(--color-ouro-300)]">
            {String(numero).padStart(2, "0")}
          </span>
        ) : null}
        <h2 className="font-display text-lg leading-tight font-medium tracking-[-0.01em]">
          {children}
        </h2>
        {apoio ? <Dica>{apoio}</Dica> : null}
      </div>
      {acao}
    </div>
  );
}

/* -------------------------------------------------------------- campos */

/**
 * Rótulo, ajuda e campo.
 *
 * O rótulo aponta para o campo por id (e não envolvendo tudo num <label>)
 * porque o ícone de ajuda é um botão: dentro de um <label>, o primeiro
 * elemento rotulável seria o botão, e o clique no rótulo iria para ele.
 */
export function Campo({
  rotulo,
  apoio,
  className,
  children,
}: {
  rotulo: string;
  apoio?: string;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  // Com um campo só dentro, o rótulo aponta para ele. Com vários, nenhum
  // recebe o id, senão haveria dois elementos com o mesmo.
  const unico = Children.count(children) === 1;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex min-h-6 items-center gap-1.5">
        <label
          htmlFor={unico ? id : undefined}
          className="text-[0.8125rem] font-medium text-[var(--fg)]"
        >
          {rotulo}
        </label>
        {apoio ? <Dica>{apoio}</Dica> : null}
      </div>
      <div className="mt-1.5">
        <IdDoCampo value={unico ? id : undefined}>{children}</IdDoCampo>
      </div>
    </div>
  );
}

/**
 * O id que o Campo dá à caixa de dentro, para o rótulo apontar para ela.
 *
 * Vai por contexto, e não por cloneElement: quando a página é grande, o
 * servidor manda alguns filhos depois, ainda "a resolver", e o clone não
 * os enxerga — o id saía só no navegador e a hidratação reclamava.
 */
const IdDoCampo = createContext<string | undefined>(undefined);

/** O id da caixa: o que veio por prop ou, na falta, o do Campo em volta. */
export function useIdDoCampo(id?: string) {
  const doCampo = useContext(IdDoCampo);
  return id ?? doCampo;
}

export const ENTRADA =
  "block min-h-11 w-full min-w-0 rounded-xl border border-[var(--borda)] bg-[var(--bg-elevado)] px-3.5 py-2.5 " +
  "text-base text-[var(--fg)] shadow-[0_1px_0_rgb(1_38_22/0.03)] sm:text-[0.9375rem] " +
  "transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--fg-tenue)]/70 " +
  "hover:border-[var(--borda-forte)] " +
  "focus:border-[var(--color-verde-700)] focus:shadow-[0_0_0_4px_rgb(0_69_39/0.1)] focus:outline-none " +
  "disabled:opacity-60";

export function Entrada({ className, id, ...props }: ComponentProps<"input">) {
  return (
    <input
      id={useIdDoCampo(id)}
      className={cn(ENTRADA, className)}
      {...props}
    />
  );
}

export function Area({ className, id, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      id={useIdDoCampo(id)}
      rows={4}
      className={cn(ENTRADA, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Selecao({ className, id, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        id={useIdDoCampo(id)}
        className={cn(ENTRADA, "cursor-pointer appearance-none pr-10", className)}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[var(--fg-tenue)]"
      />
    </div>
  );
}

/* -------------------------------------------------------------- botões */

type Tom = TomBotao;
const TOM = TOM_BOTAO;
const BASE = BASE_BOTAO;

export function Botao({
  tom = "principal",
  className,
  ...props
}: ComponentProps<"button"> & { tom?: Tom }) {
  return <button className={cn(BASE, TOM[tom], className)} {...props} />;
}

/** Botão de envio que mostra sozinho que está salvando. */
export function Salvar({
  children = "Salvar",
  tom = "principal",
  className,
}: {
  children?: ReactNode;
  tom?: Tom;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(BASE, TOM[tom], className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Salvando…" : children}
    </button>
  );
}

/**
 * Barra de salvar que acompanha a rolagem. No celular fica acima da barra
 * de abas; num formulário longo o botão nunca sai do alcance do dedo.
 */
export function BarraSalvar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mt-6 lg:bottom-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)]/90 p-2.5 pl-3 shadow-[var(--sombra-alta)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- abas */

/**
 * Abas em trilho. No celular o trilho rola de lado dentro dele mesmo,
 * sem empurrar a página.
 */
export function Abas<T extends string>({
  itens,
  atual,
  aoEscolher,
}: {
  itens: readonly { id: T; rotulo: string }[];
  atual: T;
  aoEscolher: (id: T) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        className="inline-flex gap-1 rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] p-1 shadow-[0_1px_0_rgb(1_38_22/0.04)]"
      >
        {itens.map((item) => {
          const ativo = item.id === atual;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => aoEscolher(item.id)}
              className={cn(
                "min-h-10 rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-200",
                ativo
                  ? "bg-[var(--color-verde-950)] font-medium text-white"
                  : "text-[var(--fg-tenue)] hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]",
              )}
            >
              {item.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- avisos */

export function Aviso({
  tipo = "info",
  children,
}: {
  tipo?: "info" | "erro" | "ok";
  children: ReactNode;
}) {
  const cores = {
    info: "border-[var(--borda)] bg-[var(--bg)] text-[var(--fg-suave)]",
    erro: "border-[var(--color-acento-forte)]/40 bg-[var(--color-acento)]/10 text-[var(--fg)]",
    ok: "border-[var(--color-verde-200)] bg-[var(--color-verde-50)] text-[var(--color-verde-900)]",
  };
  return (
    <p className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", cores[tipo])}>
      {children}
    </p>
  );
}

export function Etiqueta({
  tom = "neutro",
  children,
  className,
}: {
  tom?: "neutro" | "verde" | "ouro" | "vidro";
  children: ReactNode;
  className?: string;
}) {
  const cores = {
    neutro: "bg-[var(--bg-fundo)] text-[var(--fg-suave)]",
    verde: "bg-[var(--color-verde-50)] text-[var(--color-verde-800)]",
    ouro: "bg-[var(--color-ouro-100)] text-[var(--color-ouro-800)]",
    vidro: "bg-white/85 text-[var(--color-verde-950)] backdrop-blur-md",
  };
  const ponto = {
    neutro: "bg-[var(--fg-tenue)]",
    verde: "bg-[var(--color-verde-600)]",
    ouro: "bg-[var(--color-ouro-600)]",
    vidro: "bg-[var(--color-verde-600)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cores[tom],
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", ponto[tom])} />
      {children}
    </span>
  );
}

/** Estado vazio de uma lista, com o que fazer em seguida. */
export function Vazio({
  icone,
  titulo,
  texto,
  acao,
}: {
  icone: ReactNode;
  titulo: string;
  texto: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[1.25rem] border border-dashed border-[var(--borda-forte)] px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--bg-elevado)] text-[var(--color-verde-800)] shadow-[var(--sombra-painel)]">
        {icone}
      </span>
      <p className="font-display mt-5 text-lg font-medium">{titulo}</p>
      <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-pretty text-[var(--fg-tenue)]">
        {texto}
      </p>
      {acao ? <div className="mt-6">{acao}</div> : null}
    </div>
  );
}

/**
 * Escolha entre poucas opções, em botões lado a lado. No celular é
 * melhor que um <select>: tudo à vista, um toque só. São rádios nativos,
 * então entram no envio do formulário sem JavaScript.
 */
export function Escolha({
  nome,
  opcoes,
  valor,
  id,
}: {
  nome: string;
  opcoes: readonly { valor: string; rotulo: string }[];
  valor: string;
  id?: string;
}) {
  return (
    <div
      id={useIdDoCampo(id)}
      role="radiogroup"
      className="grid min-h-11 auto-cols-fr grid-flow-col gap-1 rounded-xl border border-[var(--borda)] bg-[var(--bg-fundo)] p-1"
    >
      {opcoes.map((o) => (
        <label key={o.valor} className="min-w-0 cursor-pointer">
          <input
            type="radio"
            name={nome}
            value={o.valor}
            defaultChecked={o.valor === valor}
            className="peer sr-only"
          />
          <span className="flex h-full min-h-9 items-center justify-center rounded-lg px-2 text-center text-sm text-[var(--fg-tenue)] transition-[background-color,color,box-shadow] duration-200 peer-checked:bg-[var(--bg-elevado)] peer-checked:font-medium peer-checked:text-[var(--color-verde-950)] peer-checked:shadow-[0_1px_3px_rgb(1_38_22/0.12)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-verde-600)]/40">
            {o.rotulo}
          </span>
        </label>
      ))}
    </div>
  );
}

/** Campo com um pedaço fixo à esquerda, como o começo de um endereço. */
export function EntradaComPrefixo({
  prefixo,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { prefixo: string }) {
  const idFinal = useIdDoCampo(id);
  return (
    <div className="flex min-h-11 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-[var(--borda)] bg-[var(--bg-elevado)] transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--color-verde-700)] focus-within:shadow-[0_0_0_4px_rgb(0_69_39/0.1)] hover:border-[var(--borda-forte)]">
      <span className="flex shrink-0 items-center border-r border-[var(--borda)] bg-[var(--bg)] px-3 text-sm text-[var(--fg-tenue)]">
        {prefixo}
      </span>
      <input
        id={idFinal}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-[var(--fg)] placeholder:text-[var(--fg-tenue)]/70 focus:outline-none sm:text-[0.9375rem]",
          className,
        )}
        {...props}
      />
    </div>
  );
}
