"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { sair } from "@/app/actions/auth";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/admin", rotulo: "Visão geral", Icone: LayoutDashboard, exato: true },
  { href: "/admin/empreendimentos", rotulo: "Empreendimentos", Icone: Building2 },
  { href: "/admin/conteudo", rotulo: "Conteúdo do site", Icone: LayoutTemplate },
  { href: "/admin/blog", rotulo: "Blog", Icone: FileText },
  { href: "/admin/cadastros", rotulo: "Cadastros", Icone: Users },
  { href: "/admin/tipos", rotulo: "Tipos", Icone: Tags },
];

export function Navegacao({
  nome,
  email,
}: {
  nome: string;
  email: string | null;
}) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [caminho]);

  const lista = (
    <nav className="flex flex-1 flex-col gap-1">
      {ITENS.map(({ href, rotulo, Icone, exato }) => {
        const ativo = exato ? caminho === href : caminho.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-400",
              ativo
                ? "bg-white/12 font-medium text-white"
                : "text-white/60 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icone className="h-4 w-4 shrink-0" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );

  const rodape = (
    <div className="border-t border-white/10 pt-4">
      <Link
        href="/admin/conta"
        className="block rounded-lg px-3 py-2 transition-colors hover:bg-white/6"
      >
        <p className="truncate text-sm font-medium text-white">{nome}</p>
        {email ? (
          <p className="truncate text-xs text-white/45">{email}</p>
        ) : null}
      </Link>
      <form action={sair}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/6 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* ------------------------------------------------- barra do celular */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--borda)] bg-[var(--bg)] px-4 py-3 lg:hidden">
        <Logo className="h-9 w-auto" />
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="rounded-lg p-2 text-[var(--fg)] hover:bg-[var(--bg-fundo)]"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {aberto ? (
        <div className="fixed inset-0 top-[57px] z-30 flex flex-col bg-[var(--bg-tinta)] p-4 lg:hidden">
          {lista}
          {rodape}
        </div>
      ) : null}

      {/* -------------------------------------------------- coluna fixa */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-[var(--bg-tinta)] p-4 lg:flex">
        <Link href="/admin" className="px-3 py-3">
          <Logo variante="branca" className="h-10 w-auto" />
        </Link>
        {lista}
        {rodape}
      </aside>
    </>
  );
}
