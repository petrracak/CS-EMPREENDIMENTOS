import { notFound } from "next/navigation";

import { FormPost } from "@/components/admin/form-post";
import { Cabecalho } from "@/components/admin/ui";
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
    <div className="space-y-8">
      <Cabecalho voltar={{ href: "/admin/blog", rotulo: "Blog" }} titulo={post.titulo} />
      <FormPost post={post} />
    </div>
  );
}
