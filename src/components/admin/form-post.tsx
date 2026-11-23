"use client";

import { Check, Trash2 } from "lucide-react";
import { useActionState, useTransition } from "react";

import { apagarPost, salvarPost, type EstadoPost } from "@/app/actions/blog";
import { EnviarImagem } from "@/components/admin/enviar-imagem";
import {
  Area,
  Aviso,
  BarraSalvar,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Salvar,
  Selecao,
} from "@/components/admin/ui";

type Post = Record<string, unknown> & { id?: string };

export function FormPost({ post }: { post: Post }) {
  const [estado, acao] = useActionState<EstadoPost, FormData>(salvarPost, {});
  const [pendente, iniciar] = useTransition();

  const t = (campo: string) => {
    const v = post[campo];
    return typeof v === "string" ? v : "";
  };

  return (
    <form action={acao} className="space-y-6">
      <input type="hidden" name="id" value={t("id")} />
      <input type="hidden" name="publicado_em" value={t("publicado_em")} />

      <Cartao className="space-y-5 p-5 sm:p-7">
        <Campo rotulo="Título">
          <Entrada name="titulo" defaultValue={t("titulo")} required />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo
            rotulo="Endereço da página"
            apoio="Em branco, gera a partir do título."
          >
            <Entrada name="slug" defaultValue={t("slug")} />
          </Campo>
          <Campo rotulo="Categoria">
            <Entrada
              name="categoria"
              defaultValue={t("categoria")}
              placeholder="Guia de compra"
            />
          </Campo>
          <Campo rotulo="Publicação">
            <Selecao name="status" defaultValue={t("status") || "rascunho"}>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
            </Selecao>
          </Campo>
        </div>

        <Campo
          rotulo="Resumo"
          apoio="Aparece no card da listagem e abaixo do título."
        >
          <Area name="resumo" rows={3} defaultValue={t("resumo")} />
        </Campo>

        <EnviarImagem
          nome="capa_url"
          valor={t("capa_url") || null}
          pasta="blog"
          rotulo="Imagem de capa"
          larguraIdeal={1600}
          alturaIdeal={900}
        />
      </Cartao>

      <Cartao className="space-y-5 p-5 sm:p-7">
        <Campo
          rotulo="Conteúdo"
          apoio={
            'Use "## " no começo da linha para um subtítulo, "- " para itens de lista e **texto** para negrito. Deixe uma linha em branco entre os parágrafos.'
          }
        >
          <Area
            name="conteudo"
            rows={20}
            defaultValue={t("conteudo")}
            className="font-mono text-base leading-relaxed sm:text-xs"
          />
        </Campo>
      </Cartao>

      <Cartao className="space-y-5 p-5 sm:p-7">
        <Campo rotulo="Título no Google" apoio="Até 60 caracteres.">
          <Entrada name="seo_titulo" defaultValue={t("seo_titulo")} />
        </Campo>
        <Campo rotulo="Descrição no Google" apoio="Até 155 caracteres.">
          <Area
            name="seo_descricao"
            rows={2}
            defaultValue={t("seo_descricao")}
          />
        </Campo>
      </Cartao>

      <BarraSalvar>
        <Salvar>Salvar publicação</Salvar>
        {post.id ? (
          <Botao
            type="button"
            tom="perigo"
            disabled={pendente}
            onClick={() => {
              if (
                confirm(
                  "Apagar esta publicação? Ela sai do site e não volta.",
                )
              ) {
                iniciar(() => {
                  void apagarPost(String(post.id));
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Apagar
          </Botao>
        ) : null}
        {estado.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-verde-600)]">
            <Check className="h-4 w-4" />
            Salvo
          </span>
        ) : null}
        {estado.erro ? <Aviso tipo="erro">{estado.erro}</Aviso> : null}
      </BarraSalvar>
    </form>
  );
}
