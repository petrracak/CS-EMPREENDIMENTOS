"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ImageUp, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  adicionarImagem,
  atualizarLegendaImagem,
  moverImagem,
  removerImagem,
} from "@/app/actions/empreendimentos";
import { enviarImagem } from "@/app/actions/midia";
import { Cartao, TituloBloco } from "@/components/admin/ui";
import { nomeDeArquivo, prepararImagem } from "@/lib/preparar-imagem";
import { cn } from "@/lib/utils";

type Foto = {
  id: string;
  url: string;
  legenda: string | null;
  categoria: string;
};

/**
 * Galeria e plantas do empreendimento.
 *
 * Aceita várias fotos de uma vez: a CS recebe a pasta do fotógrafo e sobe
 * tudo junto, em vez de repetir o mesmo caminho vinte vezes.
 */
export function GerenciadorImagens({
  empreendimentoId,
  slug,
  imagens,
  categoria,
  titulo,
  apoio,
}: {
  empreendimentoId: string;
  slug: string;
  imagens: Foto[];
  categoria: "galeria" | "planta";
  titulo: string;
  apoio: string;
}) {
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);

  const fotos = imagens.filter((i) => i.categoria === categoria);

  async function aoEscolher(arquivos: FileList) {
    setErro(null);
    setEnviando(arquivos.length);

    for (const arquivo of Array.from(arquivos)) {
      try {
        const pronta = await prepararImagem(arquivo);
        const dados = new FormData();
        dados.append("grande", pronta.grande, "g.webp");
        dados.append("media", pronta.media, "media.webp");
        dados.append("pequena", pronta.pequena, "p.webp");
        dados.append("pasta", `empreendimentos/${slug}`);
        dados.append("nome", nomeDeArquivo(arquivo.name));

        const resposta = await enviarImagem(dados);
        if (resposta.caminho) {
          await adicionarImagem(
            empreendimentoId,
            resposta.caminho,
            categoria,
            null,
          );
        } else if (resposta.erro) {
          setErro(resposta.erro);
        }
      } catch {
        setErro(`Não conseguimos ler "${arquivo.name}".`);
      } finally {
        setEnviando((n) => n - 1);
      }
    }
  }

  const ocupado = enviando > 0;

  return (
    <Cartao className="p-5 sm:p-7">
      <TituloBloco
        apoio={`${apoio} Pode escolher várias de uma vez; cada uma vira WebP antes de subir.`}
        acao={
          fotos.length ? (
            <span className="tabular text-sm text-[var(--fg-tenue)]">
              {fotos.length} {fotos.length === 1 ? "imagem" : "imagens"}
            </span>
          ) : null
        }
      >
        {titulo}
      </TituloBloco>

      <input
        ref={entrada}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files?.length) void aoEscolher(e.target.files);
          e.target.value = "";
        }}
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, i) => (
          <li
            key={foto.id}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--borda)] bg-white"
          >
            <div
              className={cn(
                "group relative aspect-[4/3]",
                categoria === "planta" ? "bg-white" : "bg-[var(--bg-fundo)]",
              )}
            >
              <Image
                src={foto.url}
                alt={foto.legenda ?? ""}
                fill
                sizes="(max-width: 640px) 50vw, 240px"
                className={
                  categoria === "planta" ? "object-contain p-2" : "object-cover"
                }
              />
              <span className="tabular absolute bottom-2 left-2 rounded-full bg-[var(--color-verde-950)]/75 px-2 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur-md">
                {i + 1}º
              </span>
              <button
                type="button"
                aria-label="Remover"
                title="Remover"
                disabled={pendente}
                onClick={() => {
                  if (!confirm("Remover esta imagem da página?")) return;
                  iniciar(() => {
                    void removerImagem(foto.id, empreendimentoId);
                  });
                }}
                className="absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[var(--fg)] shadow-sm backdrop-blur-md transition-[opacity,color] duration-200 hover:text-[var(--color-acento-forte)] focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Legenda (aparece embaixo da imagem no carrossel) e ordem. */}
            <div className="flex flex-1 flex-col gap-2 p-2">
              <input
                defaultValue={foto.legenda ?? ""}
                placeholder="Legenda (opcional)"
                aria-label={`Legenda da imagem ${i + 1}`}
                maxLength={160}
                onKeyDown={(e) => {
                  // Enter aqui salva a legenda, e não o formulário de cima.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                onBlur={(e) => {
                  const nova = e.currentTarget.value;
                  if (nova.trim() === (foto.legenda ?? "").trim()) return;
                  iniciar(() => {
                    void atualizarLegendaImagem(
                      foto.id,
                      empreendimentoId,
                      nova,
                    );
                  });
                }}
                className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--borda)] bg-[var(--bg)] px-2.5 text-base outline-none focus:border-[var(--color-verde-700)] sm:text-[0.8125rem]"
              />
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  aria-label="Passar para antes"
                  title="Passar para antes"
                  disabled={pendente || i === 0}
                  onClick={() =>
                    iniciar(() => {
                      void moverImagem(foto.id, empreendimentoId, -1);
                    })
                  }
                  className="grid h-10 w-10 place-items-center rounded-lg text-[var(--fg-suave)] transition-colors hover:bg-[var(--bg-fundo)] disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-[var(--fg-tenue)]">Ordem</span>
                <button
                  type="button"
                  aria-label="Passar para depois"
                  title="Passar para depois"
                  disabled={pendente || i === fotos.length - 1}
                  onClick={() =>
                    iniciar(() => {
                      void moverImagem(foto.id, empreendimentoId, 1);
                    })
                  }
                  className="grid h-10 w-10 place-items-center rounded-lg text-[var(--fg-suave)] transition-colors hover:bg-[var(--bg-fundo)] disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={ocupado}
            className="group flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--borda-forte)] text-sm text-[var(--fg-suave)] transition-colors duration-300 hover:border-[var(--color-verde-700)] hover:bg-[var(--bg)] disabled:opacity-60"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-verde-900)] text-[var(--color-ouro-300)]">
              {ocupado ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageUp className="h-4 w-4" />
              )}
            </span>
            {ocupado ? `Enviando ${enviando}…` : "Adicionar imagens"}
          </button>
        </li>
      </ul>

      {erro ? (
        <p
          role="alert"
          className="mt-3 text-xs font-medium text-[var(--color-acento-forte)]"
        >
          {erro}
        </p>
      ) : null}
    </Cartao>
  );
}
