"use client";

import Image from "next/image";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  adicionarImagem,
  removerImagem,
} from "@/app/actions/empreendimentos";
import { enviarImagem } from "@/app/actions/midia";
import { Cartao, TituloBloco } from "@/components/admin/ui";
import { nomeDeArquivo, prepararImagem } from "@/lib/preparar-imagem";

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

  return (
    <Cartao className="p-6">
      <TituloBloco apoio={apoio}>{titulo}</TituloBloco>

      {fotos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--bg-fundo)]"
            >
              <Image
                src={foto.url}
                alt={foto.legenda ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="Remover foto"
                disabled={pendente}
                onClick={() =>
                  iniciar(() => {
                    void removerImagem(foto.id, empreendimentoId);
                  })
                }
                className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--fg-tenue)]">
          Nenhuma imagem ainda.
        </p>
      )}

      <input
        ref={entrada}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) void aoEscolher(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={enviando > 0}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--borda-forte)] px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)] disabled:opacity-50"
      >
        {enviando > 0 ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageUp className="h-4 w-4" />
        )}
        {enviando > 0
          ? `Enviando ${enviando}…`
          : "Adicionar imagens"}
      </button>

      {erro ? (
        <p className="mt-2.5 text-xs text-[var(--color-acento-forte)]">
          {erro}
        </p>
      ) : null}
    </Cartao>
  );
}
