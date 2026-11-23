"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Code2,
  Ellipsis,
  ExternalLink,
  FileText,
  House,
  LayoutTemplate,
  LogOut,
  PenLine,
  Plus,
  ShieldCheck,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { sair } from "@/app/actions/auth";
import { Logo } from "@/components/site/logo";
import { pode, type Area, type Nivel } from "@/lib/permissoes";
import { cn } from "@/lib/utils";

/**
 * A casca do painel.
 *
 * Computador: coluna clara à esquerda, no mesmo papel do fundo. O item
 * atual vira uma ficha branca com o ícone em verde e dourado; o resto
 * fica quieto. Um bloco verde-escuro inteiro na lateral, como era antes,
 * pesava mais que o conteúdo.
 *
 * Celular: barra de abas embaixo, no alcance do polegar, com o "+" no
 * meio para criar, e o resto do menu numa folha que sobe de baixo.
 */

type Item = {
  href: string;
  rotulo: string;
  Icone: LucideIcon;
  exato?: boolean;
  contagem?: boolean;
  /** Sem área, todo mundo vê. */
  area?: Area;
  /** Rótulo da aba de baixo, no celular. */
  curto?: string;
  /** Linha de apoio na folha do celular. */
  detalhe?: string;
};

const PRINCIPAIS: Item[] = [
  { href: "/admin", rotulo: "Início", Icone: House, exato: true },
  {
    href: "/admin/empreendimentos",
    rotulo: "Empreendimentos",
    curto: "Obras",
    Icone: Building2,
    area: "obras",
  },
  {
    href: "/admin/conteudo",
    rotulo: "Conteúdo do site",
    curto: "Conteúdo",
    Icone: LayoutTemplate,
    area: "conteudo",
  },
  { href: "/admin/blog", rotulo: "Blog", Icone: FileText, area: "blog" },
  {
    href: "/admin/cadastros",
    rotulo: "Cadastros",
    Icone: Users,
    contagem: true,
    area: "cadastros",
    detalhe: "Quem preencheu o formulário",
  },
];

const GESTAO: Item[] = [
  { href: "/admin/tipos", rotulo: "Tipos", Icone: Tags, area: "obras" },
  {
    href: "/admin/usuarios",
    rotulo: "Usuários",
    Icone: ShieldCheck,
    area: "usuarios",
    detalhe: "Quem entra no painel e o que pode fazer",
  },
  {
    href: "/admin/configuracoes",
    rotulo: "Pixels e scripts",
    Icone: Code2,
    area: "tecnico",
    detalhe: "Meta, Google, TikTok e outros",
  },
  { href: "/admin/conta", rotulo: "Minha conta", Icone: UserRound },
];

/** Só o que o nível da pessoa abre. */
function visiveis(itens: Item[], nivel: Nivel) {
  return itens.filter((item) => !item.area || pode(nivel, item.area));
}

function ativoEm(caminho: string, item: Pick<Item, "href" | "exato">) {
  return item.exato ? caminho === item.href : caminho.startsWith(item.href);
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return (
    ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "CS"
  );
}

function Avatar({ nome, grande }: { nome: string; grande?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[var(--color-verde-950)] font-medium text-[var(--color-ouro-300)]",
        grande ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs",
      )}
    >
      {iniciais(nome)}
    </span>
  );
}

function Contagem({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      aria-label={`${n} novos`}
      className={cn(
        "tabular grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-acento)] px-1.5 text-[0.6875rem] leading-none font-semibold text-[var(--color-verde-950)]",
        className,
      )}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

/* ------------------------------------------------------------ desktop */

function LinkLateral({
  item,
  ativo,
  novos,
}: {
  item: Item;
  ativo: boolean;
  novos: number;
}) {
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-xl px-2 text-[0.9375rem] transition-[background-color,color,box-shadow] duration-300",
        ativo
          ? "bg-[var(--bg-elevado)] font-medium text-[var(--color-verde-950)] shadow-[var(--sombra-painel)]"
          : "text-[var(--fg-suave)] hover:bg-[var(--bg-elevado)]/60 hover:text-[var(--fg)]",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-300",
          ativo
            ? "bg-[var(--color-verde-900)] text-[var(--color-ouro-300)]"
            : "text-[var(--fg-tenue)] group-hover:text-[var(--color-verde-800)]",
        )}
      >
        <item.Icone className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
      {item.contagem ? <Contagem n={novos} className="mr-1" /> : null}
    </Link>
  );
}

function Lateral({
  nome,
  email,
  nivel,
  caminho,
  novos,
}: {
  nome: string;
  email: string | null;
  nivel: Nivel;
  caminho: string;
  novos: number;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 flex-col px-4 py-6 lg:flex">
      <Link href="/admin" className="block px-2">
        <Logo className="h-12 w-auto" />
      </Link>
      <p className="mt-3 px-2 text-xs text-[var(--fg-tenue)]">Painel do site</p>

      <nav
        aria-label="Principal"
        className="mt-8 flex-1 space-y-7 overflow-y-auto"
      >
        <div className="space-y-1">
          {visiveis(PRINCIPAIS, nivel).map((item) => (
            <LinkLateral
              key={item.href}
              item={item}
              ativo={ativoEm(caminho, item)}
              novos={novos}
            />
          ))}
        </div>
        <div>
          <p className="px-2 pb-2 text-[0.6875rem] font-medium tracking-[0.08em] text-[var(--fg-tenue)] uppercase">
            Ajustes
          </p>
          <div className="space-y-1">
            {visiveis(GESTAO, nivel).map((item) => (
              <LinkLateral
                key={item.href}
                item={item}
                ativo={ativoEm(caminho, item)}
                novos={0}
              />
            ))}
          </div>
        </div>
      </nav>

      <Link
        href="/"
        target="_blank"
        className="group mb-3 flex items-center gap-3 rounded-2xl bg-[var(--color-verde-950)] p-3 text-white transition-colors duration-300 hover:bg-[var(--color-verde-900)]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[var(--color-ouro-300)]">
          <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Ver o site</span>
          <span className="block text-xs text-white/55">
            Abre numa aba nova
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-white/40 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)]/70 p-2.5">
        <Link
          href="/admin/conta"
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <Avatar nome={nome} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{nome}</span>
            {email ? (
              <span className="block truncate text-xs text-[var(--fg-tenue)]">
                {email}
              </span>
            ) : null}
          </span>
        </Link>
        <form action={sair}>
          <button
            type="submit"
            aria-label="Sair"
            title="Sair"
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------ celular */

function BarraTopo({ nome }: { nome: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--borda)]/70 bg-[var(--painel-fundo)]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/admin" aria-label="Início do painel">
          <Logo className="h-10 w-auto" />
        </Link>
        <Link
          href="/admin/conta"
          aria-label="Minha conta"
          className="grid h-11 w-11 place-items-center rounded-full"
        >
          <Avatar nome={nome} />
        </Link>
      </div>
    </header>
  );
}

/**
 * Painel que sobe de baixo. Fechado, fica fora da tela e `inert`: não
 * recebe foco nem leitor de tela. Esc, toque no fundo ou numa opção fecha.
 */
function Folha({
  aberta,
  aoFechar,
  titulo,
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberta) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta, aoFechar]);

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        !aberta && "pointer-events-none",
      )}
      inert={!aberta}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={aoFechar}
        className={cn(
          "absolute inset-0 bg-[var(--color-verde-950)]/45 transition-opacity duration-300 motion-reduce:transition-none",
          aberta ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[1.75rem] bg-[var(--bg)] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-500 [transition-timing-function:var(--ease-saida)] motion-reduce:transition-none",
          aberta ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          aria-hidden
          className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--borda-forte)]"
        />
        <p className="font-display px-2 pb-3 text-lg font-medium">{titulo}</p>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ItemFolha({
  href,
  Icone,
  rotulo,
  detalhe,
  aoEscolher,
  destaque,
  externo,
  contagem = 0,
}: {
  href: string;
  Icone: LucideIcon;
  rotulo: string;
  detalhe?: string;
  aoEscolher: () => void;
  destaque?: boolean;
  externo?: boolean;
  contagem?: number;
}) {
  return (
    <Link
      href={href}
      onClick={aoEscolher}
      target={externo ? "_blank" : undefined}
      className="flex min-h-14 items-center gap-4 rounded-2xl px-2 py-1.5 transition-colors active:bg-[var(--bg-fundo)]"
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
          destaque
            ? "bg-[var(--color-verde-900)] text-[var(--color-ouro-300)]"
            : "border border-[var(--borda)] bg-[var(--bg-elevado)] text-[var(--color-verde-800)]",
        )}
      >
        <Icone className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium">{rotulo}</span>
        {detalhe ? (
          <span className="block text-sm text-[var(--fg-tenue)]">
            {detalhe}
          </span>
        ) : null}
      </span>
      <Contagem n={contagem} />
      <ChevronRight
        className="h-5 w-5 shrink-0 text-[var(--fg-tenue)]/60"
        strokeWidth={1.5}
      />
    </Link>
  );
}

function AbaInferior({
  nome,
  email,
  nivel,
  caminho,
  novos,
}: {
  nome: string;
  email: string | null;
  nivel: Nivel;
  caminho: string;
  novos: number;
}) {
  const [folha, setFolha] = useState<"novo" | "mais" | null>(null);
  const [montado, setMontado] = useState(false);
  const fechar = useCallback(() => setFolha(null), []);

  // A folha vai para o <body> por portal, e o portal só existe no
  // navegador.
  useEffect(() => setMontado(true), []);
  useEffect(() => setFolha(null), [caminho]);

  // Início e as duas primeiras áreas do nível viram abas; o resto vai
  // para a folha "Mais". Administrador: Obras e Conteúdo. Editor:
  // Conteúdo e Blog. Comercial: Obras e Cadastros.
  const [inicio, ...areas] = visiveis(PRINCIPAIS, nivel);
  const abas = areas.slice(0, 2);
  const naFolha = [...areas.slice(2), ...visiveis(GESTAO, nivel)].filter(
    (item) => item.href !== "/admin/conta",
  );
  const naFolhaMais =
    caminho.startsWith("/admin/conta") ||
    naFolha.some((item) => ativoEm(caminho, item));
  const cadastrosNaFolha = naFolha.some((item) => item.contagem);

  const novosItens = [
    pode(nivel, "obras")
      ? {
          href: "/admin/empreendimentos/novo",
          Icone: Building2,
          rotulo: "Novo empreendimento",
          detalhe: "Página nova, com fotos e unidades",
        }
      : null,
    pode(nivel, "blog")
      ? {
          href: "/admin/blog/novo",
          Icone: PenLine,
          rotulo: "Nova publicação",
          detalhe: "Texto para o blog",
        }
      : null,
  ].filter((item) => item !== null);

  const aba = (item: Item | undefined, rotulo?: string) => {
    if (!item) return <span />;
    const ativo = ativoEm(caminho, item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={ativo ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors",
          ativo ? "text-[var(--color-verde-900)]" : "text-[var(--fg-tenue)]",
        )}
      >
        <span
          className={cn(
            "relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-300",
            ativo && "bg-[var(--color-verde-900)] text-[var(--color-ouro-300)]",
          )}
        >
          <item.Icone
            className="h-[1.3rem] w-[1.3rem]"
            strokeWidth={ativo ? 1.9 : 1.6}
          />
          {item.contagem ? (
            <Contagem
              n={novos}
              className="absolute -top-1 right-1 h-4 min-w-4 text-[0.625rem]"
            />
          ) : null}
        </span>
        {rotulo ?? item.curto ?? item.rotulo}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--borda)] bg-[var(--bg)]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid h-[4.25rem] max-w-md grid-cols-5">
          {aba(inicio, "Início")}
          {aba(abas[0])}

          <div className="grid place-items-center">
            {novosItens.length ? (
              <button
                type="button"
                onClick={() => setFolha("novo")}
                aria-label="Criar novo"
                aria-haspopup="dialog"
                className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-verde-900)] text-[var(--color-ouro-300)] shadow-[0_10px_24px_-8px_rgb(1_38_22/0.7)] ring-4 ring-[var(--bg)] transition-transform active:scale-95"
              >
                <Plus className="h-6 w-6" strokeWidth={2.2} />
              </button>
            ) : null}
          </div>

          {aba(abas[1])}

          <button
            type="button"
            onClick={() => setFolha("mais")}
            aria-haspopup="dialog"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors",
              naFolhaMais
                ? "text-[var(--color-verde-900)]"
                : "text-[var(--fg-tenue)]",
            )}
          >
            <span
              className={cn(
                "relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-300",
                naFolhaMais &&
                  "bg-[var(--color-verde-900)] text-[var(--color-ouro-300)]",
              )}
            >
              <Ellipsis
                className="h-[1.3rem] w-[1.3rem]"
                strokeWidth={naFolhaMais ? 1.9 : 1.6}
              />
              {cadastrosNaFolha ? (
                <Contagem
                  n={novos}
                  className="absolute -top-1 right-1 h-4 min-w-4 text-[0.625rem]"
                />
              ) : null}
            </span>
            Mais
          </button>
        </div>
      </nav>

      {montado ? (
        <>
          <Folha
            aberta={folha === "novo"}
            aoFechar={fechar}
            titulo="O que você quer criar?"
          >
            {novosItens.map((item, i) => (
              <ItemFolha
                key={item.href}
                {...item}
                aoEscolher={fechar}
                destaque={i === 0}
              />
            ))}
          </Folha>

          <Folha
            aberta={folha === "mais"}
            aoFechar={fechar}
            titulo="Mais opções"
          >
            <Link
              href="/admin/conta"
              onClick={fechar}
              className="mb-2 flex items-center gap-4 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-3"
            >
              <Avatar nome={nome} grande />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium">
                  {nome}
                </span>
                {email ? (
                  <span className="block truncate text-sm text-[var(--fg-tenue)]">
                    {email}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-[var(--fg-tenue)]/60"
                strokeWidth={1.5}
              />
            </Link>

            {naFolha.map((item) => (
              <ItemFolha
                key={item.href}
                href={item.href}
                Icone={item.Icone}
                rotulo={item.rotulo}
                detalhe={item.detalhe}
                aoEscolher={fechar}
                contagem={item.contagem ? novos : 0}
              />
            ))}
            <ItemFolha
              href="/"
              Icone={ExternalLink}
              rotulo="Ver o site"
              aoEscolher={fechar}
              externo
            />

            <form action={sair} className="mt-1">
              <button
                type="submit"
                className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-2 text-left text-[var(--color-acento-forte)] transition-colors active:bg-[var(--color-acento)]/10"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-acento)]/15">
                  <LogOut className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="text-base font-medium">Sair</span>
              </button>
            </form>
          </Folha>
        </>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------- casca */

export function CascaPainel({
  nome,
  email,
  nivel,
  novos,
  children,
}: {
  nome: string;
  email: string | null;
  nivel: Nivel;
  novos: number;
  children: React.ReactNode;
}) {
  const caminho = usePathname();

  return (
    // overflow-x: clip, e não hidden: hidden transformaria este bloco em
    // contêiner de rolagem e quebraria o position: sticky lá dentro.
    <div className="min-h-dvh overflow-x-clip bg-[var(--painel-fundo)] lg:flex">
      <Lateral
        nome={nome}
        email={email}
        nivel={nivel}
        caminho={caminho}
        novos={novos}
      />
      <BarraTopo nome={nome} />

      <main className="min-w-0 flex-1 px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
        <div className="mx-auto w-full max-w-[68rem]">{children}</div>
      </main>

      <AbaInferior
        nome={nome}
        email={email}
        nivel={nivel}
        caminho={caminho}
        novos={novos}
      />
    </div>
  );
}
