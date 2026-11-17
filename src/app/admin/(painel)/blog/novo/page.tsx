import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FormPost } from "@/components/admin/form-post";
import { exigirPerfil } from "@/lib/auth";

export default async function NovaPublicacao() {
  await exigirPerfil();

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
        Nova publicação
      </h1>

      <FormPost post={{}} />
    </>
  );
}
