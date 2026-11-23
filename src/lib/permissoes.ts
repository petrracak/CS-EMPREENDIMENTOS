/**
 * Quem pode o quê no painel.
 *
 * O mesmo mapa está no banco, na função public.pode() (migração 0011),
 * que é quem de fato barra a escrita. Aqui ele decide o que aparece no
 * menu e quais telas abrem. Mudou um, mude o outro.
 */

export type Area =
  | "obras" // empreendimentos, unidades e tipos
  | "conteudo" // conteúdo do site
  | "blog"
  | "cadastros"
  | "usuarios"
  | "tecnico"; // pixels, tags e scripts

export type Nivel = "admin" | "editor" | "comercial";

export const NIVEIS: Record<
  Nivel,
  { rotulo: string; resumo: string; areas: readonly Area[] }
> = {
  admin: {
    rotulo: "Administrador",
    resumo: "Tudo: obras, site, blog, cadastros, usuários, pixels e scripts.",
    areas: ["obras", "conteudo", "blog", "cadastros", "usuarios", "tecnico"],
  },
  editor: {
    rotulo: "Editor do site",
    resumo: "Conteúdo do site e blog. Não vê cadastros nem mexe nas obras.",
    areas: ["conteudo", "blog"],
  },
  comercial: {
    rotulo: "Comercial",
    resumo:
      "Empreendimentos, unidades (preço e situação) e cadastros. Não mexe no site nem no blog.",
    areas: ["obras", "cadastros"],
  },
};

export const ORDEM_NIVEIS: readonly Nivel[] = ["admin", "editor", "comercial"];

export function ehNivel(valor: unknown): valor is Nivel {
  return valor === "admin" || valor === "editor" || valor === "comercial";
}

export function pode(nivel: string, area: Area): boolean {
  return ehNivel(nivel) && NIVEIS[nivel].areas.includes(area);
}
