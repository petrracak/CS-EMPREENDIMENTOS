import { FormRastreamento } from "@/components/admin/form-rastreamento";
import { Cabecalho } from "@/components/admin/ui";
import { exigirArea } from "@/lib/auth";
import { lerRastreamento } from "@/lib/rastreamento";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pixels e scripts" };

export default async function PaginaConfiguracoes() {
  await exigirArea("tecnico");

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("valor")
    .eq("chave", "rastreamento")
    .maybeSingle();

  const valor = lerRastreamento((data?.valor ?? {}) as Record<string, unknown>);

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Pixels e scripts"
        descricao="Os códigos de rastreamento das campanhas. Cada cadastro feito no site é enviado como conversão para o que estiver ligado aqui."
      />
      <FormRastreamento valor={valor} />
    </div>
  );
}
