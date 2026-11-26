"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ImageUp,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import { enviarImagem } from "@/app/actions/midia";
import { Dica } from "@/components/admin/dica";
import {
  nomeDeArquivo,
  prepararImagem,
  tamanhoLegivel,
} from "@/lib/preparar-imagem";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------- o envio em si */

/**
 * Escolher, converter e subir uma imagem. Separado do desenho para o
 * campo comum e o fundo do topo (com os dois aparelhos) usarem o mesmo
 * caminho.
 */
export function useEnvioDeImagem({
  inicial,
  pasta,
  larguraIdeal,
  limite,
  formatoIdeal,
}: {
  inicial: string | null;
  pasta: string;
  larguraIdeal?: number;
  /** Largura e altura que a arte deve ter, para avisar quando o formato não bate. */
  formatoIdeal?: { largura: number; altura: number };
  /** Lado maior da versão grande. Padrão: 1600 px. */
  limite?: number;
}) {
  const [caminho, setCaminho] = useState<string | null>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [conversao, setConversao] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    setAviso(null);
    setConversao(null);

    if (!arquivo.type.startsWith("image/") && !/\.(heic|heif)$/i.test(arquivo.name)) {
      setErro("Este arquivo não é uma imagem. Use JPG, PNG, HEIC ou WebP.");
      return;
    }

    setEnviando(true);
    try {
      const pronta = await prepararImagem(arquivo, { limite });

      // Avisa, mas não impede: às vezes a única foto que existe é essa.
      const formato = formatoIdeal && formatoIdeal.largura / formatoIdeal.altura;
      if (formato && Math.abs(pronta.largura / pronta.altura / formato - 1) > 0.03) {
        setAviso(
          `Esta arte tem ${pronta.largura} × ${pronta.altura} px, fora do formato de ${formatoIdeal.largura} × ${formatoIdeal.altura} px. No site ela vai ser cortada para caber.`,
        );
      } else if (larguraIdeal && pronta.largura < larguraIdeal * 0.8) {
        setAviso(
          `Esta imagem tem ${pronta.largura} px de largura. O ideal é ${larguraIdeal} px: em tela grande ela pode aparecer borrada.`,
        );
      }

      const dados = new FormData();
      dados.append("grande", pronta.grande, "grande.webp");
      dados.append("pequena", pronta.pequena, "pequena.webp");
      dados.append("pasta", pasta);
      dados.append("nome", nomeDeArquivo(arquivo.name));

      const resposta = await enviarImagem(dados);
      if (resposta.erro) setErro(resposta.erro);
      else if (resposta.caminho) {
        setCaminho(resposta.caminho);
        const formato = (arquivo.name.split(".").pop() ?? "").toUpperCase();
        setConversao(
          `${formato && formato !== "WEBP" ? `${formato} convertido para WebP` : "WebP otimizado"}: ${tamanhoLegivel(pronta.bytesOriginal)} → ${tamanhoLegivel(pronta.grande.size)}`,
        );
      }
    } catch (e) {
      setErro(
        e instanceof Error && e.message.includes("WebP")
          ? e.message
          : "Não conseguimos ler esta imagem. Tente salvar como JPG ou PNG e enviar de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return {
    caminho,
    enviando,
    erro,
    aviso,
    conversao,
    enviar,
    remover: () => {
      setCaminho(null);
      setConversao(null);
      setAviso(null);
    },
  };
}

/** Botão de escolher arquivo + área de soltar, sem desenho próprio. */
export function SeletorDeArquivo({
  aoEscolher,
  children,
  className,
  desativado,
}: {
  aoEscolher: (arquivo: File) => void;
  children: (abrir: () => void, arrastando: boolean) => React.ReactNode;
  className?: string;
  desativado?: boolean;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  return (
    <div
      className={className}
      onDragOver={(e) => {
        if (desativado) return;
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        const arquivo = e.dataTransfer.files?.[0];
        if (arquivo && !desativado) aoEscolher(arquivo);
      }}
    >
      <input
        ref={entrada}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) aoEscolher(arquivo);
          e.target.value = "";
        }}
      />
      {children(() => entrada.current?.click(), arrastando)}
    </div>
  );
}

/** As mensagens de baixo: conversão feita, aviso de resolução, erro. */
export function RecadosDoEnvio({
  conversao,
  aviso,
  erro,
}: {
  conversao: string | null;
  aviso: string | null;
  erro: string | null;
}) {
  if (!conversao && !aviso && !erro) return null;
  return (
    <div className="mt-2.5 space-y-1.5">
      {conversao ? (
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-verde-700)]">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {conversao}
        </p>
      ) : null}
      {aviso ? (
        <p className="flex gap-1.5 text-xs leading-relaxed text-[var(--color-ouro-700)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {aviso}
        </p>
      ) : null}
      {erro ? (
        <p role="alert" className="text-xs font-medium text-[var(--color-acento-forte)]">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- o campo */

/**
 * Campo de imagem do painel.
 *
 * Uma ficha só: a prévia em cima, e embaixo a medida ideal à esquerda e
 * as ações à direita. A medida mora dentro da ficha, e não solta ao lado
 * do rótulo, onde quebrava a linha e desalinhava o bloco.
 */
export function EnviarImagem({
  nome,
  valor,
  pasta,
  rotulo,
  apoio,
  larguraIdeal,
  alturaIdeal,
  tituloSobreposto,
  limite,
  fundoEscuro,
  encaixe = "cobrir",
}: {
  nome: string;
  valor: string | null;
  pasta: string;
  rotulo: string;
  apoio?: string;
  larguraIdeal?: number;
  alturaIdeal?: number;
  /** Texto que o site escreve por cima, para conferir a área segura. */
  tituloSobreposto?: string;
  limite?: number;
  /** Prévia sobre verde, para logo branca com fundo transparente. */
  fundoEscuro?: boolean;
  /** "conter" mostra a imagem inteira, sem corte (logo, planta). */
  encaixe?: "cobrir" | "conter";
}) {
  const envio = useEnvioDeImagem({ inicial: valor, pasta, larguraIdeal, limite });
  const { caminho, enviando } = envio;
  const proporcao =
    larguraIdeal && alturaIdeal ? `${larguraIdeal} / ${alturaIdeal}` : "16 / 10";

  return (
    <div className="min-w-0">
      <input type="hidden" name={nome} value={caminho ?? ""} />

      <div className="flex min-h-6 items-center gap-1.5">
        <span className="text-[0.8125rem] font-medium text-[var(--fg)]">{rotulo}</span>
        {apoio ? <Dica>{apoio}</Dica> : null}
      </div>

      <SeletorDeArquivo
        aoEscolher={envio.enviar}
        desativado={enviando}
        className="mt-1.5"
      >
        {(abrir, arrastando) => (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border bg-[var(--bg-elevado)] transition-[border-color,box-shadow] duration-200",
              arrastando
                ? "border-[var(--color-verde-700)] shadow-[0_0_0_4px_rgb(0_69_39/0.1)]"
                : "border-[var(--borda)]",
            )}
          >
            {/* --------------------------------------------- prévia */}
            <div
              className={cn(
                "relative max-h-[22rem] w-full overflow-hidden",
                fundoEscuro ? "bg-[var(--color-verde-900)]" : "xadrez",
              )}
              style={{ aspectRatio: proporcao }}
            >
              {caminho ? (
                <>
                  <Image
                    src={caminho}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className={encaixe === "conter" ? "object-contain p-6" : "object-cover"}
                  />
                  {tituloSobreposto ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/85 via-[var(--color-verde-950)]/10 to-transparent" />
                      <p className="font-display absolute right-4 bottom-3.5 left-4 line-clamp-2 text-base font-medium text-white sm:text-lg">
                        {tituloSobreposto}
                      </p>
                    </>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={abrir}
                  disabled={enviando}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--bg-elevado)] text-[var(--color-verde-800)] shadow-[var(--sombra-painel)]">
                    <ImageUp className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="text-sm font-medium text-[var(--fg)]">
                    {arrastando ? "Solte para enviar" : "Escolha ou arraste uma imagem"}
                  </span>
                  <span className="text-xs text-[var(--fg-tenue)]">
                    JPG, PNG, HEIC ou WebP. Vira WebP sozinha.
                  </span>
                </button>
              )}

              {enviando ? (
                <div className="absolute inset-0 grid place-items-center bg-[var(--color-verde-950)]/55 backdrop-blur-[2px]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-[var(--color-verde-950)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Convertendo e enviando…
                  </span>
                </div>
              ) : null}
            </div>

            {/* ----------------------------------------------- base */}
            <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--borda)] px-3 py-2">
              {larguraIdeal && alturaIdeal ? (
                <span className="tabular inline-flex items-center gap-1.5 text-xs text-[var(--fg-tenue)]">
                  <span className="rounded-md bg-[var(--bg-fundo)] px-1.5 py-0.5 font-medium text-[var(--fg-suave)]">
                    Ideal
                  </span>
                  {larguraIdeal} × {alturaIdeal} px
                </span>
              ) : null}

              <span className="ml-auto flex items-center gap-1">
                {caminho ? (
                  <button
                    type="button"
                    onClick={envio.remover}
                    disabled={enviando}
                    aria-label={`Remover ${rotulo.toLowerCase()}`}
                    title="Remover"
                    className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--color-acento)]/10 hover:text-[var(--color-acento-forte)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={abrir}
                  disabled={enviando}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] px-4 text-sm font-medium transition-colors hover:border-[var(--borda-forte)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  {caminho ? <RefreshCw className="h-4 w-4" /> : <ImageUp className="h-4 w-4" />}
                  {caminho ? "Trocar" : "Escolher"}
                </button>
              </span>
            </div>
          </div>
        )}
      </SeletorDeArquivo>

      <RecadosDoEnvio conversao={envio.conversao} aviso={envio.aviso} erro={envio.erro} />
    </div>
  );
}
