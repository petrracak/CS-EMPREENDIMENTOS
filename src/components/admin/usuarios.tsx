"use client";

import {
  Check,
  Copy,
  Crown,
  KeyRound,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import {
  alterarSituacao,
  criarUsuario,
  definirSenha,
  mudarNivel,
  removerUsuario,
  type EstadoNovoUsuario,
  type Resposta,
} from "@/app/actions/usuarios";
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Etiqueta,
  Salvar,
  Selecao,
} from "@/components/admin/ui";
import { usuarioDe } from "@/lib/equipe";
import { NIVEIS, ORDEM_NIVEIS, type Nivel } from "@/lib/permissoes";
import { cn } from "@/lib/utils";

export type Usuario = {
  id: string;
  nome: string;
  usuario: string | null;
  email: string | null;
  role: Nivel;
  ativo: boolean;
  principal: boolean;
  ultimoAcesso: string | null;
};

/* ------------------------------------------------------------ senha */

/** Senha fácil de ditar: sem 0/O nem 1/l, em três blocos. */
function gerarSenha() {
  const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  const s = Array.from(bytes, (n) => letras[n % letras.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

function BotaoCopiar({ texto, rotulo = "Copiar" }: { texto: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        } catch {
          /* sem permissão de área de transferência: a pessoa copia à mão */
        }
      }}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--color-verde-800)] transition-colors hover:bg-[var(--bg-fundo)]"
    >
      {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copiado ? "Copiado" : rotulo}
    </button>
  );
}

/* -------------------------------------------------------- novo usuário */

export function NovoUsuario() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao] = useActionState<EstadoNovoUsuario, FormData>(criarUsuario, {
    ok: false,
  });
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [usuarioMexido, setUsuarioMexido] = useState(false);
  const [senha, setSenha] = useState("");
  const [nivel, setNivel] = useState<Nivel>("editor");
  const [recibo, setRecibo] = useState<
    (NonNullable<EstadoNovoUsuario["criado"]> & { senha: string }) | null
  >(null);
  const formulario = useRef<HTMLFormElement>(null);

  // Criou: guarda o acesso para mostrar no recibo e limpa o formulário.
  useEffect(() => {
    if (!estado.ok || !estado.criado) return;
    setRecibo({ ...estado.criado, senha });
    setNome("");
    setUsuario("");
    setUsuarioMexido(false);
    setSenha("");
    setNivel("editor");
    formulario.current?.reset();
    // só reage ao resultado do envio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const erro = (campo: string) =>
    estado.erros?.[campo] ? (
      <p className="mt-1.5 text-sm text-[var(--color-acento-forte)]">{estado.erros[campo]}</p>
    ) : null;

  if (!aberto) {
    return (
      <Botao type="button" onClick={() => setAberto(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Adicionar usuário
      </Botao>
    );
  }

  return (
    <Cartao className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--borda)] px-5 py-4 sm:px-7">
        <h2 className="font-display text-lg font-medium tracking-[-0.01em]">Novo usuário</h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => {
            setAberto(false);
            setRecibo(null);
          }}
          className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--bg-fundo)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {recibo ? (
        <div className="space-y-4 px-5 py-6 sm:px-7">
          <Aviso tipo="ok">
            Conta de {recibo.nome} criada. Passe os dados abaixo para a pessoa
            e peça para ela trocar a senha em Minha conta.
          </Aviso>
          <dl className="grid gap-3 rounded-2xl border border-[var(--borda)] bg-[var(--bg)] p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--fg-tenue)]">Entrar com</dt>
              <dd className="mt-0.5 text-base font-medium">
                {recibo.usuario}
                {recibo.email ? (
                  <span className="block text-sm font-normal text-[var(--fg-tenue)]">
                    ou {recibo.email}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--fg-tenue)]">Senha</dt>
              <dd className="tabular mt-0.5 font-mono text-base font-medium">{recibo.senha}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <BotaoCopiar
              rotulo="Copiar acesso"
              texto={`Painel da CS: ${location.origin}/admin\nUsuário: ${recibo.usuario}\nSenha: ${recibo.senha}`}
            />
            <Botao
              type="button"
              tom="neutro"
              onClick={() => setRecibo(null)}
            >
              Criar outro
            </Botao>
          </div>
        </div>
      ) : (
        <form ref={formulario} action={acao} className="space-y-5 px-5 py-6 sm:px-7">
          {estado.mensagem ? <Aviso tipo="erro">{estado.mensagem}</Aviso> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Nome completo">
              <Entrada
                name="nome"
                required
                value={nome}
                autoComplete="off"
                onChange={(e) => {
                  setNome(e.target.value);
                  if (!usuarioMexido) setUsuario(usuarioDe(e.target.value));
                }}
                placeholder="Maria Souza"
              />
            </Campo>
            <div>
              <Campo
                rotulo="Usuário"
                apoio="É o que a pessoa digita para entrar. Sai do nome, mas dá para trocar."
              >
                <Entrada
                  name="usuario"
                  required
                  value={usuario}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => {
                    setUsuarioMexido(true);
                    setUsuario(e.target.value.toLowerCase().replace(/\s+/g, "."));
                  }}
                  placeholder="maria.souza"
                />
              </Campo>
              {erro("usuario")}
            </div>
          </div>
          {erro("nome")}

          <div>
            <Campo
              rotulo="E-mail (opcional)"
              apoio="Com e-mail, a pessoa entra pelo usuário ou pelo e-mail. Sem e-mail, só pelo usuário."
            >
              <Entrada
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoComplete="off"
                placeholder="maria@csstm.com.br"
              />
            </Campo>
            {erro("email")}
          </div>

          <fieldset>
            <legend className="text-[0.8125rem] font-medium">Nível de acesso</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {ORDEM_NIVEIS.map((n) => (
                <label
                  key={n}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200",
                    nivel === n
                      ? "border-[var(--color-verde-700)] bg-[var(--color-verde-50)] shadow-[0_0_0_3px_rgb(0_69_39/0.08)]"
                      : "border-[var(--borda)] hover:border-[var(--borda-forte)]",
                  )}
                >
                  <input
                    type="radio"
                    name="nivel"
                    value={n}
                    checked={nivel === n}
                    onChange={() => setNivel(n)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {NIVEIS[n].rotulo}
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                        nivel === n
                          ? "border-[var(--color-verde-800)] bg-[var(--color-verde-800)] text-white"
                          : "border-[var(--borda-forte)]",
                      )}
                    >
                      {nivel === n ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                  </span>
                  <span className="text-xs leading-relaxed text-[var(--fg-tenue)]">
                    {NIVEIS[n].resumo}
                  </span>
                </label>
              ))}
            </div>
            {erro("nivel")}
          </fieldset>

          <div>
            <Campo rotulo="Senha inicial" apoio="Pelo menos 10 caracteres. A pessoa troca depois, em Minha conta.">
              <div className="flex gap-2">
                <Entrada
                  name="senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="font-mono"
                />
                <Botao type="button" tom="neutro" onClick={() => setSenha(gerarSenha())}>
                  <RefreshCw className="h-4 w-4" />
                  Gerar
                </Botao>
              </div>
            </Campo>
            {erro("senha")}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[var(--borda)] pt-5">
            <Salvar>Criar usuário</Salvar>
          </div>
        </form>
      )}
    </Cartao>
  );
}

/* ---------------------------------------------------------------- lista */

function quando(iso: string | null) {
  if (!iso) return "Nunca entrou";
  const data = new Date(iso);
  return `Último acesso ${new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santarem",
  }).format(data)}`;
}

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

export function LinhaUsuario({ u, eu }: { u: Usuario; eu: boolean }) {
  const [pendente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<Resposta | null>(null);
  const [modo, setModo] = useState<"nada" | "senha" | "remover">("nada");
  const [senha, setSenha] = useState("");
  const editavel = !eu && !u.principal;

  const rodar = (fn: () => Promise<Resposta>, depois?: () => void) =>
    iniciar(async () => {
      const r = await fn();
      setAviso(r);
      if (r.ok) depois?.();
    });

  return (
    <li
      className={cn(
        "rounded-[1.25rem] border border-[var(--borda)] bg-[var(--bg-elevado)] p-4 shadow-[var(--sombra-painel)] sm:p-5",
        !u.ativo && "bg-[var(--bg)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span
          aria-hidden
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-medium",
            u.principal
              ? "bg-[var(--color-verde-950)] text-[var(--color-ouro-300)]"
              : "bg-[var(--bg-fundo)] text-[var(--color-verde-800)]",
            !u.ativo && "opacity-50",
          )}
        >
          {iniciais(u.nome)}
        </span>

        <div className="min-w-0 flex-1 basis-48">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("font-medium", !u.ativo && "text-[var(--fg-tenue)]")}>{u.nome}</span>
            {u.principal ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-verde-950)] px-2.5 py-1 text-xs font-medium text-[var(--color-ouro-300)]">
                <Crown className="h-3 w-3" />
                Conta principal
              </span>
            ) : null}
            {eu ? <Etiqueta tom="verde">Você</Etiqueta> : null}
            {!u.ativo ? <Etiqueta tom="ouro">Suspenso</Etiqueta> : null}
          </p>
          <p className="mt-0.5 truncate text-sm text-[var(--fg-tenue)]">
            {[u.usuario, u.email].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--fg-tenue)]">{quando(u.ultimoAcesso)}</p>
        </div>

        <div className="w-full sm:w-52">
          {editavel ? (
            <Selecao
              aria-label={`Nível de acesso de ${u.nome}`}
              defaultValue={u.role}
              disabled={pendente}
              onChange={(e) => rodar(() => mudarNivel(u.id, e.target.value))}
            >
              {ORDEM_NIVEIS.map((n) => (
                <option key={n} value={n}>
                  {NIVEIS[n].rotulo}
                </option>
              ))}
            </Selecao>
          ) : (
            <p className="flex min-h-11 items-center rounded-xl bg-[var(--bg-fundo)] px-3.5 text-sm font-medium">
              {NIVEIS[u.role].rotulo}
            </p>
          )}
        </div>
      </div>

      {editavel ? (
        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-[var(--borda)] pt-3">
          <Botao
            type="button"
            tom="suave"
            disabled={pendente}
            onClick={() => {
              setModo(modo === "senha" ? "nada" : "senha");
              setSenha(gerarSenha());
              setAviso(null);
            }}
          >
            <KeyRound className="h-4 w-4" />
            Nova senha
          </Botao>
          <Botao
            type="button"
            tom="suave"
            disabled={pendente}
            onClick={() => rodar(() => alterarSituacao(u.id, !u.ativo))}
          >
            {u.ativo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {u.ativo ? "Suspender" : "Reativar"}
          </Botao>
          <Botao
            type="button"
            tom="suave"
            disabled={pendente}
            onClick={() => {
              setModo(modo === "remover" ? "nada" : "remover");
              setAviso(null);
            }}
            className="text-[var(--color-acento-forte)] hover:text-[var(--color-acento-forte)]"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Botao>
          {pendente ? <Loader2 className="ml-1 h-4 w-4 animate-spin text-[var(--fg-tenue)]" /> : null}
        </div>
      ) : u.principal && !eu ? (
        <p className="mt-3 text-xs leading-relaxed text-[var(--fg-tenue)]">
          A conta principal não pode ser rebaixada, suspensa nem removida.
        </p>
      ) : null}

      {modo === "senha" ? (
        <div className="mt-3 rounded-2xl bg-[var(--bg)] p-4">
          <p className="text-sm">
            Defina a senha nova e passe para {u.nome.split(" ")[0]}. A atual deixa de valer.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Entrada
              aria-label="Senha nova"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="font-mono"
            />
            <Botao
              type="button"
              disabled={pendente}
              onClick={() => rodar(() => definirSenha(u.id, senha), () => setModo("nada"))}
            >
              Salvar senha
            </Botao>
            <BotaoCopiar texto={senha} />
          </div>
        </div>
      ) : null}

      {modo === "remover" ? (
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[var(--color-acento-forte)]/30 bg-[var(--color-acento)]/10 p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm leading-relaxed">
            Remover {u.nome} apaga a conta de vez. O que a pessoa publicou continua no
            site. Se for só uma pausa, prefira suspender.
          </p>
          <div className="flex gap-2">
            <Botao type="button" tom="neutro" onClick={() => setModo("nada")}>
              Cancelar
            </Botao>
            <Botao
              type="button"
              tom="perigo"
              disabled={pendente}
              onClick={() => rodar(() => removerUsuario(u.id))}
            >
              Remover de vez
            </Botao>
          </div>
        </div>
      ) : null}

      {aviso?.mensagem ? (
        <div className="mt-3">
          <Aviso tipo={aviso.ok ? "ok" : "erro"}>{aviso.mensagem}</Aviso>
        </div>
      ) : null}
    </li>
  );
}
