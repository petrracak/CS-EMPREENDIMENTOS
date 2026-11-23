"use client";

// Molduras de aparelho em CSS puro (devices.css). Só esta tela carrega.
import "./aparelhos.css";

import Image from "next/image";
import {
  ArrowRight,
  CircleCheck,
  ImageUp,
  Laptop,
  Loader2,
  Menu,
  RefreshCw,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Dica } from "@/components/admin/dica";
import {
  RecadosDoEnvio,
  SeletorDeArquivo,
  useEnvioDeImagem,
} from "@/components/admin/enviar-imagem";
import { Whatsapp } from "@/components/icones-sociais";
import { Logo } from "@/components/site/logo";
import { classesDaPeca } from "@/components/site/palavras";
import { lerPalavras } from "@/lib/texto-rico";
import { cn } from "@/lib/utils";

/**
 * Fundo do topo da página inicial: uma foto para computador, outra para
 * celular, e a prévia das duas dentro dos aparelhos.
 *
 * A prévia desenha o topo do site de verdade, no tamanho real de cada
 * tela (1440 × 900 no notebook, 390 × 830 no iPhone), e só depois reduz
 * o conjunto para caber aqui. Assim o corte da foto e a posição do
 * título são os mesmos que o visitante vai ver, e não uma aproximação.
 *
 * Os textos da prévia acompanham os campos do formulário enquanto a
 * pessoa digita, antes mesmo de salvar.
 */

type Textos = {
  chamada: string;
  /** HTML mínimo do editor de título (ver lib/texto-rico.ts). */
  titulo: string;
  subtitulo: string;
  botao_primario: string;
  botao_secundario: string;
};

const CAMPOS: (keyof Textos)[] = [
  "chamada",
  "titulo",
  "subtitulo",
  "botao_primario",
  "botao_secundario",
];

export function FundoTopo({
  computador,
  celular,
  textos: iniciais,
}: {
  computador: string | null;
  celular: string | null;
  textos: Textos;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const [textos, setTextos] = useState(iniciais);

  const pc = useEnvioDeImagem({
    inicial: computador,
    pasta: "site",
    larguraIdeal: 2400,
    limite: 2400,
  });
  const cel = useEnvioDeImagem({
    inicial: celular,
    pasta: "site",
    larguraIdeal: 1080,
    limite: 2000,
  });

  // Os textos moram em outros campos do mesmo formulário.
  useEffect(() => {
    const form = raiz.current?.closest("form");
    if (!form) return;
    const ler = () => {
      const valor = (nome: string) => {
        const el = form.elements.namedItem(nome);
        return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
          ? el.value
          : "";
      };
      setTextos(
        Object.fromEntries(CAMPOS.map((c) => [c, valor(c)])) as Textos,
      );
    };
    form.addEventListener("input", ler);
    return () => form.removeEventListener("input", ler);
  }, []);

  const imagemPc = pc.caminho ?? cel.caminho;
  const imagemCel = cel.caminho ?? pc.caminho;
  const celularEmprestado = !cel.caminho && !!pc.caminho;

  return (
    <div ref={raiz} className="space-y-5">
      <input type="hidden" name="imagem_desktop" value={pc.caminho ?? ""} />
      <input type="hidden" name="imagem_mobile" value={cel.caminho ?? ""} />

      <Palco>
        <div
          className="absolute"
          style={{ left: 0, top: 70, width: 740, height: 434 }}
        >
          <Moldura aparelho="macbook-pro">
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ width: 1440, height: 900, transform: "scale(0.41389)" }}
            >
              <TelaDoTopo modo="computador" imagem={imagemPc} textos={textos} />
            </div>
          </Moldura>
        </div>

        <div
          className="absolute origin-top-left"
          style={{ left: 690, top: 40, width: 428, height: 868, transform: "scale(0.56)" }}
        >
          <Moldura aparelho="iphone-14-pro">
            <TelaDoTopo modo="celular" imagem={imagemCel} textos={textos} />
          </Moldura>
        </div>
      </Palco>

      {/* ------------------------------------------------ os dois envios */}
      <div className="grid gap-4 md:grid-cols-2">
        <Vaga
          titulo="Computador"
          Icone={Laptop}
          formato="Foto deitada (paisagem)"
          medida="2400 × 1350 px"
          dica="Aparece em notebooks e monitores, da largura da tela inteira. Prefira uma foto deitada, sem texto escrito nela."
          envio={pc}
          proporcao="16 / 9"
        />
        <Vaga
          titulo="Celular"
          Icone={Smartphone}
          formato="Foto em pé (retrato)"
          medida="1080 × 1920 px"
          dica="Aparece em telas com menos de 768 px de largura. É opcional: sem ela, o celular usa a foto do computador, cortada nas laterais."
          envio={cel}
          proporcao="9 / 16"
          observacao={celularEmprestado ? "Usando a foto do computador, cortada no centro." : undefined}
        />
      </div>

      {/* ---------------------------------------------------- orientações */}
      <div className="rounded-2xl border border-[var(--borda)] bg-[var(--bg)] p-4 sm:p-5">
        <p className="text-[0.8125rem] font-medium text-[var(--fg)]">
          Para a foto ficar boa no site
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm leading-relaxed text-[var(--fg-suave)] sm:grid-cols-2">
          {[
            "Sem texto escrito na foto. O título do site entra por cima, no canto de baixo à esquerda.",
            "Deixe a fachada ou a casa no centro e no alto. A parte de baixo recebe um véu escuro e o texto.",
            "Foto clara e nítida, de dia ou no fim da tarde. Render noturno fica escuro demais sob o véu.",
            "Qualquer formato serve: JPG, PNG, HEIC ou WebP. O painel converte para WebP e reduz o peso sozinho.",
          ].map((texto) => (
            <li key={texto} className="flex gap-2.5">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-verde-600)]" strokeWidth={1.8} />
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- moldura */

function Moldura({
  aparelho,
  children,
}: {
  aparelho: "macbook-pro" | "iphone-14-pro";
  children: React.ReactNode;
}) {
  return (
    <div aria-hidden className={`device device-${aparelho} device-spacegray`}>
      <div className="device-frame">
        <div className="device-screen overflow-hidden">{children}</div>
      </div>
      <div className="device-stripe" />
      <div className="device-header" />
      <div className="device-sensors" />
      <div className="device-btns" />
      <div className="device-power" />
      <div className="device-home" />
    </div>
  );
}

/* ---------------------------------------------------------------- palco */

/**
 * A cena tem 1000 × 580 px e é reduzida para a largura disponível. Com o
 * cursor por cima, inclina de leve na direção dele: o bastante para os
 * aparelhos ganharem volume, sem virar brinquedo.
 */
function Palco({ children }: { children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.6);
  const [giro, setGiro] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / 1000);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={caixa}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        setGiro({
          x: ((e.clientY - r.top) / r.height - 0.5) * -5,
          y: ((e.clientX - r.left) / r.width - 0.5) * 7,
        });
      }}
      onPointerLeave={() => setGiro({ x: 0, y: 0 })}
      className="palco-aparelhos relative w-full overflow-hidden rounded-2xl"
      style={{ height: 580 * escala, perspective: 1600 }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: 1000, height: 580, transform: `scale(${escala})` }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 [transition-timing-function:var(--ease-lento)]"
          style={{
            transform: `translate(40px, 0px) rotateX(${giro.x}deg) rotateY(${giro.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ o topo do site */

/**
 * O topo do site, redesenhado em tamanho fixo. Não reaproveita a página
 * real: lá as medidas mudam pela largura da janela (sm:, lg:), e aqui a
 * janela é o painel, não o aparelho.
 */
function TelaDoTopo({
  modo,
  imagem,
  textos,
}: {
  modo: "computador" | "celular";
  imagem: string | null;
  textos: Textos;
}) {
  const pc = modo === "computador";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--color-verde-900)] text-left">
      {imagem ? (
        <Image
          src={imagem}
          alt=""
          fill
          sizes={pc ? "1440px" : "390px"}
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <ImageUp className="h-16 w-16 text-white/15" strokeWidth={1.2} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/92 via-[var(--color-verde-950)]/35 via-55% to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-verde-950)]/55 to-transparent" />

      {/* cabeçalho */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex items-center justify-between",
          pc ? "h-24 px-12" : "h-[4.5rem] px-5 pt-8",
        )}
      >
        <Logo variante="branca" className={pc ? "h-12" : "h-10"} />
        {pc ? (
          <div className="flex items-center gap-8 text-sm font-medium text-white/85">
            <span>Início</span>
            <span>Empreendimentos</span>
            <span>Blog</span>
            <span>Cadastre-se</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-[var(--color-verde-900)]">
              <Whatsapp className="h-4 w-4" />
              Falar no WhatsApp
            </span>
          </div>
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white">
            <Menu className="h-5 w-5" />
          </span>
        )}
      </div>

      {/* texto */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0",
          pc ? "mx-auto max-w-6xl px-8 pb-28" : "px-5 pb-20",
        )}
      >
        <div className="max-w-3xl">
          {textos.chamada ? (
            <span className="olho text-[var(--color-ouro-300)] [&::before]:from-[var(--color-acento)] [&::before]:to-[var(--color-ouro-300)]">
              {textos.chamada}
            </span>
          ) : null}
          {/* Sem cn() aqui: o tailwind-merge lê text-display-xl como cor
              e descartaria o text-white. */}
          <p
            className={`font-display font-medium text-balance text-white ${
              pc ? "text-display-xl mt-6" : "text-display-md mt-5"
            }`}
          >
            {/* Palavra por palavra, como no site: o dourado é um
                gradiente recortado no texto, e numa quebra de linha ele
                se partiria entre as duas linhas. */}
            {lerPalavras(textos.titulo).map((palavra, i) => (
              <span key={i}>
                {palavra.map((peca, j) => (
                  <span key={j} className={classesDaPeca(peca, "ouro")}>
                    {peca.texto}
                  </span>
                ))}{" "}
              </span>
            ))}
          </p>
          {textos.subtitulo ? (
            <p
              className={cn(
                "max-w-xl leading-relaxed text-white/75",
                pc ? "mt-7 text-lg" : "mt-5 line-clamp-4 text-base",
              )}
            >
              {textos.subtitulo}
            </p>
          ) : null}
          <div className={cn("flex flex-wrap gap-3", pc ? "mt-9" : "mt-7")}>
            {textos.botao_primario ? (
              <span className="inline-flex h-12 items-center gap-2 rounded-full bg-white/95 px-6 text-sm font-medium text-[var(--color-verde-900)]">
                {textos.botao_primario}
                <ArrowRight className="h-4 w-4" />
              </span>
            ) : null}
            {textos.botao_secundario ? (
              <span className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-medium text-white">
                {textos.botao_secundario}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- vaga de envio */

function Vaga({
  titulo,
  Icone,
  formato,
  medida,
  dica,
  envio,
  proporcao,
  observacao,
}: {
  titulo: string;
  Icone: typeof Laptop;
  formato: string;
  medida: string;
  dica: string;
  envio: ReturnType<typeof useEnvioDeImagem>;
  proporcao: string;
  observacao?: string;
}) {
  const { caminho, enviando } = envio;

  return (
    <div className="min-w-0">
      <SeletorDeArquivo aoEscolher={envio.enviar} desativado={enviando}>
        {(abrir, arrastando) => (
          <div
            className={cn(
              "flex h-full items-stretch gap-4 rounded-2xl border bg-[var(--bg-elevado)] p-3 transition-[border-color,box-shadow] duration-200",
              arrastando
                ? "border-[var(--color-verde-700)] shadow-[0_0_0_4px_rgb(0_69_39/0.1)]"
                : "border-[var(--borda)]",
            )}
          >
            {/* miniatura, na proporção do aparelho */}
            <button
              type="button"
              onClick={abrir}
              disabled={enviando}
              aria-label={caminho ? `Trocar a foto do ${titulo.toLowerCase()}` : `Escolher a foto do ${titulo.toLowerCase()}`}
              className="xadrez relative grid w-24 shrink-0 place-items-center self-center overflow-hidden rounded-xl border border-[var(--borda)] sm:w-28"
              style={{ aspectRatio: proporcao, maxHeight: "8.5rem" }}
            >
              {caminho ? (
                <Image src={caminho} alt="" fill sizes="112px" className="object-cover" />
              ) : (
                <ImageUp className="h-5 w-5 text-[var(--fg-tenue)]" strokeWidth={1.7} />
              )}
              {enviando ? (
                <span className="absolute inset-0 grid place-items-center bg-[var(--color-verde-950)]/55">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </span>
              ) : null}
            </button>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icone className="h-4 w-4 text-[var(--color-verde-800)]" strokeWidth={1.8} />
                  <span className="text-sm font-medium">{titulo}</span>
                  <Dica>{dica}</Dica>
                </div>
                <p className="mt-1 text-xs text-[var(--fg-tenue)]">{formato}</p>
                <p className="tabular mt-0.5 text-xs text-[var(--fg-tenue)]">
                  <span className="mr-1 rounded-md bg-[var(--bg-fundo)] px-1.5 py-0.5 font-medium text-[var(--fg-suave)]">
                    Ideal
                  </span>
                  {medida}
                </p>
                {observacao ? (
                  <p className="mt-1.5 text-xs text-[var(--color-ouro-700)]">{observacao}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={abrir}
                  disabled={enviando}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--borda)] bg-[var(--bg-elevado)] px-4 text-sm font-medium transition-colors hover:border-[var(--borda-forte)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  {enviando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : caminho ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <ImageUp className="h-4 w-4" />
                  )}
                  {enviando ? "Enviando…" : caminho ? "Trocar" : "Escolher"}
                </button>
                {caminho ? (
                  <button
                    type="button"
                    onClick={envio.remover}
                    disabled={enviando}
                    aria-label={`Remover a foto do ${titulo.toLowerCase()}`}
                    title="Remover"
                    className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] transition-colors hover:bg-[var(--color-acento)]/10 hover:text-[var(--color-acento-forte)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </SeletorDeArquivo>
      <RecadosDoEnvio conversao={envio.conversao} aviso={envio.aviso} erro={envio.erro} />
    </div>
  );
}
