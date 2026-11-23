"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

import type { Rastreamento as Config } from "@/lib/rastreamento";
import { cn } from "@/lib/utils";

/**
 * Pixels, tags e scripts do painel (Pixels e scripts).
 *
 * Com o consentimento ligado, nada carrega antes de a pessoa aceitar o
 * aviso de cookies — é o que a LGPD pede. Tudo com afterInteractive:
 * rastreio não atrasa a foto do topo.
 *
 * Os identificadores chegam aqui já conferidos (lib/rastreamento.ts), por
 * isso podem entrar no texto dos scripts. Os scripts livres entram como o
 * administrador colou.
 */

const CHAVE = "cs:cookies";
const EVENTO = "cs:cookies";

type Consentimento = "aceito" | "recusado" | null;

function assinar(aoMudar: () => void) {
  window.addEventListener(EVENTO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function ler(): Consentimento {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

function responder(resposta: Exclude<Consentimento, null>) {
  try {
    localStorage.setItem(CHAVE, resposta);
  } catch {
    /* segue sem lembrar */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

/** "carregando" no servidor e no primeiro desenho: nem aviso, nem pixel. */
function useConsentimento(): Consentimento | "carregando" {
  return useSyncExternalStore(assinar, ler, () => "carregando" as const);
}

/* ------------------------------------------------- scripts colados */

const injetados = new Set<string>();

/**
 * Script colado no painel. <script> posto por innerHTML não roda; por
 * createContextualFragment, roda. Uma vez por carregamento de página: o
 * site troca de página sem recarregar, e o script não pode duplicar.
 */
function ScriptLivre({ html, onde }: { html: string; onde: "head" | "body" }) {
  useEffect(() => {
    const chave = `${onde}:${html}`;
    if (!html.trim() || injetados.has(chave)) return;
    injetados.add(chave);
    try {
      const alvo = onde === "head" ? document.head : document.body;
      alvo.appendChild(document.createRange().createContextualFragment(html));
    } catch {
      // Código colado com erro não pode derrubar o site.
    }
  }, [html, onde]);
  return null;
}

/* --------------------------------------------------------- pixels */

function Pixels({ c }: { c: Config }) {
  const googleTag = c.ga4 || c.google_ads;
  const conversaoAds =
    c.google_ads && c.google_ads_rotulo ? `${c.google_ads}/${c.google_ads_rotulo}` : "";

  return (
    <>
      {conversaoAds ? (
        <Script id="cs-conversao" strategy="afterInteractive">
          {`window.__csConversaoAds=${JSON.stringify(conversaoAds)};`}
        </Script>
      ) : null}

      {c.gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${c.gtm}');`}
        </Script>
      ) : null}

      {googleTag ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTag}`}
            strategy="afterInteractive"
          />
          <Script id="gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;gtag('js',new Date());
${c.ga4 ? `gtag('config','${c.ga4}');` : ""}
${c.google_ads ? `gtag('config','${c.google_ads}');` : ""}`}
          </Script>
        </>
      ) : null}

      {c.meta_pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${c.meta_pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {c.tiktok ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${c.tiktok}');ttq.page();}(window,document,'ttq');`}
        </Script>
      ) : null}

      <ScriptLivre html={c.script_head} onde="head" />
      <ScriptLivre html={c.script_body} onde="body" />
    </>
  );
}

/* --------------------------------------------------- aviso de cookies */

function AvisoCookies() {
  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className={cn(
        "fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-[var(--borda)] bg-[var(--bg-elevado)]/95 p-4 shadow-[0_18px_40px_-16px_rgb(1_38_22/0.45)] backdrop-blur-xl",
        "pb-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-5 sm:flex sm:items-center sm:gap-4 sm:pb-4",
        "motion-safe:animate-[aviso-sobe_0.6s_var(--ease-saida)_both]",
      )}
    >
      <p className="text-sm leading-relaxed text-[var(--fg-suave)]">
        Usamos cookies para medir as visitas e melhorar os nossos anúncios. Você pode recusar sem
        perder nada do site.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => responder("recusado")}
          className="min-h-11 flex-1 rounded-full border border-[var(--borda)] px-4 text-sm font-medium text-[var(--fg-suave)] transition-colors hover:bg-[var(--bg-fundo)] sm:flex-none"
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => responder("aceito")}
          className="min-h-11 flex-1 rounded-full bg-[var(--color-verde-900)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-verde-800)] sm:flex-none"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}

export function Rastreamento({ config }: { config: Config }) {
  const consentimento = useConsentimento();

  if (!config.pedir_consentimento) return <Pixels c={config} />;
  if (consentimento === "carregando") return null;
  if (consentimento === null) return <AvisoCookies />;
  return consentimento === "aceito" ? <Pixels c={config} /> : null;
}
