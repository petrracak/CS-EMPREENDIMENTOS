/* Service worker do painel da CS (escopo /admin).
 *
 * Deixa o painel instalável no celular e mais rápido: os arquivos do
 * build (que têm hash no nome e nunca mudam) e os ícones vêm do aparelho
 * depois da primeira visita. Página e dado do painel NUNCA entram em
 * cache: dependem de sessão, e num aparelho compartilhado um poderia ver
 * o que é do outro. Sem internet, o painel mostra um aviso em vez da
 * tela de erro do navegador.
 *
 * Trocar VERSAO limpa tudo o que ficou para trás.
 */
const VERSAO = "v1";
const ESTATICO = `painel-estatico-${VERSAO}`;

const OFFLINE = `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f3faf6">
<title>Sem conexão</title>
<style>
 body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f3faf6;color:#28513f;
      font-family:system-ui,-apple-system,sans-serif;padding:24px;text-align:center}
 h1{font-weight:300;letter-spacing:-.04em;font-size:1.75rem;margin:16px 0 8px}
 p{color:#393939;line-height:1.55;max-width:32ch;margin:0 auto 20px}
 img{width:64px;height:64px;border-radius:16px}
 button{min-height:48px;padding:0 22px;border:0;border-radius:12px;background:#004527;color:#fff;font-size:16px}
</style>
<div>
  <img src="/painel/icone-192.png" alt="">
  <h1>Sem conexão</h1>
  <p>O painel precisa de internet para mostrar e salvar os dados. Assim que voltar, toque em tentar de novo.</p>
  <button onclick="location.reload()">Tentar de novo</button>
</div>`;

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(ESTATICO)
      .then((cache) =>
        cache.addAll(["/painel/icone-192.png", "/painel/icone-512.png"]).catch(() => undefined),
      ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((n) => n.startsWith("painel-") && !n.endsWith(VERSAO))
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Build do Next e ícones: imutáveis, servidos do aparelho.
  const estatico =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/painel/") ||
    url.pathname.startsWith("/marca/") ||
    url.pathname.startsWith("/site/");
  if (estatico) {
    evento.respondWith(
      caches.match(req).then(
        (guardado) =>
          guardado ||
          fetch(req).then((rede) => {
            if (rede.ok) {
              const copia = rede.clone();
              caches.open(ESTATICO).then((c) => c.put(req, copia));
            }
            return rede;
          }),
      ),
    );
    return;
  }

  // Páginas do painel: sempre da rede. Sem internet, o aviso.
  if (req.mode === "navigate") {
    evento.respondWith(
      fetch(req).catch(
        () =>
          new Response(OFFLINE, {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }),
      ),
    );
  }
});
