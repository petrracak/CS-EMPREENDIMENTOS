"use client";

import {
  Check,
  Download,
  EllipsisVertical,
  Share,
  SquarePlus,
  Smartphone,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { classeBotao } from "@/components/admin/estilos";
import { cn } from "@/lib/utils";

/**
 * Instalar o painel como aplicativo no celular.
 *
 * - Android (Chrome, Edge, Samsung): o navegador avisa que dá para
 *   instalar (beforeinstallprompt) e o botão abre a janela nativa. Sem
 *   esse aviso, mostra o passo a passo pelo menu ⋮.
 * - iPhone e iPad (Safari): a Apple não deixa site nenhum abrir a
 *   instalação; o botão mostra o passo a passo pelo Compartilhar.
 * - Já instalado (aberto como app): o botão some.
 *
 * O registro do service worker também fica aqui, porque só o painel usa
 * (escopo /admin): é o que deixa o app abrir rápido e mostrar um aviso
 * quando a internet cai, em vez da tela de erro do navegador.
 */

type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let eventoGuardado: EventoInstalar | null = null;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoGuardado = e as EventoInstalar;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    eventoGuardado = null;
    avisar();
  });
}

function assinar(f: () => void) {
  ouvintes.add(f);
  const consulta = window.matchMedia("(display-mode: standalone)");
  consulta.addEventListener("change", f);
  return () => {
    ouvintes.delete(f);
    consulta.removeEventListener("change", f);
  };
}

type Situacao = {
  instalado: boolean;
  podeAbrirJanela: boolean;
  sistema: "ios" | "android" | "outro";
};

let ultima: Situacao | null = null;
function lerSituacao(): Situacao {
  const ua = navigator.userAgent;
  const ios =
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const nova: Situacao = {
    instalado:
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    podeAbrirJanela: Boolean(eventoGuardado),
    sistema: ios ? "ios" : /Android/.test(ua) ? "android" : "outro",
  };
  // useSyncExternalStore pede o mesmo objeto enquanto nada mudou.
  if (
    ultima &&
    ultima.instalado === nova.instalado &&
    ultima.podeAbrirJanela === nova.podeAbrirJanela &&
    ultima.sistema === nova.sistema
  )
    return ultima;
  ultima = nova;
  return nova;
}

export function useInstalacao() {
  return useSyncExternalStore(assinar, lerSituacao, () => null);
}

/** Registra o service worker do painel, depois que a página carrega. */
export function RegistrarApp() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    const registrar = () =>
      navigator.serviceWorker
        .register("/sw-painel.js", { scope: "/admin" })
        .catch(() => {});
    if (document.readyState === "complete") registrar();
    else {
      window.addEventListener("load", registrar, { once: true });
      return () => window.removeEventListener("load", registrar);
    }
  }, []);
  return null;
}

/**
 * O botão de instalar. `aparencia` muda só o desenho: "menu" para a lista
 * do celular e a lateral, "cartao" para o aviso do início do painel.
 */
export function BotaoInstalar({
  aparencia = "menu",
  aoAbrir,
}: {
  aparencia?: "menu" | "lateral" | "cartao";
  aoAbrir?: () => void;
}) {
  const situacao = useInstalacao();
  const [tutorial, setTutorial] = useState(false);

  const instalar = useCallback(async () => {
    aoAbrir?.();
    if (eventoGuardado) {
      await eventoGuardado.prompt();
      const escolha = await eventoGuardado.userChoice;
      if (escolha.outcome === "accepted") {
        eventoGuardado = null;
        avisar();
      }
      return;
    }
    setTutorial(true);
  }, [aoAbrir]);

  if (!situacao || situacao.instalado) return null;

  return (
    <>
      {aparencia === "cartao" ? (
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--borda)] bg-white p-4 sm:p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/painel/icone-192.png"
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="font-normal text-[#28513f]">
              Painel no celular, como aplicativo
            </p>
            <p className="mt-0.5 text-sm text-[var(--fg-tenue)]">
              Instale na tela inicial e abra direto no painel, sem procurar o
              site.
            </p>
          </div>
          <button
            type="button"
            onClick={instalar}
            className={classeBotao("principal", "shrink-0")}
          >
            <Download className="h-4 w-4" />
            Instalar
          </button>
        </div>
      ) : aparencia === "lateral" ? (
        <button
          type="button"
          onClick={instalar}
          className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-[var(--borda)] bg-white p-3 text-left transition-colors hover:border-[var(--borda-forte)]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ebfff6] text-[#004527]">
            <Download className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Instalar o painel</span>
            <span className="block text-xs text-[var(--fg-tenue)]">
              Como aplicativo
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={instalar}
          className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-2 text-left transition-colors active:bg-[var(--bg-fundo)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ebfff6] text-[#004527]">
            <Download className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-medium">
              Instalar o painel
            </span>
            <span className="block text-sm text-[var(--fg-tenue)]">
              Abrir como aplicativo
            </span>
          </span>
        </button>
      )}

      {tutorial ? (
        <Tutorial
          sistema={situacao.sistema}
          aoFechar={() => setTutorial(false)}
        />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------ tutorial */

const PASSOS: Record<
  "ios" | "android",
  { Icone: typeof Share; texto: React.ReactNode }[]
> = {
  ios: [
    {
      Icone: Share,
      texto: (
        <>
          No <strong>Safari</strong>, toque no botão{" "}
          <strong>Compartilhar</strong>, o quadrado com a seta para cima, na
          barra de baixo (no iPad, no alto).
        </>
      ),
    },
    {
      Icone: SquarePlus,
      texto: (
        <>
          Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.
        </>
      ),
    },
    {
      Icone: Check,
      texto: (
        <>
          Confira o nome <strong>Painel CS</strong> e toque em{" "}
          <strong>Adicionar</strong>. O ícone aparece na tela do celular e abre
          direto no painel.
        </>
      ),
    },
  ],
  android: [
    {
      Icone: EllipsisVertical,
      texto: (
        <>
          No <strong>Chrome</strong>, toque nos <strong>três pontinhos</strong>{" "}
          no canto de cima.
        </>
      ),
    },
    {
      Icone: Download,
      texto: (
        <>
          Toque em <strong>Instalar app</strong> (em alguns celulares aparece{" "}
          <strong>Adicionar à tela inicial</strong>).
        </>
      ),
    },
    {
      Icone: Check,
      texto: (
        <>
          Confirme em <strong>Instalar</strong>. O ícone do{" "}
          <strong>Painel CS</strong> aparece na tela e abre direto no painel.
        </>
      ),
    },
  ],
};

function Tutorial({
  sistema,
  aoFechar,
}: {
  sistema: Situacao["sistema"];
  aoFechar: () => void;
}) {
  const janela = useRef<HTMLDialogElement>(null);
  const [aba, setAba] = useState<"ios" | "android">(
    sistema === "android" ? "android" : "ios",
  );

  useEffect(() => {
    janela.current?.showModal();
  }, []);

  return (
    <dialog
      ref={janela}
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) janela.current?.close();
      }}
      aria-label="Como instalar o painel"
      className="instalar-tutorial fixed inset-x-0 bottom-0 m-0 mt-auto w-full max-w-none rounded-t-[1.75rem] border-0 bg-[var(--painel-fundo)] p-0 pb-[env(safe-area-inset-bottom)] backdrop:bg-[rgb(1_38_22/0.55)] backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-[1.75rem]"
    >
      <div className="px-5 pt-3 pb-6 sm:px-7 sm:pt-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--borda-forte)] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/painel/icone-192.png"
              alt=""
              className="h-11 w-11 rounded-xl"
            />
            <div>
              <p className="text-lg font-light tracking-[-0.04em] text-[#28513f]">
                Instalar o painel
              </p>
              <p className="text-sm text-[var(--fg-tenue)]">
                Leva menos de um minuto
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => janela.current?.close()}
            aria-label="Fechar"
            className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-tenue)] hover:bg-[var(--bg-fundo)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          role="tablist"
          className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-[var(--bg-fundo)] p-1"
        >
          {(["ios", "android"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={aba === s}
              onClick={() => setAba(s)}
              className={cn(
                "flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm transition-colors",
                aba === s
                  ? "bg-white text-[#28513f] shadow-sm"
                  : "text-[var(--fg-tenue)]",
              )}
            >
              <Smartphone className="h-4 w-4" />
              {s === "ios" ? "iPhone" : "Android"}
            </button>
          ))}
        </div>

        <ol className="mt-5 space-y-3">
          {PASSOS[aba].map(({ Icone, texto }, i) => (
            <li
              key={i}
              className="flex gap-3.5 rounded-2xl border border-[var(--borda)] bg-white p-4"
            >
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ebfff6] text-[#004527]">
                <Icone className="h-5 w-5" strokeWidth={1.7} />
                <span className="absolute -top-1.5 -left-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#004527] text-[0.6875rem] text-white">
                  {i + 1}
                </span>
              </span>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--fg-suave)] [&_strong]:font-medium [&_strong]:text-[#28513f]">
                {texto}
              </p>
            </li>
          ))}
        </ol>

        {aba === "ios" && sistema === "ios" ? (
          <p className="mt-4 text-xs leading-relaxed text-[var(--fg-tenue)]">
            Só funciona no Safari. Se abriu o painel por outro app (WhatsApp,
            Instagram), toque em abrir no Safari primeiro.
          </p>
        ) : null}
        {sistema === "outro" ? (
          <p className="mt-4 text-xs leading-relaxed text-[var(--fg-tenue)]">
            Abra o painel no celular para instalar. No computador, o Chrome e o
            Edge mostram um ícone de instalar na barra de endereço.
          </p>
        ) : null}
      </div>
    </dialog>
  );
}
