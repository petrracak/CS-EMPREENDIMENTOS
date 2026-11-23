"use client";

import { getImageProps } from "next/image";

/**
 * A foto de fundo do topo, com uma imagem para computador e outra para
 * celular.
 *
 * É um <picture> com <source media>, e não duas <Image> escondidas por
 * CSS: com display:none o navegador baixa as duas mesmo assim. Aqui ele
 * escolhe uma pela largura da tela e baixa só ela.
 *
 * O corte acontece em 768 px, o mesmo ponto em que o site troca o menu
 * pelo botão de celular.
 *
 * É componente de cliente porque o carregador de imagens do projeto é de
 * cliente; ainda assim sai pronto no HTML do servidor, sem esperar o JS.
 */
export function FotoDoTopo({
  computador,
  celular,
  className,
}: {
  computador: string;
  celular?: string | null;
  className?: string;
}) {
  const comum = { alt: "", fill: true, sizes: "100vw" } as const;

  const {
    props: { srcSet: srcComputador, ...img },
  } = getImageProps({
    ...comum,
    src: computador,
    priority: true,
    fetchPriority: "high",
    className,
  });

  // <img> cru de propósito: getImageProps já passou pelo carregador do
  // site, e o <picture> precisa do elemento nativo dentro dele.
  if (!celular || celular === computador) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img srcSet={srcComputador} {...img} alt="" />;
  }

  const {
    props: { srcSet: srcCelular },
  } = getImageProps({ ...comum, src: celular });

  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={srcCelular} />
      <source media="(min-width: 768px)" srcSet={srcComputador} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img srcSet={srcComputador} {...img} alt="" />
    </picture>
  );
}
