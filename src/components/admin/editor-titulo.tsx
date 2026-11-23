"use client";

import {
  EditorContent,
  Extension,
  Mark,
  Node,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, RemoveFormatting, Underline } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useIdDoCampo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Caixa de título com formatação: negrito, itálico, sublinhado e o
 * destaque em gradiente do site.
 *
 * Substitui os três campos de antes (começo, palavra em destaque, fim).
 * A pessoa escreve a frase inteira, seleciona o trecho e toca em
 * "Destaque" — quantos trechos quiser, em qualquer ponto da frase.
 *
 * Grava um HTML mínimo num campo escondido (ver lib/texto-rico.ts, que é
 * quem lê isso no site). A caixa aceita uma linha só: título é uma frase,
 * e a quebra de linha fica por conta da largura da tela.
 */

/** Documento de um parágrafo só: o Enter não abre outro. */
const DocumentoDeUmaLinha = Node.create({
  name: "doc",
  topNode: true,
  content: "paragraph",
});

const SemQuebra = Extension.create({
  name: "semQuebra",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      "Shift-Enter": () => true,
      "Mod-Enter": () => true,
    };
  },
});

/** O destaque do site. No HTML gravado é um <mark> sem atributos. */
const Destaque = Mark.create({
  name: "destaque",
  parseHTML() {
    return [{ tag: "mark" }];
  },
  renderHTML() {
    return ["mark", 0];
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleMark(this.name),
    };
  },
});

/** O HTML do Tiptap vem embrulhado num <p>; o título não precisa dele. */
function limpar(editor: Editor) {
  if (editor.isEmpty) return "";
  return editor
    .getHTML()
    .replace(/^<p>/, "")
    .replace(/<\/p>$/, "")
    .trim();
}

const LETRA = {
  grande: "font-display text-[1.1875rem] font-medium tracking-[-0.01em]",
  medio: "font-display text-[1.0625rem] font-medium tracking-[-0.01em]",
  // 16 px no celular: abaixo disso o iPhone dá zoom ao tocar no campo.
  texto: "text-base font-normal sm:text-[0.9375rem]",
} as const;

export function EditorTitulo({
  nome,
  valor,
  id,
  rotulo,
  placeholder,
  tamanho = "grande",
}: {
  nome: string;
  valor: string;
  /** Vem do Campo, para o rótulo apontar para a caixa. */
  id?: string;
  /** Nome que o leitor de tela anuncia. */
  rotulo?: string;
  placeholder?: string;
  /** "texto" é para frases que não são título, como a faixa de campanha. */
  tamanho?: "grande" | "medio" | "texto";
}) {
  const idDaCaixa = useIdDoCampo(id);
  const [html, setHtml] = useState(valor);
  const escondido = useRef<HTMLInputElement>(null);
  const primeiro = useRef(true);

  const editor = useEditor({
    // O painel renderiza no servidor; o editor só existe no navegador.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        document: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        link: false,
        dropcursor: false,
        gapcursor: false,
        trailingNode: false,
      }),
      DocumentoDeUmaLinha,
      SemQuebra,
      Destaque,
    ],
    content: valor ? `<p>${valor}</p>` : "",
    editorProps: {
      attributes: {
        ...(idDaCaixa ? { id: idDaCaixa } : {}),
        role: "textbox",
        "aria-multiline": "false",
        ...(rotulo ? { "aria-label": rotulo } : {}),
        class: cn(
          "editor-titulo min-h-[3.25rem] px-4 py-3 leading-snug text-[var(--fg)] outline-none",
          LETRA[tamanho],
        ),
      },
    },
    onUpdate: ({ editor }) => setHtml(limpar(editor)),
  });

  // A prévia do topo escuta "input" no formulário; um campo escondido
  // mudado por código não dispara esse evento sozinho.
  useEffect(() => {
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    escondido.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [html]);

  const ativo = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            negrito: editor.isActive("bold"),
            italico: editor.isActive("italic"),
            sublinhado: editor.isActive("underline"),
            destaque: editor.isActive("destaque"),
            vazio: editor.isEmpty,
          }
        : null,
  });

  const gradiente = useId();

  const alternar = (marca: string) =>
    editor?.chain().focus().toggleMark(marca).run();

  return (
    <div className="rounded-xl border border-[var(--borda)] bg-[var(--bg-elevado)] shadow-[0_1px_0_rgb(1_38_22/0.03)] transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--color-verde-700)] focus-within:shadow-[0_0_0_4px_rgb(0_69_39/0.1)] hover:border-[var(--borda-forte)]">
      <input ref={escondido} type="hidden" name={nome} value={html} />

      <div className="relative">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          // Enquanto o editor monta, o mesmo tamanho, para nada pular.
          <div
            className={cn(
              "min-h-[3.25rem] px-4 py-3 leading-snug text-[var(--fg-tenue)]",
              LETRA[tamanho],
            )}
          >
            …
          </div>
        )}
        {placeholder && ativo?.vazio ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-3 left-4 leading-snug text-[var(--fg-tenue)]/60",
              LETRA[tamanho],
            )}
          >
            {placeholder}
          </span>
        ) : null}
      </div>

      {/* Barra de formatação, embaixo do texto. onMouseDown com
          preventDefault: clicar no botão não pode tirar a seleção. */}
      <div
        role="toolbar"
        aria-label="Formatação do texto"
        className="flex flex-wrap items-center gap-1 border-t border-[var(--borda)] px-2 py-1.5"
      >
        <BotaoFormato
          rotulo="Negrito"
          atalho="Ctrl+B"
          ativo={!!ativo?.negrito}
          aoUsar={() => alternar("bold")}
        >
          <Bold className="h-4 w-4" strokeWidth={2.2} />
        </BotaoFormato>
        <BotaoFormato
          rotulo="Itálico"
          atalho="Ctrl+I"
          ativo={!!ativo?.italico}
          aoUsar={() => alternar("italic")}
        >
          <Italic className="h-4 w-4" strokeWidth={2.2} />
        </BotaoFormato>
        <BotaoFormato
          rotulo="Sublinhado"
          atalho="Ctrl+U"
          ativo={!!ativo?.sublinhado}
          aoUsar={() => alternar("underline")}
        >
          <Underline className="h-4 w-4" strokeWidth={2.2} />
        </BotaoFormato>

        <span aria-hidden className="mx-1 h-5 w-px bg-[var(--borda)]" />

        <BotaoFormato
          rotulo="Destaque em gradiente"
          atalho="Ctrl+Shift+H"
          ativo={!!ativo?.destaque}
          aoUsar={() => alternar("destaque")}
          largo
        >
          <IconeDestaque id={gradiente} />
          <span className="text-[0.8125rem] font-medium">Destaque</span>
        </BotaoFormato>

        <BotaoFormato
          rotulo="Tirar a formatação do trecho"
          ativo={false}
          aoUsar={() => editor?.chain().focus().unsetAllMarks().run()}
          className="ml-auto"
        >
          <RemoveFormatting className="h-4 w-4" strokeWidth={1.9} />
        </BotaoFormato>
      </div>
    </div>
  );
}

function BotaoFormato({
  rotulo,
  atalho,
  ativo,
  aoUsar,
  largo,
  className,
  children,
}: {
  rotulo: string;
  atalho?: string;
  ativo: boolean;
  aoUsar: () => void;
  largo?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={ativo}
      title={atalho ? `${rotulo} (${atalho})` : rotulo}
      onMouseDown={(e) => e.preventDefault()}
      onClick={aoUsar}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-[var(--fg-suave)] transition-colors duration-200",
        largo ? "px-2.5" : "w-9",
        ativo
          ? "bg-[var(--color-verde-950)] text-white"
          : "hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Um "A" pintado com o gradiente do site, sobre um traço do mesmo tom. */
function IconeDestaque({ id }: { id: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-[1.125rem] w-[1.125rem]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB275" />
          <stop offset="55%" stopColor="#F3D694" />
          <stop offset="100%" stopColor="#3aa06a" />
        </linearGradient>
      </defs>
      <path
        d="M10 2.5 4.6 15h2.3l1.15-2.85h3.9L13.1 15h2.3L10 2.5Zm-1.2 7.75L10 7.3l1.2 2.95H8.8Z"
        fill={`url(#${id})`}
      />
      <rect x="3" y="16.6" width="14" height="1.9" rx="0.95" fill={`url(#${id})`} />
    </svg>
  );
}
