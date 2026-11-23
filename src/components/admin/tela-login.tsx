"use client";

import { ArrowUpRight, Eye, EyeOff, MapPin } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, type CSSProperties } from "react";

import { entrar, type EstadoLogin } from "@/app/actions/auth";
import { Aviso, Campo, Entrada, Salvar } from "@/components/admin/ui";
import { Logo, Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export type Slide = { nome: string; local: string; imagem: string; situacao: string };

const TEMPO = 6500;

/**
 * Login do painel.
 *
 * Computador: o formulário à esquerda, as obras da CS passando à direita.
 * Celular: as fotos viram uma faixa no topo, com a logo branca por cima,
 * e o formulário logo abaixo, no alcance do polegar.
 *
 * As fotos trocam por opacidade, com um zoom lento na que está à vista;
 * a barrinha de cada uma marca o tempo. Com "reduzir movimento", fica só
 * a troca, sem zoom.
 */
export function TelaLogin({ slides }: { slides: Slide[] }) {
  const busca = useSearchParams();
  const [estado, acao] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [verSenha, setVerSenha] = useState(false);
  const [atual, setAtual] = useState(0);
  const semAcesso = busca.get("erro") === "sem-acesso";

  useEffect(() => {
    if (slides.length < 2) return;
    const relogio = window.setInterval(() => {
      // Aba escondida não gasta troca: volta de onde parou.
      if (!document.hidden) setAtual((i) => (i + 1) % slides.length);
    }, TEMPO);
    return () => window.clearInterval(relogio);
  }, [slides.length]);

  const entra = (n: number) => ({ "--atraso": `${120 + n * 70}ms` }) as CSSProperties;

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
            Entre com o seu usuário ou e-mail para cuidar das obras, do site e dos cadastros.
          </p>

          <form action={acao} className="mt-8 space-y-5">
            <input type="hidden" name="redirect" value={busca.get("redirect") ?? "/admin"} />

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
                    aria-label={verSenha ? "Esconder a senha" : "Mostrar a senha"}
                    aria-pressed={verSenha}
                    className="absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]"
                  >
                    {verSenha ? <EyeOff className="h-[1.1rem] w-[1.1rem]" /> : <Eye className="h-[1.1rem] w-[1.1rem]" />}
                  </button>
                </div>
              </Campo>
            </div>

            {semAcesso ? (
              <Aviso tipo="erro">
                A sua conta está suspensa ou não tem acesso ao painel. Fale com a administradora.
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
        className="relative order-1 h-[42svh] min-h-72 shrink-0 overflow-hidden bg-[var(--color-verde-950)] text-white lg:sticky lg:top-0 lg:order-2 lg:m-3 lg:h-[calc(100dvh-1.5rem)] lg:rounded-[2rem]"
      >
        {slides.length ? (
          slides.map((slide, i) => (
            <div
              key={slide.imagem}
              aria-hidden={i !== atual}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
                i === atual ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                // A chave muda a cada volta: o zoom recomeça junto com a foto.
                key={i === atual ? `on-${atual}` : "off"}
                src={slide.imagem}
                alt=""
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={cn("object-cover", i === atual && "login-zoom")}
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-verde-800)] via-[var(--color-verde-900)] to-[var(--color-verde-950)]">
            <Simbolo className="absolute -right-16 -bottom-20 h-[28rem] w-auto text-white/[0.05]" />
          </div>
        )}

        {/* Leitura: escurece o pé e o topo, onde há texto. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/90 via-[var(--color-verde-950)]/20 via-55% to-[var(--color-verde-950)]/35" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:hidden">
          <Logo variante="branca" className="h-11 w-auto" prioridade />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-10 lg:px-12 lg:pb-12">
          {slides.length ? (
            <div key={atual} className="login-legenda">
              <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-[var(--color-ouro-300)] uppercase">
                {slides[atual].situacao}
              </p>
              <p className="font-display mt-2 text-2xl leading-tight font-medium tracking-[-0.02em] sm:text-3xl lg:text-[2.5rem]">
                {slides[atual].nome}
              </p>
              {slides[atual].local ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {slides[atual].local}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="font-display max-w-md text-2xl leading-snug font-medium lg:text-3xl">
              Construímos casas e apartamentos em{" "}
              <span className="destaque-ouro">Santarém</span> desde 2016.
            </p>
          )}

          {slides.length > 1 ? (
            <div className="mt-6 flex gap-1.5" role="tablist" aria-label="Escolher foto">
              {slides.map((slide, i) => (
                <button
                  key={slide.imagem}
                  type="button"
                  role="tab"
                  aria-selected={i === atual}
                  aria-label={slide.nome}
                  onClick={() => setAtual(i)}
                  // Alvo de toque alto, barra fina dentro dele.
                  className="group flex h-6 flex-1 items-center"
                >
                  <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                    {i === atual ? (
                      <span
                        key={atual}
                        className="login-barra absolute inset-0 origin-left rounded-full bg-[var(--color-ouro-300)]"
                        style={{ animationDuration: `${TEMPO}ms` }}
                      />
                    ) : i < atual ? (
                      <span className="absolute inset-0 rounded-full bg-white/60" />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
