import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Tudo aberto para buscadores e para os robôs das IAs (ChatGPT, Claude,
 * Perplexity, Gemini), que citam o site quando alguém pergunta por
 * construtora ou imóvel em Santarém. Só o painel e as rotas internas
 * ficam de fora.
 */
export default function robots(): MetadataRoute.Robots {
  const fechado = ["/admin", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: fechado },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
        ],
        allow: "/",
        disallow: fechado,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
