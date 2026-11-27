import { FormEmpreendimento } from "@/components/admin/form-empreendimento";
import { GerenciadorImagens } from "@/components/admin/gerenciador-imagens";
import { Cabecalho, Cartao, TituloBloco } from "@/components/admin/ui";
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
        descricao="Preencha o básico, suba as fotos e as plantas e salve. Os vídeos e as unidades entram depois do primeiro salvamento."
      />
      <FormEmpreendimento
        dados={{}}
        tipos={tipos ?? []}
        midia={
          <>
            <GerenciadorImagens
              imagens={[]}
              categoria="galeria"
              titulo="Galeria de fotos"
              apoio="As fotos do projeto, num carrossel na página. A legenda aparece embaixo de cada uma; as setas mudam a ordem."
            />
            <GerenciadorImagens
              imagens={[]}
              categoria="planta"
              titulo="Plantas"
              apoio="As plantas baixas do projeto, mostradas inteiras e sem corte, num carrossel no fundo verde. Use a legenda para dizer qual é (ex.: Planta da casa de 56 m²)."
            />
            <Cartao className="p-5 sm:p-7">
              <TituloBloco>Vídeos</TituloBloco>
              <p className="text-sm leading-relaxed text-[var(--fg-suave)]">
                Os vídeos entram depois do primeiro salvamento: assim que você
                salvar, esta aba abre de novo com o espaço para colar o link
                ou enviar o arquivo.
              </p>
            </Cartao>
          </>
        }
      />
    </div>
  );
}
