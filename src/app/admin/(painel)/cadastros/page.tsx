import { Cabecalho } from "@/components/admin/ui";
import { ListaCadastros } from "@/components/admin/lista-cadastros";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PaginaCadastros() {
  await exigirPerfil();
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      `id, nome, contato, profissao, renda_mensal, valor_entrada, mensagem,
       origem, situacao, anotacoes, created_at,
       empreendimento:empreendimentos (nome),
       unidade:unidades (identificacao)`,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Cadastros"
        descricao="Quem preencheu o formulário do site. O perfil (profissão, renda e entrada) ajuda a preparar o atendimento antes de ligar."
      />

      <ListaCadastros leads={(leads ?? []) as never} />
    </div>
  );
}
