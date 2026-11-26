"use client";

import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, type CSSProperties } from "react";

import { entrar, type EstadoLogin } from "@/app/actions/auth";
import { Aviso, Campo, Entrada, Salvar } from "@/components/admin/ui";
import { Logo } from "@/components/site/logo";
import { VitrineLogo } from "@/components/site/vitrine-logo";
import type { FotoVitrine } from "@/lib/vitrine";

/**
 * Login do painel.
 *
 * Computador: o formulário à esquerda e, à direita, a mesma cena do topo
 * do site: o menta com as linhas da marca e a logo da CS com os
 * empreendimentos passando por dentro (VitrineLogo, as mesmas fotos que o
 * site escolhe). Celular: a cena vira uma faixa no topo e o formulário
 * fica logo abaixo, no alcance do polegar.
 */
export function TelaLogin({ fotos }: { fotos: FotoVitrine[] }) {
  const busca = useSearchParams();
  const [estado, acao] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [verSenha, setVerSenha] = useState(false);
  const semAcesso = busca.get("erro") === "sem-acesso";

  const entra = (n: number) =>
    ({ "--atraso": `${120 + n * 70}ms` }) as CSSProperties;

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--painel-fundo)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* --------------------------------------------------- formulário */}
      <section className="relative z-10 order-2 -mt-7 flex flex-1 flex-col rounded-t-[1.75rem] bg-[var(--painel-fundo)] px-5 pt-9 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-10 lg:order-1 lg:mt-0 lg:rounded-none lg:px-14 lg:py-12 xl:px-20">
        <div className="hidden lg:block">
          <Logo className="h-12 w-auto" prioridade />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center lg:mx-0 lg:py-16">
          <p className="login-entra olho" style={entra(0)}>
            Painel da CS
          </p>
          <h1
            className="login-entra font-display mt-4 text-[2rem] leading-[1.08] font-medium tracking-[-0.025em] text-[var(--color-verde-950)] sm:text-[2.375rem]"
            style={entra(1)}
          >
            Bom te ver <span className="destaque">por aqui</span>.
          </h1>
          <p
            className="login-entra mt-3 text-[0.9375rem] leading-relaxed text-[var(--fg-tenue)]"
            style={entra(2)}
          >
            Entre com o seu usuário ou e-mail para cuidar das obras, do site e
            dos cadastros.
          </p>

          <form action={acao} className="mt-8 space-y-5">
            <input
              type="hidden"
              name="redirect"
              value={busca.get("redirect") ?? "/admin"}
            />

            <div className="login-entra" style={entra(3)}>
              <Campo rotulo="Usuário ou e-mail">
                <Entrada
                  name="acesso"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  placeholder="carolina"
                />
              </Campo>
            </div>

            <div className="login-entra" style={entra(4)}>
              <Campo rotulo="Senha">
                <div className="relative">
                  <Entrada
                    name="senha"
                    type={verSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    aria-label={
                      verSenha ? "Esconder a senha" : "Mostrar a senha"
                    }
                    aria-pressed={verSenha}
                    className="absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
                  >
                    {verSenha ? (
                      <EyeOff className="h-[1.1rem] w-[1.1rem]" />
                    ) : (
                      <Eye className="h-[1.1rem] w-[1.1rem]" />
                    )}
                  </button>
                </div>
              </Campo>
            </div>

            {semAcesso ? (
              <Aviso tipo="erro">
                A sua conta está suspensa ou não tem acesso ao painel. Fale com
                a administradora.
              </Aviso>
            ) : null}
            {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}

            <div className="login-entra pt-1" style={entra(5)}>
              <Salvar className="w-full">Entrar</Salvar>
            </div>
          </form>

          <p
            className="login-entra mt-6 text-sm leading-relaxed text-[var(--fg-tenue)]"
            style={entra(6)}
          >
            Esqueceu a senha? Peça uma nova a quem administra o painel.
          </p>
        </div>

        <a
          href="/"
          className="mx-auto mt-10 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--fg)] lg:mx-0 lg:-ml-3"
        >
          Ir para o site da CS
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </section>

      {/* ------------------------------------------------------ vitrine */}
      <section
        aria-label="Empreendimentos da CS"
        className="login-cena relative order-1 h-[40svh] min-h-72 shrink-0 overflow-hidden lg:sticky lg:top-0 lg:order-2 lg:m-3 lg:h-[calc(100dvh-1.5rem)] lg:rounded-[2rem]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/topo-fundo.webp"
          srcSet="/site/topo-fundo.webp 1464w, /site/topo-fundo@2x.webp 2928w"
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt=""
          className="login-cena-fundo"
        />

        <div className="absolute inset-x-0 top-0 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:hidden">
          <Logo className="h-10 w-auto" prioridade />
        </div>

        <div
          className="login-vitrine"
          role="img"
          aria-label="Empreendimentos da CS em Santarém"
        >
          <VitrineLogo fotos={fotos} />
        </div>

        <p className="absolute inset-x-0 bottom-0 hidden px-12 pb-12 text-[1.75rem] leading-tight font-light tracking-[-0.05em] text-[#28513f] lg:block xl:text-[2rem]">
          Há <span className="destaque">10 anos</span> construindo{" "}
          <span className="destaque">lares</span> em Santarém
        </p>
      </section>
    </main>
  );
}
