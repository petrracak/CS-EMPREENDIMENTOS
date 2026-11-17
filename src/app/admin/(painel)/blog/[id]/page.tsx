import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormPost } from "@/components/admin/form-post";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditarPublicacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPerfil();
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <>
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--acento)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Blog
      </Link>

      <h1 className="font-display mt-4 mb-8 text-2xl font-medium">
        {post.titulo}
      </h1>

      <FormPost post={post} />
    </>
  );
}
