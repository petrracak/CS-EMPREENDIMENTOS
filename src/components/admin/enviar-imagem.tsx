"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ImageUp,
  Loader2,
  Monitor,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import { enviarImagem } from "@/app/actions/midia";
import { nomeDeArquivo, prepararImagem } from "@/lib/preparar-imagem";
import { cn } from "@/lib/utils";

/**
 * Campo de imagem do painel.
 *
 * Mostra na própria tela a medida recomendada e, quando o lugar aparece em
 * duas proporções (o banner da página inicial é o caso), um visualizador
 * que alterna entre computador e celular.
 *
 * O visualizador existe por um motivo prático: no celular a foto é cortada
 * nas laterais e o título fica por cima. Sem ver isso antes de publicar, a
 * CS descobre pelo cliente que o texto caiu em cima do rosto de alguém.
 */
export function EnviarImagem({
  nome,
  valor,
  pasta,
  rotulo,
  apoio,
  larguraIdeal,
  alturaIdeal,
  proporcaoMobile,
  tituloSobreposto,
}: {
  nome: string;
  valor: string | null;
  pasta: string;
  rotulo: string;
  apoio?: string;
  larguraIdeal?: number;
  alturaIdeal?: number;
  /** Quando existe, o visualizador ganha o botão de celular. */
  proporcaoMobile?: string;
  /** Texto que o site escreve por cima, para conferir a área segura. */
  tituloSobreposto?: string;
}) {
  const [caminho, setCaminho] = useState<string | null>(valor);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vista, setVista] = useState<"desktop" | "mobile">("desktop");
  const entrada = useRef<HTMLInputElement>(null);

  async function aoEscolher(arquivo: File) {
    setErro(null);
    setAviso(null);
    setEnviando(true);
    try {
      const pronta = await prepararImagem(arquivo);

      // Avisa, mas não impede: às vezes a única foto que existe é essa.
      if (larguraIdeal && pronta.largura < larguraIdeal * 0.8) {
        setAviso(
          `Esta imagem tem ${pronta.largura} px de largura. O recomendado é ${larguraIdeal} px — ela pode aparecer borrada em telas grandes.`,
        );
      }

      const dados = new FormData();
      dados.append("grande", pronta.grande, "grande.webp");
      dados.append("pequena", pronta.pequena, "pequena.webp");
      dados.append("pasta", pasta);
      dados.append("nome", nomeDeArquivo(arquivo.name));

      const resposta = await enviarImagem(dados);
      if (resposta.erro) setErro(resposta.erro);
      else if (resposta.caminho) setCaminho(resposta.caminho);
    } catch {
      setErro("Não conseguimos ler esta imagem. Tente um JPG ou PNG.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={nome} value={caminho ?? ""} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[var(--fg)]">{rotulo}</span>
        {larguraIdeal && alturaIdeal ? (
          <span className="tabular text-xs text-[var(--fg-tenue)]">
            Computador: {larguraIdeal} × {alturaIdeal} px
            {proporcaoMobile ? ` · Celular: ${proporcaoMobile}` : ""}
          </span>
        ) : null}
      </div>
      {apoio ? (
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--fg-tenue)]">
          {apoio}
        </p>
      ) : null}

      {/* ------------------------------------------------- visualizador */}
      <div className="mt-3 rounded-xl border border-[var(--borda)] bg-[var(--bg-fundo)] p-3">
        {proporcaoMobile ? (
          <div className="mb-3 flex gap-1">
            {[
              { id: "desktop" as const, Icone: Monitor, rotulo: "Computador" },
              { id: "mobile" as const, Icone: Smartphone, rotulo: "Celular" },
            ].map(({ id, Icone, rotulo: r }) => (
              <button
                key={id}
                type="button"
                onClick={() => setVista(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  vista === id
                    ? "bg-[var(--bg-elevado)] text-[var(--fg)] shadow-[var(--sombra-card)]"
                    : "text-[var(--fg-tenue)] hover:text-[var(--fg)]",
                )}
              >
                <Icone className="h-3.5 w-3.5" />
                {r}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "relative mx-auto overflow-hidden rounded-lg bg-[var(--color-verde-900)]",
            vista === "mobile" && proporcaoMobile
              ? "aspect-[9/16] max-w-[220px]"
              : "aspect-[16/9] w-full",
          )}
        >
          {caminho ? (
            <Image
              src={caminho}
              alt=""
              fill
              sizes="600px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <ImageUp className="h-8 w-8 text-white/20" />
            </div>
          )}

          {/* A área segura: onde o site escreve por cima da foto. */}
          {caminho && tituloSobreposto ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/90 via-transparent to-transparent" />
              <p
                className={cn(
                  "font-display absolute right-4 bottom-4 left-4 font-medium text-white",
                  vista === "mobile" ? "text-sm" : "text-xl",
                )}
              >
                {tituloSobreposto}
              </p>
            </>
          ) : null}
        </div>
      </div>

      {/* ------------------------------------------------------- ações */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) void aoEscolher(arquivo);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--borda-forte)] px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)] disabled:opacity-50"
        >
          {enviando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageUp className="h-4 w-4" />
          )}
          {enviando ? "Enviando…" : caminho ? "Trocar imagem" : "Escolher imagem"}
        </button>

        {caminho ? (
          <button
            type="button"
            onClick={() => setCaminho(null)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--color-acento-forte)]"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </button>
        ) : null}
      </div>

      {aviso ? (
        <p className="mt-2.5 flex gap-2 text-xs leading-relaxed text-[var(--color-ouro-700)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {aviso}
        </p>
      ) : null}
      {erro ? (
        <p className="mt-2.5 text-xs text-[var(--color-acento-forte)]">{erro}</p>
      ) : null}
    </div>
  );
}
