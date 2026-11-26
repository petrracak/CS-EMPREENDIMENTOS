"use client";

import { Film, Link2, Loader2, Play, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  adicionarVideo,
  autorizarEnvioDeVideo,
  removerVideo,
} from "@/app/actions/empreendimentos";
import { enviarImagem } from "@/app/actions/midia";
import { classeBotao } from "@/components/admin/estilos";
import { Cartao, Entrada, TituloBloco } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import { nomeDeArquivo, prepararImagem } from "@/lib/preparar-imagem";
import {
  NOME_DO_SERVICO,
  VIDEO_MAXIMO_MB,
  lerLink,
  prepararVideo,
  type Video,
} from "@/lib/videos";

/**
 * Vídeos do empreendimento, de dois jeitos:
 *
 * - Link do YouTube, Instagram, TikTok ou Vimeo: não ocupa nada do
 *   Supabase. É o caminho recomendado.
 * - Arquivo: vai direto do navegador para o Storage (com autorização de
 *   uso único dada pelo servidor), até 45 MB. A capa sai de um quadro do
 *   próprio vídeo, gerada aqui no navegador.
 */
export function GerenciadorVideos({
  empreendimentoId,
  slug,
  videos,
}: {
  empreendimentoId: string;
  slug: string;
  videos: (Video & { ordem: number })[];
}) {
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const arquivo = useRef<HTMLInputElement>(null);

  const reconhecido = link.trim() ? lerLink(link) : null;

  function adicionarLink() {
    setErro(null);
    iniciar(async () => {
      const r = await adicionarVideo(empreendimentoId, {
        tipo: "link",
        url: link,
        titulo,
      });
      if (r.erro) setErro(r.erro);
      else {
        setLink("");
        setTitulo("");
      }
    });
  }

  async function enviarArquivo(escolhido: File) {
    setErro(null);
    try {
      setEtapa("Preparando o envio…");
      const autorizacao = await autorizarEnvioDeVideo(
        slug,
        escolhido.name,
        escolhido.size,
        escolhido.type,
      );
      if (autorizacao.erro || !autorizacao.caminho || !autorizacao.token) {
        setErro(autorizacao.erro ?? "Não conseguimos preparar o envio.");
        return;
      }

      setEtapa(`Enviando ${Math.round(escolhido.size / 1024 / 1024)} MB…`);
      const { error } = await createClient()
        .storage.from("midia")
        .uploadToSignedUrl(autorizacao.caminho, autorizacao.token, escolhido, {
          contentType: escolhido.type,
          cacheControl: "31536000",
        });
      if (error) {
        setErro("O envio do vídeo falhou. Confira a internet e tente de novo.");
        return;
      }

      setEtapa("Gerando a capa…");
      const capa = await gerarCapa(escolhido).catch(() => null);
      let caminhoCapa: string | null = null;
      if (capa) {
        const pronta = await prepararImagem(
          new File([capa], "capa.webp", { type: "image/webp" }),
          {
            limite: 1280,
          },
        );
        const dados = new FormData();
        dados.append("grande", pronta.grande, "g.webp");
        dados.append("media", pronta.media, "media.webp");
        dados.append("pequena", pronta.pequena, "p.webp");
        dados.append("pasta", `empreendimentos/${slug}/videos`);
        dados.append("nome", nomeDeArquivo(`capa-${escolhido.name}`));
        caminhoCapa = (await enviarImagem(dados)).caminho ?? null;
      }

      setEtapa("Salvando…");
      const r = await adicionarVideo(empreendimentoId, {
        tipo: "arquivo",
        url: autorizacao.caminho,
        capa: caminhoCapa,
        titulo,
      });
      if (r.erro) setErro(r.erro);
      else setTitulo("");
    } finally {
      setEtapa(null);
    }
  }

  const ocupado = pendente || etapa !== null;

  return (
    <Cartao className="p-5 sm:p-7">
      <TituloBloco
        apoio="Aparecem na página do empreendimento, depois das fotos. O player só carrega quando a pessoa toca no vídeo, então a página continua leve."
        acao={
          videos.length ? (
            <span className="tabular text-sm text-[var(--fg-tenue)]">
              {videos.length} {videos.length === 1 ? "vídeo" : "vídeos"}
            </span>
          ) : null
        }
      >
        Vídeos
      </TituloBloco>

      {/* ------------------------------------------------- por link */}
      <div className="grid gap-3 lg:grid-cols-[1fr_16rem_auto] lg:items-end">
        <label className="block">
          <span className="text-[0.8125rem] font-medium">
            Link do vídeo (recomendado)
          </span>
          <Entrada
            value={link}
            onChange={(e) => setLink(e.target.value)}
            // Dentro do formulário do empreendimento: Enter adiciona o
            // vídeo, e não salva o formulário inteiro.
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              if (reconhecido && !ocupado) adicionarLink();
            }}
            placeholder="Cole o link do YouTube, Instagram, TikTok ou Vimeo"
            inputMode="url"
            className="mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-[0.8125rem] font-medium">
            Título (opcional)
          </span>
          <Entrada
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="Tour pelo decorado"
            className="mt-1.5"
          />
        </label>
        <button
          type="button"
          onClick={adicionarLink}
          disabled={!reconhecido || ocupado}
          className={classeBotao("principal")}
        >
          {pendente ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          Adicionar link
        </button>
      </div>
      {link.trim() ? (
        <p className="mt-2 text-xs text-[var(--fg-tenue)]">
          {reconhecido
            ? `Vídeo do ${NOME_DO_SERVICO[reconhecido.tipo]} reconhecido.`
            : "Ainda não reconhecemos esse link. Copie o endereço do vídeo, não do perfil."}
        </p>
      ) : null}

      {/* ----------------------------------------------- por arquivo */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[var(--borda-forte)] p-4">
        <button
          type="button"
          onClick={() => arquivo.current?.click()}
          disabled={ocupado}
          className={classeBotao("neutro")}
        >
          {etapa ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {etapa ?? "Enviar arquivo de vídeo"}
        </button>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--fg-tenue)]">
          MP4 de até {VIDEO_MAXIMO_MB} MB. O plano gratuito do Supabase tem 1 GB
          de espaço e 5 GB de tráfego por mês, e cada vez que alguém assiste o
          vídeo conta no tráfego. Para vídeos longos ou muito vistos, prefira o
          YouTube.
        </p>
        <input
          ref={arquivo}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void enviarArquivo(f);
          }}
        />
      </div>

      {erro ? (
        <p
          role="alert"
          className="mt-3 text-sm text-[var(--color-acento-forte)]"
        >
          {erro}
        </p>
      ) : null}

      {/* ---------------------------------------------------- lista */}
      {videos.length ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const pronto = prepararVideo(v);
            return (
              <li
                key={v.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--borda)] bg-[var(--bg)]"
              >
                <div className="relative grid aspect-video place-items-center bg-[#01331d]">
                  {pronto?.miniatura ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pronto.miniatura}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#004527]">
                    {v.tipo === "arquivo" && !pronto?.miniatura ? (
                      <Film className="h-5 w-5" />
                    ) : (
                      <Play className="ml-0.5 h-5 w-5" />
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {v.titulo || NOME_DO_SERVICO[v.tipo]}
                    </p>
                    <p className="text-xs text-[var(--fg-tenue)]">
                      {v.tipo === "arquivo"
                        ? "Arquivo enviado"
                        : NOME_DO_SERVICO[v.tipo]}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Remover vídeo"
                    title="Remover"
                    disabled={pendente}
                    onClick={() => {
                      if (!confirm("Remover este vídeo da página?")) return;
                      iniciar(async () => {
                        await removerVideo(v.id, empreendimentoId);
                      });
                    }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--color-acento)]/10 hover:text-[var(--color-acento-forte)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Cartao>
  );
}

/** Um quadro do vídeo (a 1 s, ou no meio se for curto), em WebP. */
function gerarCapa(arquivo: File): Promise<Blob> {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    const desistir = window.setTimeout(
      () => rejeitar(new Error("tempo")),
      15000,
    );
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    };
    video.onseeked = () => {
      const escala = Math.min(
        1,
        1280 / Math.max(video.videoWidth, video.videoHeight),
      );
      const tela = document.createElement("canvas");
      tela.width = Math.round(video.videoWidth * escala);
      tela.height = Math.round(video.videoHeight * escala);
      tela.getContext("2d")?.drawImage(video, 0, 0, tela.width, tela.height);
      tela.toBlob(
        (blob) => {
          window.clearTimeout(desistir);
          URL.revokeObjectURL(url);
          if (blob) resolver(blob);
          else rejeitar(new Error("capa"));
        },
        "image/webp",
        0.82,
      );
    };
    video.onerror = () => rejeitar(new Error("video"));
  });
}
