import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Home,
  Users,
} from "lucide-react";

import { Cartao, Etiqueta } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/utils";

export default async function VisaoGeral() {
  const perfil = await exigirPerfil();
  const supabase = await createClient();

  // Contagens em paralelo, só o número (head: true não traz as linhas).
  const [empreendimentos, publicados, unidades, posts, cadastros, recentes] =
    await Promise.all([
      supabase.from("empreendimentos").select("*", { count: "exact", head: true }),
      supabase
        .from("empreendimentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "publicado"),
      supabase
        .from("unidades")
        .select("*", { count: "exact", head: true })
        .eq("situacao", "disponivel"),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id, nome, contato, created_at, situacao")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const numeros = [
    {
      rotulo: "Empreendimentos",
      valor: empreendimentos.count ?? 0,
      apoio: `${publicados.count ?? 0} publicados`,
      href: "/admin/empreendimentos",
      Icone: Building2,
    },
    {
      rotulo: "Unidades disponíveis",
      valor: unidades.count ?? 0,
      apoio: "em todos os projetos",
      href: "/admin/empreendimentos",
      Icone: Home,
    },
    {
      rotulo: "Publicações",
      valor: posts.count ?? 0,
      apoio: "no blog",
      href: "/admin/blog",
      Icone: FileText,
    },
    {
      rotulo: "Cadastros",
      valor: cadastros.count ?? 0,
      apoio: "interessados recebidos",
      href: "/admin/cadastros",
      Icone: Users,
    },
  ];

  return (
    <>
      <header>
        <h1 className="font-display text-2xl font-medium">
          Olá, {perfil.nome.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--fg-tenue)]">
          Este é o painel do site da CS. Tudo o que você editar aqui aparece
          no site em instantes.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numeros.map(({ rotulo, valor, apoio, href, Icone }) => (
          <Link key={rotulo} href={href}>
            <Cartao className="h-full p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-card)]">
              <Icone className="h-4 w-4 text-[var(--color-ouro-600)]" />
              <p className="font-display tabular mt-3 text-2xl font-medium">
                {valor}
              </p>
              <p className="mt-0.5 text-sm font-medium">{rotulo}</p>
              <p className="mt-0.5 text-xs text-[var(--fg-tenue)]">{apoio}</p>
            </Cartao>
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------ últimos cadastros */}
      <Cartao className="mt-8 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-medium">
            Últimos cadastros
          </h2>
          <Link
            href="/admin/cadastros"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--acento)]"
          >
            Ver todos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentes.data?.length ? (
          <ul className="mt-5 divide-y divide-[var(--borda)]">
            {recentes.data.map((lead) => (
              <li
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.nome}</p>
                  <p className="truncate text-xs text-[var(--fg-tenue)]">
                    {lead.contato}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.situacao === "novo" ? (
                    <Etiqueta tom="verde">Novo</Etiqueta>
                  ) : null}
                  <span className="text-xs text-[var(--fg-tenue)]">
                    {formatarData(lead.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-[var(--fg-tenue)]">
            Nenhum cadastro ainda. Quando alguém preencher o formulário do
            site, ele aparece aqui.
          </p>
        )}
      </Cartao>
    </>
  );
}
