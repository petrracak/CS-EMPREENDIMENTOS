import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  DoorOpen,
  FileText,
  LayoutTemplate,
  PenLine,
  Plus,
  Users,
} from "lucide-react";

import { Aviso, Cabecalho, Cartao, Etiqueta } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";
import { pode, type Area } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/utils";

function saudacao() {
  // O servidor roda em UTC; a CS fica em Santarém (UTC−3).
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Santarem",
    }).format(new Date()),
  );
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

export default async function VisaoGeral({
  searchParams,
}: {
  searchParams: Promise<{ "sem-permissao"?: string }>;
}) {
  const [perfil, busca] = await Promise.all([exigirPerfil(), searchParams]);
  const verCadastros = pode(perfil.role, "cadastros");
  const supabase = await createClient();

  // Contagens em paralelo, só o número (head: true não traz as linhas).
  const [
    empreendimentos,
    publicados,
    unidades,
    posts,
    cadastros,
    novos,
    recentes,
  ] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select("*", { count: "exact", head: true }),
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
      .select("*", { count: "exact", head: true })
      .eq("situacao", "novo"),
    supabase
      .from("leads")
      .select("id, nome, contato, created_at, situacao")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const numeros: {
    rotulo: string;
    valor: number;
    apoio: string;
    href: string;
    Icone: typeof Building2;
    area: Area;
  }[] = [
    {
      rotulo: "Empreendimentos",
      valor: empreendimentos.count ?? 0,
      apoio: `${publicados.count ?? 0} no site`,
      href: "/admin/empreendimentos",
      Icone: Building2,
      area: "obras",
    },
    {
      rotulo: "Unidades à venda",
      valor: unidades.count ?? 0,
      apoio: "em todos os projetos",
      href: "/admin/empreendimentos",
      Icone: DoorOpen,
      area: "obras",
    },
    {
      rotulo: "Publicações",
      valor: posts.count ?? 0,
      apoio: "no blog",
      href: "/admin/blog",
      Icone: FileText,
      area: "blog",
    },
    {
      rotulo: "Cadastros",
      valor: cadastros.count ?? 0,
      apoio: novos.count ? `${novos.count} sem resposta` : "todos atendidos",
      href: "/admin/cadastros",
      Icone: Users,
      area: "cadastros",
    },
  ];
  const meusNumeros = numeros.filter((n) => pode(perfil.role, n.area));

  const atalhos = [
    {
      href: "/admin/empreendimentos/novo",
      rotulo: "Novo empreendimento",
      apoio: "Página nova, com fotos e unidades",
      Icone: Plus,
      area: "obras" as Area,
    },
    {
      href: "/admin/conteudo",
      rotulo: "Trocar a foto do topo",
      apoio: "E os textos da página inicial",
      Icone: LayoutTemplate,
      area: "conteudo" as Area,
    },
    {
      href: "/admin/blog/novo",
      rotulo: "Escrever no blog",
      apoio: "Novidades de obra e dicas",
      Icone: PenLine,
      area: "blog" as Area,
    },
  ].filter((a) => pode(perfil.role, a.area));

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo={`${saudacao()}, ${perfil.nome.split(" ")[0]}`}
        descricao="Tudo o que você muda aqui vai para o site na hora."
      />

      {busca["sem-permissao"] ? (
        <Aviso tipo="erro">
          O seu nível de acesso não abre aquela tela. Se precisar dela, peça a
          um administrador.
        </Aviso>
      ) : null}

      {/* -------------------------------------------------------- números */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {meusNumeros.map(({ rotulo, valor, apoio, href, Icone }) => (
          <Link
            key={rotulo}
            href={href}
            className="group flex flex-col rounded-[1.25rem] border border-[var(--borda)] bg-[var(--bg-elevado)] p-4 shadow-[var(--sombra-painel)] transition-[border-color,box-shadow,transform] duration-500 [transition-timing-function:var(--ease-lento)] hover:-translate-y-0.5 hover:border-[var(--borda-forte)] hover:shadow-[var(--sombra-card)] sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-fundo)] text-[var(--color-verde-800)] transition-colors duration-500 group-hover:bg-[var(--color-verde-900)] group-hover:text-[var(--color-ouro-300)]">
                <Icone className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.7} />
              </span>
              <ArrowUpRight className="h-4 w-4 text-[var(--fg-tenue)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <p className="font-display tabular mt-5 text-[2rem] leading-none font-medium tracking-[-0.02em] text-[var(--color-verde-950)]">
              {valor}
            </p>
            <p className="mt-2 text-sm font-medium">{rotulo}</p>
            <p className="mt-0.5 text-xs text-[var(--fg-tenue)]">{apoio}</p>
          </Link>
        ))}
      </div>

      <div
        className={
          verCadastros ? "grid gap-5 lg:grid-cols-[1fr_20rem]" : "max-w-xl"
        }
      >
        {/* --------------------------------------------- últimos cadastros */}
        {verCadastros ? (
          <Cartao className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-medium tracking-[-0.01em]">
                Últimos cadastros
              </h2>
              <Link
                href="/admin/cadastros"
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-[var(--color-verde-800)] transition-colors hover:bg-[var(--bg-fundo)]"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentes.data?.length ? (
              <ul className="mt-3 divide-y divide-[var(--borda)]">
                {recentes.data.map((lead) => (
                  <li key={lead.id} className="flex items-center gap-3 py-3">
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-fundo)] text-xs font-medium text-[var(--color-verde-800)]"
                    >
                      {lead.nome.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {lead.nome}
                      </p>
                      <p className="truncate text-xs text-[var(--fg-tenue)]">
                        {lead.contato}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {lead.situacao === "novo" ? (
                        <Etiqueta tom="ouro">Novo</Etiqueta>
                      ) : null}
                      <span className="tabular text-xs text-[var(--fg-tenue)]">
                        {formatarData(lead.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-[var(--fg-tenue)]">
                Nenhum cadastro ainda. Quando alguém preencher o formulário do
                site, ele aparece aqui.
              </p>
            )}
          </Cartao>
        ) : null}

        {/* ------------------------------------------------------- atalhos */}
        <div className="space-y-3">
          <p className="px-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-[var(--fg-tenue)] uppercase">
            Atalhos
          </p>
          {atalhos.map(({ href, rotulo, apoio, Icone }, i) => (
            <Link
              key={href}
              href={href}
              className={
                i === 0
                  ? "group flex items-center gap-3 rounded-2xl bg-[var(--color-verde-950)] p-3.5 text-white transition-colors duration-300 hover:bg-[var(--color-verde-900)]"
                  : "group flex items-center gap-3 rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)] p-3.5 shadow-[var(--sombra-painel)] transition-colors duration-300 hover:border-[var(--borda-forte)]"
              }
            >
              <span
                className={
                  i === 0
                    ? "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[var(--color-ouro-300)]"
                    : "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-fundo)] text-[var(--color-verde-800)]"
                }
              >
                <Icone className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{rotulo}</span>
                <span
                  className={
                    i === 0
                      ? "block text-xs text-white/55"
                      : "block text-xs text-[var(--fg-tenue)]"
                  }
                >
                  {apoio}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
