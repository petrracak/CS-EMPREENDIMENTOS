import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { Cabecalho } from "@/components/admin/ui";
import { exigirArea } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NovoEmpreendimento() {
  await exigirArea("obras");
  const supabase = await createClient();
  const { data: tipos } = await supabase
    .from("tipos_empreendimento")
    .select("id, nome")
    .order("ordem");

  return (
    <div className="space-y-8">
      <Cabecalho
        voltar={{ href: "/admin/empreendimentos", rotulo: "Empreendimentos" }}
        titulo="Novo empreendimento"
        descricao="Preencha o básico e salve. A galeria, as plantas e as unidades entram depois, na tela de edição."
      />
      <FormEmpreendimento dados={{}} tipos={tipos ?? []} />
    </div>
  );
}
