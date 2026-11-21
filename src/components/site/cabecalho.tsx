"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Whatsapp } from "@/components/icones-sociais";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/", rotulo: "Início" },
  { href: "/empreendimentos", rotulo: "Empreendimentos" },
  { href: "/blog", rotulo: "Blog" },
  { href: "/cadastro", rotulo: "Cadastre-se" },
];

export function Cabecalho({ whatsapp }: { whatsapp: string }) {
  const caminho = usePathname();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  // Onde o menu do celular começa: logo abaixo da barra. A barra nem
  // sempre está no topo da tela — com a faixa de campanha visível, ela
  // fica mais abaixo —, então a posição é medida na hora de abrir.
  const barra = useRef<HTMLDivElement>(null);
  const [topoMenu, setTopoMenu] = useState(80);

  // As páginas que abrem com foto em tela cheia: a inicial e a ficha de
  // cada empreendimento (não a listagem, que começa com texto).
  const sobreFoto =
    caminho === "/" ||
    (caminho.startsWith("/empreendimentos/") && caminho !== "/empreendimentos");

  // O cabeçalho começa transparente sobre a foto do topo e ganha fundo
  // assim que a página sai do lugar. Sem isso o logo verde fica ilegível
  // sobre o céu claro do render.
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Menu aberto trava a rolagem do fundo; trocar de página fecha.
  useEffect(() => {
    setMenuAberto(false);
  }, [caminho]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  // "Sólido" é o estado com fundo: ou a pessoa rolou, ou o menu está
  // aberto, ou a página não tem foto de topo para o cabeçalho flutuar.
  const solido = rolou || menuAberto || !sobreFoto;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        "[transition-timing-function:var(--ease-saida)]",
        solido
          ? "border-b border-[var(--borda)] bg-[var(--bg)]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        ref={barra}
        className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8"
      >
        {/* Sobre a foto do topo a logo precisa ser a branca; com fundo,
            volta a colorida. As duas ficam montadas e trocam por opacidade,
            senão o logo pisca a cada rolagem. */}
        <Link
          href="/"
          aria-label="CS Empreendimentos, página inicial"
          className="relative shrink-0"
        >
          <Logo
            prioridade
            className={cn(
              "h-10 w-auto transition-opacity duration-500 sm:h-12",
              solido ? "opacity-100" : "opacity-0",
            )}
          />
          <Logo
            variante="branca"
            className={cn(
              "absolute inset-0 h-10 w-auto transition-opacity duration-500 sm:h-12",
              solido ? "opacity-0" : "opacity-100",
            )}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {ITENS.map((item) => {
            const ativo =
              item.href === "/"
                ? caminho === "/"
                : caminho.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm transition-colors duration-500",
                  solido
                    ? ativo
                      ? "text-[var(--acento)]"
                      : "text-[var(--fg-suave)] hover:text-[var(--fg)]"
                    : ativo
                      ? "text-white"
                      : "text-white/70 hover:text-white",
                )}
              >
                {item.rotulo}
                {/* O traço do acento marca a página atual. */}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px w-full origin-left",
                    "bg-gradient-to-r from-[var(--color-acento)] to-[var(--color-ouro-300)]",
                    "transition-transform duration-500",
                    "[transition-timing-function:var(--ease-saida)]",
                    ativo ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "hidden items-center gap-2 rounded-full px-5 py-2.5 sm:inline-flex",
              "text-sm font-medium transition-colors duration-500",
              solido
                ? "bg-[var(--acento)] text-white hover:bg-[var(--acento-hover)]"
                : "bg-white/95 text-[var(--color-verde-900)] hover:bg-white",
            )}
          >
            <Whatsapp className="h-4 w-4" />
            Falar no WhatsApp
          </a>

          <button
            type="button"
            onClick={() => {
              if (barra.current) {
                setTopoMenu(barra.current.getBoundingClientRect().bottom);
              }
              setMenuAberto((v) => !v);
            }}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className={cn(
              "rounded-full p-2.5 transition-colors md:hidden",
              solido
                ? "text-[var(--fg)] hover:bg-[var(--bg-fundo)]"
                : "text-white hover:bg-white/10",
            )}
          >
            {menuAberto ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Menu do celular: ocupa toda a tela abaixo da barra, para não
          deixar a página aparecendo por baixo como uma gaveta curta.

          Vai por portal direto para o <body>. A barra tem desfoque de
          fundo (backdrop-filter), e no CSS isso transforma a barra na
          referência de qualquer `position: fixed` lá dentro: o painel
          se posicionaria dentro dos 80 px da barra e ficaria com altura
          zero. Fora dela, `fixed` volta a ser relativo à tela.
          Os links entram em cascata (data-entrada, que é CSS e roda a
          cada abertura, porque o painel nasce de novo) e o WhatsApp fica
          preso no pé, onde o polegar alcança. */}
      {menuAberto
        ? createPortal(
            <div
              style={{ top: topoMenu }}
              className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto border-t border-[var(--borda)] bg-[var(--bg)] md:hidden"
            >
              <nav className="flex flex-col px-5 pt-2 sm:px-8">
                {ITENS.map((item, i) => {
                  const ativo =
                    item.href === "/"
                      ? caminho === "/"
                      : caminho.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-entrada
                      style={
                        {
                          "--atraso": `${60 + i * 70}ms`,
                        } as React.CSSProperties
                      }
                      className={cn(
                        "font-display flex items-center justify-between border-b border-[var(--borda)] py-5 text-2xl font-medium tracking-tight",
                        ativo ? "text-[var(--acento)]" : "text-[var(--fg)]",
                      )}
                    >
                      {item.rotulo}
                      <ArrowUpRightIcon
                        size={22}
                        weight="regular"
                        className={
                          ativo
                            ? "text-[var(--acento)]"
                            : "text-[var(--fg-tenue)]"
                        }
                      />
                    </Link>
                  );
                })}
              </nav>

              <div
                data-entrada
                style={{ "--atraso": "380ms" } as React.CSSProperties}
                className="mt-auto px-5 pt-10 pb-8 sm:px-8"
              >
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[var(--acento)] px-5 py-4 text-base font-medium text-white"
                >
                  <Whatsapp className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
