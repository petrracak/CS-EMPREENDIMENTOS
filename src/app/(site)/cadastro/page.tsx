import type { Metadata } from "next";

import { FormularioCompleto } from "@/components/site/formulario-lead";
import { BotaoExterno, Olho, Secao, Titulo } from "@/components/site/ui";
import { createPublicClient } from "@/lib/supabase/public";
import { listarParaSelecao } from "@/lib/queries";
import { lerConfig, lerEmpresa, txt } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/cadastro" },
  title: "Cadastre-se",
  description:
    "Deixe seus dados e receba o atendimento de um consultor da CS com as opções certas para o seu perfil.",
};

export default async function PaginaCadastro({
  searchParams,
}: {
  searchParams: Promise<{ empreendimento?: string; unidade?: string }>;
}) {
  const busca = await searchParams;
  const [config, empresa, empreendimentos] = await Promise.all([
    lerConfig("cadastro"),
    lerEmpresa(),
    listarParaSelecao(),
  ]);

  // Quem chega de uma unidade traz o empreendimento pelo slug; aqui ele
  // vira id, que é o que o formulário grava.
  let empreendimentoPadrao: string | undefined;
  if (busca.empreendimento) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("empreendimentos")
      .select("id")
      .eq("slug", busca.empreendimento)
      .maybeSingle();
    empreendimentoPadrao = data?.id;
  }

  return (
    <Secao className="pt-14 md:pt-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <div data-revelar className="max-w-xl">
            <Olho>Atendimento</Olho>
            <Titulo
              nivel="h1"
              antes="Cadastre-se e receba"
              destaque="atendimento"
              className="text-display-md mt-5"
            />
            <p className="mt-5 leading-relaxed text-[var(--fg-suave)]">
              {txt(config, "texto")}
            </p>
          </div>

          <FormularioCompleto
            empreendimentos={empreendimentos}
            empreendimentoPadrao={empreendimentoPadrao}
            unidadePadrao={busca.unidade}
            consentimento={txt(config, "consentimento")}
            botao={txt(config, "botao", "Quero ser atendido")}
            sucessoTitulo={txt(config, "sucesso_titulo")}
            sucessoTexto={txt(config, "sucesso_texto")}
          />
        </div>

        {/* ------------------------------------------- caminho alternativo */}
        <aside
          data-revelar
          className="h-fit rounded-2xl bg-[var(--bg-tinta)] p-8 lg:sticky lg:top-28"
        >
          <h2 className="font-display text-xl font-medium text-white">
            Prefere falar agora?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {txt(config, "alternativa")}
          </p>
          <BotaoExterno
            href={empresa.whatsapp_link}
            aparencia="claro"
            icone="zap"
            className="mt-7"
          >
            Chamar no WhatsApp
          </BotaoExterno>

          <dl className="mt-9 space-y-5 border-t border-white/10 pt-7 text-sm">
            <div>
              <dt className="text-xs tracking-wide text-[var(--color-ouro-300)] uppercase">
                Escritório
              </dt>
              <dd className="mt-1.5 leading-relaxed text-white/65">
                {empresa.endereco}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-[var(--color-ouro-300)] uppercase">
                E-mail
              </dt>
              <dd className="mt-1.5 break-all text-white/65">
                {empresa.email}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </Secao>
  );
}
