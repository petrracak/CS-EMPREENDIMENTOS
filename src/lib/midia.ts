const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/midia`;

/**
 * Monta a URL de uma foto a partir do caminho guardado no banco.
 *
 * O banco guarda só o caminho dentro do balde
 * ("empreendimentos/house-premium-residence/house-entrada.webp"), e cada
 * foto existe em três tamanhos:
 *   o caminho como está   até 1600 px no lado maior
 *   "-md" antes de .webp  680 px de largura (celular de tela densa)
 *   "-sm" antes de .webp  até 640 px no lado maior (miniatura)
 *
 * Um caminho que já comece com "/" ou "http" passa direto: é arquivo de
 * public/ ou link externo, e não tem versão pequena.
 */
export function urlDaMidia(
  caminho: string | null | undefined,
  {
    pequena = false,
    tamanho = pequena ? "sm" : "grande",
  }: { pequena?: boolean; tamanho?: "sm" | "md" | "grande" } = {},
): string {
  if (!caminho) return "";
  if (caminho.startsWith("http") || caminho.startsWith("/")) return caminho;

  const alvo =
    tamanho === "grande"
      ? caminho
      : caminho.replace(/\.webp$/, `-${tamanho}.webp`);
  return `${BASE}/${alvo}`;
}
