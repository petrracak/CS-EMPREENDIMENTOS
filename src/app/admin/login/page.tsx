"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { entrar, type EstadoLogin } from "@/app/actions/auth";
import { Aviso, Campo, Entrada, Salvar } from "@/components/admin/ui";
import { Logo } from "@/components/site/logo";

export default function PaginaLogin() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}

function Formulario() {
  const busca = useSearchParams();
  const [estado, acao] = useActionState<EstadoLogin, FormData>(entrar, {});
  const semAcesso = busca.get("erro") === "sem-acesso";

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* ----------------------------------------------------- formulário */}
      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Logo className="h-11 w-auto" />

          <h1 className="font-display mt-10 text-2xl font-medium">
            Painel da CS
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-tenue)]">
            Entre para editar os empreendimentos, o blog e o conteúdo do
            site.
          </p>

          <form action={acao} className="mt-8 space-y-5">
            <input
              type="hidden"
              name="redirect"
              value={busca.get("redirect") ?? "/admin"}
            />

            <Campo rotulo="E-mail">
              <Entrada
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="voce@csstm.com.br"
              />
            </Campo>

            <Campo rotulo="Senha">
              <Entrada
                name="senha"
                type="password"
                autoComplete="current-password"
                required
              />
            </Campo>

            {semAcesso ? (
              <Aviso tipo="erro">
                A sua conta não tem acesso ao painel. Fale com o
                administrador.
              </Aviso>
            ) : null}
            {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}

            <Salvar className="w-full">Entrar</Salvar>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------------- vitrine */}
      {/* O lado direito é só a marca: no celular ele some, e o formulário
          ocupa a tela inteira. */}
      <div className="relative hidden overflow-hidden bg-[var(--bg-tinta)] lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-verde-800)] via-[var(--color-verde-900)] to-[var(--color-verde-950)]" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <Logo variante="branca" className="h-12 w-auto" />
          <p className="font-display mt-7 max-w-md text-2xl leading-snug font-medium text-white">
            Construímos casas e apartamentos em{" "}
            <span className="destaque-ouro">Santarém</span> desde 2016.
          </p>
        </div>
      </div>
    </main>
  );
}
