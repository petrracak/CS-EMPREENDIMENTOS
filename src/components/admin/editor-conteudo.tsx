"use client";

import Imagem from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { enviarImagem } from "@/app/actions/midia";
import { ehHtml, markdownParaHtml } from "@/lib/conteudo-blog";
import { urlDaMidia } from "@/lib/midia";
import { nomeDeArquivo, prepararImagem } from "@/lib/preparar-imagem";
import { useIdDoCampo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Editor do corpo de uma publicação, no jeito do Word: o texto aparece
 * formatado enquanto a pessoa escreve, e a barra de cima tem estilo do
 * parágrafo (texto, título, subtítulo), negrito, itálico, sublinhado,
 * listas, citação, link, imagem e linha divisória. Colar de um documento
 * do Word ou do Google Docs também traz os títulos, negritos e listas.
 *
 * Grava HTML num campo escondido "conteudo". O site lê esse HTML por
 * lib/conteudo-blog.ts, que só deixa passar essas mesmas marcas. As
 * publicações antigas, em Markdown, abrem já convertidas.
 */
export function EditorConteudo({
  nome,
  valor,
}: {
  nome: string;
  valor: string;
}) {
  const inicial = valor && !ehHtml(valor) ? markdownParaHtml(valor) : valor;
  const [html, setHtml] = useState(inicial);
  const idDaCaixa = useIdDoCampo();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
      Imagem,
      Placeholder.configure({
        placeholder: "Comece a escrever a publicação…",
      }),
    ],
    content: inicial,
    editorProps: {
      attributes: {
        ...(idDaCaixa ? { id: idDaCaixa } : {}),
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Conteúdo da publicação",
        class:
          "texto-blog min-h-[28rem] px-5 py-6 outline-none sm:px-8 sm:py-8",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="editor-conteudo overflow-hidden rounded-xl border border-[var(--borda)] bg-[var(--bg-elevado)] transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--color-verde-700)] focus-within:shadow-[0_0_0_4px_rgb(0_69_39/0.1)]">
      <input type="hidden" name={nome} value={html} />
      {editor ? (
        <Barra editor={editor} />
      ) : (
        <div className="h-[3.25rem] border-b border-[var(--borda)]" />
      )}
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="texto-blog min-h-[28rem] px-5 py-6 text-[var(--fg-tenue)] sm:px-8 sm:py-8">
          …
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- barra */

function Barra({ editor }: { editor: Editor }) {
  const arquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      estilo: e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : "p",
      negrito: e.isActive("bold"),
      italico: e.isActive("italic"),
      sublinhado: e.isActive("underline"),
      lista: e.isActive("bulletList"),
      numerada: e.isActive("orderedList"),
      citacao: e.isActive("blockquote"),
      link: e.isActive("link"),
      desfazer: e.can().undo(),
      refazer: e.can().redo(),
    }),
  });

  const cadeia = () => editor.chain().focus();

  function trocarEstilo(valor: string) {
    if (valor === "h2") cadeia().setHeading({ level: 2 }).run();
    else if (valor === "h3") cadeia().setHeading({ level: 3 }).run();
    else cadeia().setParagraph().run();
  }

  function pedirLink() {
    const atual = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Endereço do link (página do site, como /empreendimentos, ou um site completo):",
      atual ?? "",
    );
    if (url === null) return;
    if (!url.trim()) {
      cadeia().extendMarkRange("link").unsetLink().run();
      return;
    }
    cadeia().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function enviar(escolhido: File) {
    setErro(null);
    setEnviando(true);
    try {
      const pronta = await prepararImagem(escolhido);
      const dados = new FormData();
      dados.append("grande", pronta.grande, "grande.webp");
      dados.append("pequena", pronta.pequena, "pequena.webp");
      dados.append("pasta", "blog");
      dados.append("nome", nomeDeArquivo(escolhido.name));
      const resposta = await enviarImagem(dados);
      if (resposta.erro || !resposta.caminho) {
        setErro(resposta.erro ?? "Não conseguimos enviar a imagem.");
        return;
      }
      cadeia()
        .setImage({ src: urlDaMidia(resposta.caminho), alt: "" })
        .run();
    } catch {
      setErro("Não conseguimos ler esta imagem. Tente JPG ou PNG.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="sticky top-16 z-10 border-b border-[var(--borda)] bg-[var(--bg-elevado)]/95 backdrop-blur lg:top-0">
      <div
        role="toolbar"
        aria-label="Formatação do texto"
        className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
      >
        <select
          aria-label="Estilo do parágrafo"
          value={estado.estilo}
          onChange={(e) => trocarEstilo(e.target.value)}
          className="h-9 rounded-lg border border-[var(--borda)] bg-[var(--bg)] px-2.5 text-sm text-[var(--fg)] outline-none focus-visible:border-[var(--color-verde-700)]"
        >
          <option value="p">Texto normal</option>
          <option value="h2">Título</option>
          <option value="h3">Subtítulo</option>
        </select>

        <Separador />
        <Ferramenta
          Icone={Bold}
          rotulo="Negrito (Ctrl+B)"
          ativo={estado.negrito}
          aoTocar={() => cadeia().toggleBold().run()}
        />
        <Ferramenta
          Icone={Italic}
          rotulo="Itálico (Ctrl+I)"
          ativo={estado.italico}
          aoTocar={() => cadeia().toggleItalic().run()}
        />
        <Ferramenta
          Icone={Underline}
          rotulo="Sublinhado (Ctrl+U)"
          ativo={estado.sublinhado}
          aoTocar={() => cadeia().toggleUnderline().run()}
        />

        <Separador />
        <Ferramenta
          Icone={List}
          rotulo="Lista com marcadores"
          ativo={estado.lista}
          aoTocar={() => cadeia().toggleBulletList().run()}
        />
        <Ferramenta
          Icone={ListOrdered}
          rotulo="Lista numerada"
          ativo={estado.numerada}
          aoTocar={() => cadeia().toggleOrderedList().run()}
        />
        <Ferramenta
          Icone={Quote}
          rotulo="Citação"
          ativo={estado.citacao}
          aoTocar={() => cadeia().toggleBlockquote().run()}
        />

        <Separador />
        <Ferramenta
          Icone={Link2}
          rotulo="Link"
          ativo={estado.link}
          aoTocar={pedirLink}
        />
        {estado.link ? (
          <Ferramenta
            Icone={Link2Off}
            rotulo="Tirar o link"
            aoTocar={() => cadeia().extendMarkRange("link").unsetLink().run()}
          />
        ) : null}
        <Ferramenta
          Icone={enviando ? Loader2 : ImagePlus}
          rotulo="Imagem"
          girando={enviando}
          desativado={enviando}
          aoTocar={() => arquivo.current?.click()}
        />
        <Ferramenta
          Icone={Minus}
          rotulo="Linha divisória"
          aoTocar={() => cadeia().setHorizontalRule().run()}
        />

        <Separador />
        <Ferramenta
          Icone={RemoveFormatting}
          rotulo="Limpar formatação"
          aoTocar={() => cadeia().unsetAllMarks().clearNodes().run()}
        />
        <Ferramenta
          Icone={Undo2}
          rotulo="Desfazer (Ctrl+Z)"
          desativado={!estado.desfazer}
          aoTocar={() => cadeia().undo().run()}
        />
        <Ferramenta
          Icone={Redo2}
          rotulo="Refazer"
          desativado={!estado.refazer}
          aoTocar={() => cadeia().redo().run()}
        />

        <input
          ref={arquivo}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void enviar(f);
          }}
        />
      </div>
      {erro ? (
        <p className="px-3 pb-2 text-sm text-[var(--color-acento-forte)]">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function Separador() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-[var(--borda)]" />;
}

function Ferramenta({
  Icone,
  rotulo,
  ativo,
  desativado,
  girando,
  aoTocar,
}: {
  Icone: LucideIcon;
  rotulo: string;
  ativo?: boolean;
  desativado?: boolean;
  girando?: boolean;
  aoTocar: () => void;
}) {
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      aria-pressed={ativo}
      disabled={desativado}
      // Clicar no botão não pode tirar a seleção do texto.
      onMouseDown={(e) => e.preventDefault()}
      onClick={aoTocar}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg text-[var(--fg-suave)] transition-colors hover:bg-[var(--bg-fundo)] hover:text-[var(--fg)] disabled:opacity-35 disabled:hover:bg-transparent",
        ativo &&
          "bg-[#ccf1e0] text-[#004527] hover:bg-[#ccf1e0] hover:text-[#004527]",
      )}
    >
      <Icone
        className={cn("h-[1.05rem] w-[1.05rem]", girando && "animate-spin")}
        strokeWidth={2}
      />
    </button>
  );
}
