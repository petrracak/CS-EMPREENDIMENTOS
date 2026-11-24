"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { BotaoNovo } from "@/components/site/botao-novo";
import { Logo } from "@/components/site/logo";
import { ITENS } from "@/components/site/menu-itens";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho do redesenho (Figma 86:259), por enquanto só na home nova.
 *
 * Uma barra verde de vidro que flutua sobre a página, com cantos de 8 px
 * e desfoque do que passa por trás. Ela não troca de estado como o
 * cabeçalho atual: só fica um pouco mais opaca e ganha sombra quando a
 * página rola, para os links continuarem legíveis sobre fotos claras.
 *
 * No celular a barra fica com a logo e o menu; o menu abre um painel do
 * mesmo vidro logo abaixo dela.
 */
export function CabecalhoNovo({ whatsapp }: { whatsapp: string }) {
  const caminho = usePathname();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  // Onde o painel do celular começa: logo abaixo da barra, que nem sempre
  // está no topo da tela (a faixa de campanha pode estar acima dela).
  const barra = useRef<HTMLDivElement>(null);
  const [topoMenu, setTopoMenu] = useState(80);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [caminho]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  const ativo = (href: string) =>
    href === "/" ? caminho === "/" || caminho === "/home-nova" : caminho.startsWith(href);

  return (
    <header className="cabecalho-novo">
      <div
        ref={barra}
        className={cn("cabecalho-novo-barra", (rolou || menuAberto) && "cabecalho-novo-barra-rolou")}
      >
        <Link href="/home-nova" aria-label="CS Empreendimentos, página inicial" className="shrink-0">
          <Logo variante="branca" prioridade className="cabecalho-novo-logo" />
        </Link>

        <div className="flex items-center gap-7">
          <nav className="hidden items-center gap-7 lg:flex">
            {ITENS.map((item) => (
              <Link
                key={item.href}
                href={item.href === "/" ? "/home-nova" : item.href}
                aria-current={ativo(item.href) ? "page" : undefined}
                className="cabecalho-novo-link"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <BotaoNovo
            href={whatsapp}
            tipo="secundario"
            icone="zap"
            className="cabecalho-novo-botao"
          >
            Falar com um consultor
          </BotaoNovo>

          <button
            type="button"
            onClick={() => {
              if (barra.current) {
                setTopoMenu(barra.current.getBoundingClientRect().bottom + 8);
              }
              setMenuAberto((v) => !v);
            }}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-lg text-[#ebfff6] transition-colors hover:bg-white/10 lg:hidden"
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Painel do celular. Vai por portal para o <body>: a barra tem
          desfoque de fundo, e isso faz dela a referência de qualquer
          `position: fixed` lá dentro — o painel ficaria preso nos 64 px
          da barra. */}
      {menuAberto
        ? createPortal(
            <div
              style={{ top: topoMenu }}
              className="cabecalho-novo-painel fixed inset-x-3 bottom-3 z-40 flex flex-col overflow-y-auto lg:hidden"
            >
              <nav className="flex flex-col px-5 pt-2">
                {ITENS.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href === "/" ? "/home-nova" : item.href}
                    data-entrada
                    style={{ "--atraso": `${60 + i * 70}ms` } as CSSProperties}
                    className={cn(
                      "flex items-center justify-between border-b border-white/12 py-5 text-2xl font-light tracking-[-0.06em]",
                      ativo(item.href) ? "text-white" : "text-[#ebfff6]/75",
                    )}
                  >
                    {item.rotulo}
                    <ArrowUpRightIcon
                      size={22}
                      weight="light"
                      className={ativo(item.href) ? "text-[#f3d694]" : "text-[#ebfff6]/50"}
                    />
                  </Link>
                ))}
              </nav>

              <div
                data-entrada
                style={{ "--atraso": "380ms" } as CSSProperties}
                className="mt-auto flex flex-col px-5 pt-10 pb-5"
              >
                <BotaoNovo href={whatsapp} tipo="secundario" icone="zap">
                  Falar com um consultor
                </BotaoNovo>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
