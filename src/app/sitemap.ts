import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

/** Todas as páginas públicas, com a data da última mudança. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: obras }, { data: posts }] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select("slug, updated_at")
      .eq("status", "publicado"),
    supabase
      .from("posts")
      .select("slug, publicado_em, updated_at")
      .eq("status", "publicado"),
  ]);

  const agora = new Date();
  const fixas: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/empreendimentos`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${SITE_URL}/cadastro`, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${SITE_URL}/termos-de-uso`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  return [
    ...fixas,
    ...(obras ?? []).map((o) => ({
      url: `${SITE_URL}/empreendimentos/${o.slug}`,
      lastModified: new Date(o.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...(posts ?? []).map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.publicado_em ?? agora),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
