const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/midia`;

/**
 * Monta a URL de uma foto a partir do caminho guardado no banco.
 *
 * O banco guarda só o caminho dentro do balde
 * ("empreendimentos/house-premium-residence/house-entrada.webp"), e cada
 * foto existe em dois tamanhos: o caminho como está, até 1600px, e o
 * mesmo caminho com "-sm" antes da extensão, até 640px.
 *
 * Um caminho que já comece com "/" ou "http" passa direto: é arquivo de
 * public/ ou link externo, e não tem versão pequena.
 */
export function urlDaMidia(
  caminho: string | null | undefined,
  { pequena = false }: { pequena?: boolean } = {},
): string {
  if (!caminho) return "";
  if (caminho.startsWith("http") || caminho.startsWith("/")) return caminho;

  const alvo = pequena ? caminho.replace(/\.webp$/, "-sm.webp") : caminho;
  return `${BASE}/${alvo}`;
}
