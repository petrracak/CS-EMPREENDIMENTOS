/**
 * Marcador: o preparo das imagens originais (recorte, redimensionamento e
 * conversão para WebP) foi feito uma vez, no Python, a partir das
 * apresentações em PDF e das pastas do Drive. O script fica aqui apenas
 * como registro do que foi aplicado:
 *
 *   1. Imagem com transparência é achatada sobre branco e recortada até a
 *      área totalmente opaca — as apresentações trazem renders mascarados
 *      em losango, e o recorte devolve o retângulo útil.
 *   2. Duas saídas por foto, como o carregador de imagem espera:
 *        nome.webp      até 1600 px  — ficha e galeria
 *        nome-sm.webp   até 640 px   — cards e listagens
 *   3. Qualidade 82: abaixo disso o céu dos renders ao pôr do sol fica
 *      com faixas visíveis.
 *
 * Daqui em diante quem envia foto é a Carolina, pelo painel, e o preparo
 * acontece no servidor (ver src/lib/enviar-fotos.ts).
 */
export {};
