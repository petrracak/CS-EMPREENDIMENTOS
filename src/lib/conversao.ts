/**
 * Conta um cadastro do site como conversão em cada ferramenta ligada no
 * painel (Pixels e scripts). Ferramenta que não carregou — desligada ou
 * recusada no aviso de cookies — simplesmente não existe na janela, e
 * a chamada não faz nada.
 */
type Janela = Window & {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
  ttq?: { track?: (...args: unknown[]) => void };
  dataLayer?: unknown[];
  __csConversaoAds?: string;
};

export function registrarConversao(origem: string) {
  const w = window as Janela;
  try {
    w.fbq?.("track", "Lead", { content_name: origem });
    w.gtag?.("event", "generate_lead", { origem });
    if (w.__csConversaoAds) w.gtag?.("event", "conversion", { send_to: w.__csConversaoAds });
    w.ttq?.track?.("SubmitForm", { content_name: origem });
    // Para quem monta as tags no Tag Manager: o gatilho é o evento "cadastro".
    w.dataLayer?.push({ event: "cadastro", origem });
  } catch {
    // Medir não pode atrapalhar o cadastro, que já foi feito.
  }
}
