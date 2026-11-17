import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NovoEmpreendimento() {
  await exigirPerfil();
  const supabase = await createClient();
  const { data: tipos } = await supabase
    .from("tipos_empreendimento")
    .select("id, nome")
    .order("ordem");

  return (
    <>
      <Link
        href="/admin/empreendimentos"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-tenue)] transition-colors hover:text-[var(--acento)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Empreendimentos
      </Link>

      <h1 className="font-display mt-4 text-2xl font-medium">
        Novo empreendimento
      </h1>
      <p className="mt-1.5 text-sm text-[var(--fg-tenue)]">
        Preencha o básico e salve. As fotos e as unidades entram depois,
        na tela de edição.
      </p>

      <div className="mt-8">
        <FormEmpreendimento dados={{}} tipos={tipos ?? []} />
      </div>
    </>
  );
}
