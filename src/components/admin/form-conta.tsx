"use client";

import { useActionState } from "react";

import {
  salvarNome,
  trocarSenha,
  type EstadoConta,
} from "@/app/actions/conta";
import {
  Aviso,
  Campo,
  Cartao,
  Entrada,
  Salvar,
  TituloBloco,
} from "@/components/admin/ui";

export function FormConta({ nome }: { nome: string }) {
  const [estadoNome, acaoNome] = useActionState<EstadoConta, FormData>(
    salvarNome,
    {},
  );
  const [estadoSenha, acaoSenha] = useActionState<EstadoConta, FormData>(
    trocarSenha,
    {},
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Cartao className="p-6">
        <form action={acaoNome}>
          <TituloBloco apoio="É o nome que aparece no canto do painel.">
            Seu nome
          </TituloBloco>
          <Campo rotulo="Nome">
            <Entrada name="nome" defaultValue={nome} required />
          </Campo>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Salvar />
            {estadoNome.ok ? <Aviso tipo="ok">{estadoNome.ok}</Aviso> : null}
            {estadoNome.erro ? (
              <Aviso tipo="erro">{estadoNome.erro}</Aviso>
            ) : null}
          </div>
        </form>
      </Cartao>

      <Cartao className="p-6">
        <form action={acaoSenha}>
          <TituloBloco apoio="Pelo menos 10 caracteres. Use uma frase que só você saiba.">
            Trocar a senha
          </TituloBloco>
          <div className="space-y-4">
            <Campo rotulo="Nova senha">
              <Entrada
                name="senha"
                type="password"
                autoComplete="new-password"
                required
              />
            </Campo>
            <Campo rotulo="Repita a nova senha">
              <Entrada
                name="repetida"
                type="password"
                autoComplete="new-password"
                required
              />
            </Campo>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Salvar>Trocar senha</Salvar>
            {estadoSenha.ok ? <Aviso tipo="ok">{estadoSenha.ok}</Aviso> : null}
            {estadoSenha.erro ? (
              <Aviso tipo="erro">{estadoSenha.erro}</Aviso>
            ) : null}
          </div>
        </form>
      </Cartao>
    </div>
  );
}
