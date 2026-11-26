import type { ReactNode } from "react";

import { lerConteudo, type No } from "@/lib/conteudo-blog";

/**
 * O texto de uma publicação do blog. A árvore vem de lib/conteudo-blog,
 * que só deixa passar as marcas permitidas; aqui cada uma vira o
 * elemento React correspondente. O desenho fica em .texto-blog
 * (globals.css), a mesma classe que o editor do painel usa, para a
 * pessoa ver lá o que vai sair aqui.
 */
export function ConteudoBlog({
  conteudo,
}: {
  conteudo: string | null | undefined;
}) {
  const arvore = lerConteudo(conteudo);
  if (!arvore.length) return null;
  return <div className="texto-blog">{arvore.map(montar)}</div>;
}

function montar(no: No, chave: number): ReactNode {
  if (no.tipo === "texto") return no.texto;
  const filhos = no.filhos.map(montar);

  switch (no.tag) {
    case "a": {
      if (!no.href) return <span key={chave}>{filhos}</span>;
      const fora = /^https?:\/\//i.test(no.href);
      return (
        <a
          key={chave}
          href={no.href}
          {...(fora ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {filhos}
        </a>
      );
    }
    case "img":
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          key={chave}
          src={no.src}
          alt={no.alt ?? ""}
          loading="lazy"
          decoding="async"
        />
      );
    case "hr":
      return <hr key={chave} />;
    case "br":
      return <br key={chave} />;
    default: {
      const Tag = no.tag;
      return <Tag key={chave}>{filhos}</Tag>;
    }
  }
}
