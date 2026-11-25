"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  FormularioSaida,
  MARCA_CADASTRO,
} from "@/components/site/formulario-lead";
import { Simbolo } from "@/components/site/logo";
import { TextoRico } from "@/components/site/palavras";
import type { CardEmpreendimento } from "@/lib/queries";

/**
 * Pop-up de saída: o cadastro curto e os empreendimentos em destaque,
 * na hora em que a pessoa vai embora.
 *
 * Nenhum navegador avisa o site de que a aba vai fechar, então a saída é
 * adivinhada pelo gesto:
 *   computador  o cursor sobe e sai pela borda de cima da janela, rumo
 *               à barra de abas, ao X ou ao botão de voltar
 *   celular     depois de ler um pouco, a pessoa rola para cima rápido,
 *               o gesto de quem volta ao topo para sair ou trocar de aba
 *
 * Aparece uma vez por visita, e nunca para quem já se cadastrou em
 * qualquer formulário do site. Nem na página de cadastro, onde o
 * formulário já está na tela. Os primeiros segundos não contam: quem
 * acabou de chegar e já esbarrou na borda não está indo embora.
 */

const VISTO_NA_VISITA = "cs:saida";
const ESPERA_MS = 5000;

type Opcao = { id: string; nome: string };

export function PopupSaida({
  olho,
  titulo,
  texto,
  botao,
  tituloDestaques,
  destaques,
  empreendimentos,
}: {
  olho: string;
  titulo: string;
  texto: string;
  botao: string;
  tituloDestaques: string;
  destaques: CardEmpreendimento[];
  empreendimentos: Opcao[];
}) {
  const caminho = usePathname();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState(false);

  const abrir = useCallback(() => {
    const el = dialogo.current;
    if (!el || el.open) return;
    try {
      if (localStorage.getItem(MARCA_CADASTRO)) return;
      if (sessionStorage.getItem(VISTO_NA_VISITA)) return;
      sessionStorage.setItem(VISTO_NA_VISITA, "1");
    } catch {
      // Sem armazenamento não dá para lembrar; ainda assim só abre uma
      // vez nesta página, porque o el.open acima segura a segunda.
    }
    el.showModal();
    setAberto(true);
  }, []);

  const fechar = useCallback(() => dialogo.current?.close(), []);

  // Os gatilhos.
  useEffect(() => {
    if (caminho === "/cadastro") return;

    let armado = false;
    const relogio = window.setTimeout(() => (armado = true), ESPERA_MS);

    // Computador: o cursor sai pela borda de cima.
    const aoSairDaJanela = (e: MouseEvent) => {
      if (!armado || e.relatedTarget || e.clientY > 8) return;
      abrir();
    };

    // Celular: rolagem rápida para cima depois de ter descido um pouco.
    const toque = window.matchMedia("(pointer: coarse)").matches;
    let ultimoY = window.scrollY;
    let ultimoT = performance.now();
    let maisFundo = ultimoY;
    const aoRolar = () => {
      const y = window.scrollY;
      const t = performance.now();
      const velocidade = (ultimoY - y) / Math.max(t - ultimoT, 1); // px/ms, + para cima
      maisFundo = Math.max(maisFundo, y);
      const leuUmPouco = maisFundo > window.innerHeight * 0.8;
      if (armado && leuUmPouco && velocidade > 2.2 && y < maisFundo - 400) {
        abrir();
      }
      ultimoY = y;
      ultimoT = t;
    };

    document.addEventListener("mouseout", aoSairDaJanela);
    if (toque) window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.clearTimeout(relogio);
      document.removeEventListener("mouseout", aoSairDaJanela);
      window.removeEventListener("scroll", aoRolar);
    };
  }, [caminho, abrir]);

  // A página de trás não rola enquanto o pop-up está aberto.
  useEffect(() => {
    if (!aberto) return;
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => {
      raiz.style.overflow = antes;
    };
  }, [aberto]);

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="popup-saida-titulo"
      onClose={() => setAberto(false)}
      // Clique no fundo escuro fecha; clique dentro do cartão, não.
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
      // O <dialog> tem uma altura máxima do navegador (100% − 2em − 6px)
      // menor que a do conteúdo, e corta o que passa: no celular, o fim
      // do cadastro e os empreendimentos ficavam fora de alcance, sem
      // rolar. As duas alturas agora são a mesma, e quem rola é o
      // conteúdo. dvh acompanha a barra do Safari aparecendo e sumindo.
      className="popup-saida m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-4xl overflow-hidden rounded-[1.75rem] bg-transparent p-0 text-[var(--fg)] backdrop:bg-[var(--color-verde-950)]/70 backdrop:backdrop-blur-sm"
    >
      {aberto ? (
        <div className="grid max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain bg-white bg-[linear-gradient(to_bottom,#ebfff6,#ffffff_16rem)] md:grid-cols-[1.1fr_0.9fr]">
          {/* ------------------------------------------- o cadastro */}
          <div className="relative p-6 sm:p-9">
            {olho ? <span className="olho">{olho}</span> : null}
            <h2
              id="popup-saida-titulo"
              className="font-display text-display-sm mt-4 pr-8 font-medium text-balance"
            >
              <TextoRico html={titulo} tom="verde" />
            </h2>
            {texto ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg-suave)] sm:text-base">
                {texto}
              </p>
            ) : null}
            <FormularioSaida
              empreendimentos={empreendimentos}
              origem={`popup-saida:${caminho}`}
              botao={botao}
            />
          </div>

          {/* ------------------------------------ o que está em obra */}
          {destaques.length ? (
            <aside className="blog-verde relative isolate overflow-hidden p-6 text-white sm:p-9">
              <Simbolo className="pointer-events-none absolute -right-10 -bottom-12 -z-10 h-56 w-auto text-white/[0.04]" />
              <p className="text-[0.9375rem] text-[var(--color-ouro-300)]">
                {tituloDestaques}
              </p>
              <ul className="mt-5 space-y-3">
                {destaques.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/empreendimentos/${item.slug}`}
                      onClick={fechar}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 pr-4 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-verde-900)] sm:h-[4.5rem] sm:w-24">
                        {item.imagem_principal ? (
                          <Image
                            src={item.imagem_principal}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {item.nome}
                        </span>
                        {item.bairro ? (
                          <span className="mt-1 flex items-center gap-1 truncate text-xs text-white/55">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {item.bairro}
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--color-ouro-300)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/empreendimentos"
                onClick={fechar}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                Ver todos os empreendimentos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar"
        className="absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-[var(--bg-elevado)] text-[var(--fg-suave)] shadow-[0_2px_10px_rgb(1_38_22/0.18)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
      >
        <X className="h-5 w-5" />
      </button>
    </dialog>
  );
}
