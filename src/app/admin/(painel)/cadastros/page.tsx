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
    <>
      <header>
        <h1 className="font-display text-2xl font-medium">Cadastros</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-tenue)]">
          Quem preencheu o formulário do site. O perfil (profissão, renda e
          entrada) ajuda a preparar o atendimento antes de ligar.
        </p>
      </header>

      <ListaCadastros leads={(leads ?? []) as never} />
    </>
  );
}
