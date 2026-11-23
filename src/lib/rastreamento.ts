/**
 * Pixels, tags e scripts de rastreamento, como o painel grava e o site lê.
 *
 * Mora em site_settings.rastreamento, que só administrador edita (ver a
 * política "conteudo gerencia configuracoes", migração 0011).
 *
 * Cada identificador tem formato conhecido, e só o que casa com ele vai
 * para o HTML. Quem cola o trecho inteiro que o Meta ou o Google entrega,
 * em vez de só o número, não erra: o identificador é achado dentro do
 * trecho. Os scripts livres são a exceção, e por isso ficam no fim da
 * tela, com o aviso de que rodam em todas as páginas.
 */

export type Rastreamento = {
  meta_pixel: string;
  verificacao_meta: string;
  gtm: string;
  ga4: string;
  google_ads: string;
  google_ads_rotulo: string;
  verificacao_google: string;
  tiktok: string;
  script_head: string;
  script_body: string;
  /** LGPD: só carrega depois que a pessoa aceita. Ligado por padrão. */
  pedir_consentimento: boolean;
};

type CampoId = Exclude<keyof Rastreamento, "script_head" | "script_body" | "pedir_consentimento">;

/** O formato de cada identificador. `g` para achar dentro de um trecho colado. */
export const FORMATOS: Record<CampoId, { exato: RegExp; achar: RegExp; exemplo: string }> = {
  meta_pixel: { exato: /^\d{8,20}$/, achar: /\b\d{8,20}\b/, exemplo: "1234567890123456" },
  verificacao_meta: {
    exato: /^[a-z0-9]{20,60}$/,
    achar: /\b[a-z0-9]{20,60}\b/,
    exemplo: "abc123def456ghi789jkl012mno345",
  },
  gtm: { exato: /^GTM-[A-Z0-9]{4,12}$/, achar: /GTM-[A-Z0-9]{4,12}/, exemplo: "GTM-ABC1234" },
  ga4: { exato: /^G-[A-Z0-9]{4,14}$/, achar: /\bG-[A-Z0-9]{4,14}\b/, exemplo: "G-ABC123XYZ9" },
  google_ads: { exato: /^AW-\d{6,14}$/, achar: /AW-\d{6,14}/, exemplo: "AW-123456789" },
  google_ads_rotulo: {
    exato: /^[\w-]{6,40}$/,
    // No trecho do Google o rótulo vem depois da barra: AW-123/AbC-dEf
    achar: /(?<=AW-\d{6,14}\/)[\w-]{6,40}/,
    exemplo: "AbC-dEfGhIjK",
  },
  verificacao_google: {
    exato: /^[\w-]{20,80}$/,
    achar: /(?<=content=["'])[\w-]{20,80}(?=["'])/,
    exemplo: "AbCdEf123_GhIjKl456-MnOpQr789",
  },
  tiktok: { exato: /^[A-Z0-9]{12,30}$/, achar: /\b[A-Z0-9]{12,30}\b/, exemplo: "C1ABCDEFGH2IJKLMNOPQ" },
};

export const LIMITE_SCRIPT = 20000;

/** Um identificador limpo, ou vazio se nada no texto tiver o formato. */
export function limparId(campo: CampoId, bruto: unknown): string {
  const texto = typeof bruto === "string" ? bruto.trim() : "";
  if (!texto) return "";
  const { exato, achar } = FORMATOS[campo];
  if (exato.test(texto)) return texto;
  const achado = texto.match(achar)?.[0];
  return achado && exato.test(achado) ? achado : "";
}

export function lerRastreamento(valor: Record<string, unknown> | undefined): Rastreamento {
  const v = valor ?? {};
  const script = (x: unknown) => (typeof x === "string" ? x.slice(0, LIMITE_SCRIPT) : "");
  return {
    meta_pixel: limparId("meta_pixel", v.meta_pixel),
    verificacao_meta: limparId("verificacao_meta", v.verificacao_meta),
    gtm: limparId("gtm", v.gtm),
    ga4: limparId("ga4", v.ga4),
    google_ads: limparId("google_ads", v.google_ads),
    google_ads_rotulo: limparId("google_ads_rotulo", v.google_ads_rotulo),
    verificacao_google: limparId("verificacao_google", v.verificacao_google),
    tiktok: limparId("tiktok", v.tiktok),
    script_head: script(v.script_head),
    script_body: script(v.script_body),
    pedir_consentimento: v.pedir_consentimento !== false,
  };
}

/** Tem algo que rastreia? Sem nada, o aviso de cookies nem aparece. */
export function temRastreio(r: Rastreamento) {
  return Boolean(
    r.meta_pixel || r.gtm || r.ga4 || r.google_ads || r.tiktok || r.script_head.trim() || r.script_body.trim(),
  );
}
