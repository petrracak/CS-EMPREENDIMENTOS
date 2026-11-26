import { urlDaMidia } from "@/lib/midia";

/**
 * Vídeos dos empreendimentos: o link colado no painel vira o endereço do
 * player e, quando dá, a miniatura. Arquivo enviado ao Storage também
 * passa por aqui, para o site tratar tudo igual.
 *
 * O site nunca carrega o player antes do clique: mostra a miniatura com
 * o botão de play e só então troca pelo iframe ou pelo <video>. Um player
 * do YouTube pesa perto de 1 MB de JavaScript; com dez vídeos na página,
 * carregar tudo de cara derrubaria a nota do Google.
 */

export type TipoVideo = "arquivo" | "youtube" | "instagram" | "tiktok" | "vimeo";

export type Video = {
  id: string;
  tipo: TipoVideo;
  url: string;
  capa: string | null;
  titulo: string | null;
};

export type VideoPronto = Video & {
  /** Endereço do iframe (links) ou do arquivo (envio). */
  player: string;
  /** Miniatura conhecida: a do YouTube, ou a capa gerada no envio. */
  miniatura: string | null;
  /** Shorts, Reels e TikTok são em pé. */
  vertical: boolean;
};

/** Reconhece o link colado. null se não for de um serviço suportado. */
export function lerLink(
  bruto: string,
): { tipo: Exclude<TipoVideo, "arquivo">; codigo: string; vertical: boolean } | null {
  let url: URL;
  try {
    url = new URL(bruto.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const partes = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && partes[0]) {
    return { tipo: "youtube", codigo: partes[0], vertical: false };
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return { tipo: "youtube", codigo: v, vertical: false };
    if (["shorts", "embed", "live"].includes(partes[0]) && partes[1]) {
      return { tipo: "youtube", codigo: partes[1], vertical: partes[0] === "shorts" };
    }
  }
  if (host === "instagram.com" && ["p", "reel", "reels", "tv"].includes(partes[0]) && partes[1]) {
    return { tipo: "instagram", codigo: partes[1], vertical: partes[0] !== "p" };
  }
  if (host === "tiktok.com") {
    const i = partes.indexOf("video");
    if (i >= 0 && partes[i + 1]) return { tipo: "tiktok", codigo: partes[i + 1], vertical: true };
  }
  if (host === "vimeo.com" && /^\d+$/.test(partes[0] ?? "")) {
    return { tipo: "vimeo", codigo: partes[0], vertical: false };
  }
  if (host === "player.vimeo.com" && partes[0] === "video" && partes[1]) {
    return { tipo: "vimeo", codigo: partes[1], vertical: false };
  }
  return null;
}

const SEGURO = /^[A-Za-z0-9_-]+$/;

export function prepararVideo(v: Video): VideoPronto | null {
  if (v.tipo === "arquivo") {
    return {
      ...v,
      player: urlDaMidia(v.url),
      miniatura: v.capa ? urlDaMidia(v.capa) : null,
      vertical: false,
    };
  }
  const link = lerLink(v.url);
  if (!link || !SEGURO.test(link.codigo)) return null;
  const c = link.codigo;
  switch (link.tipo) {
    case "youtube":
      return {
        ...v,
        player: `https://www.youtube-nocookie.com/embed/${c}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        miniatura: `https://i.ytimg.com/vi/${c}/hqdefault.jpg`,
        vertical: link.vertical,
      };
    case "instagram":
      return {
        ...v,
        player: `https://www.instagram.com/${link.vertical ? "reel" : "p"}/${c}/embed`,
        miniatura: null,
        vertical: true,
      };
    case "tiktok":
      return { ...v, player: `https://www.tiktok.com/embed/v2/${c}`, miniatura: null, vertical: true };
    case "vimeo":
      return {
        ...v,
        player: `https://player.vimeo.com/video/${c}?autoplay=1&dnt=1`,
        miniatura: null,
        vertical: false,
      };
  }
}

export const NOME_DO_SERVICO: Record<TipoVideo, string> = {
  arquivo: "Vídeo",
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  vimeo: "Vimeo",
};

/** Limite do arquivo enviado: o gratuito do Supabase aceita até 50 MB. */
export const VIDEO_MAXIMO_MB = 45;
