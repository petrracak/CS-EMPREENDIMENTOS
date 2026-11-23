import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo da CS.
 *
 * Dois arquivos, não um com filtro: a versão colorida tem o verde e o
 * acento laranja da marca, e a branca é chapada para viver sobre tinta.
 * A proporção vem do viewBox do SVG (2426 x 518). O viewBox é recortado
 * rente ao desenho: a altura pedida na classe é a altura da marca, sem
 * margem embutida no arquivo.
 */
const VERSAO_DA_LOGO = 2;

export function Logo({
  variante = "colorida",
  className,
  prioridade = false,
}: {
  variante?: "colorida" | "branca";
  className?: string;
  prioridade?: boolean;
}) {
  return (
    <Image
      // A pasta /marca fica um dia no cache do navegador. Trocou o
      // desenho da logo, troque a versão, senão quem já visitou o site
      // continua vendo a antiga.
      src={`/marca/logo-${variante}.svg?v=${VERSAO_DA_LOGO}`}
      alt="CS Empreendimentos"
      width={2426}
      height={518}
      priority={prioridade}
      /* SVG não tem o que redimensionar, e o carregador do projeto escolhe
         entre dois tamanhos de WebP. Sem isto o Next avisa, com razão, que
         o carregador ignora a largura pedida — e ainda monta um srcset de
         1x e 2x apontando para o mesmo arquivo. */
      unoptimized
      className={cn("h-9 w-auto", className)}
    />
  );
}

/**
 * Só o símbolo, recortado do SVG do favicon. Serve de marca d'água e de
 * reserva quando um empreendimento ainda não tem foto.
 */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="278 150 299 556"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-auto", className)}
    >
      <path
        d="M474.03 255.931C475.848 255.781 478.78 255.587 480.481 256.183C512.66 267.463 544.286 281.24 576.266 292.995C577.308 316.161 576.437 345.975 576.458 369.647C543.35 360.915 510.12 351.05 477.022 342.008C447.659 351.552 415.202 359.932 386.492 369.999C385.866 383.484 386.234 400.147 386.209 413.897C395.716 411.355 413.968 408.154 424.453 406.274C441.07 403.295 463.606 397.372 480.106 397.185C483.29 397.149 500.265 401.257 504.184 402.166L548.605 412.51C556.821 414.425 568.211 417.418 576.332 418.38C576.777 437.352 576.411 457.622 576.409 476.681L576.536 606.972C555.298 609.121 533.295 610.343 511.971 612.093C496.24 613.384 481.732 614.647 465.958 614.13C424.983 611.314 380.109 607.942 339.209 606.468C339.436 581.158 339.463 555.847 339.29 530.537C351.455 530.507 363.304 529.205 375.328 528.99C407.153 528.422 438.931 526.371 470.739 525.414C489.827 524.841 510.327 528.515 529.375 528.536C529.275 513.385 529.312 498.234 529.487 483.083C505.736 482.771 482.799 476.616 459.068 481.125C451.361 482.589 441.562 483.333 433.684 484.27L339.194 495.501C340.175 453.503 338.935 410.285 339.387 368.171C339.583 349.836 337.721 329.758 339.118 311.285C344.783 307.304 371.79 297.475 379.636 294.166C410.683 281.077 443.154 269.321 474.03 255.931Z"
        fill="currentColor"
      />
      <path
        d="M475.117 151.033C477.093 150.973 479.286 150.902 481.116 151.759C507.047 163.908 532.723 176.628 558.625 188.85C564.528 191.636 570.499 194.424 576.21 197.573C577.045 216.668 576.435 239.747 576.416 259.136C543.469 247.665 509.792 231.871 477.296 220.466C452.183 229.504 419.745 244.663 394.097 255.178L349.973 273.439C344.03 275.856 328.12 281.877 323.305 284.922L322.559 535.887C322.569 555.606 322.675 575.383 322.534 595.098C322.454 606.276 321.434 616.159 321.922 627.508C333.092 627.427 352.022 629.876 363.835 631.073L431.397 637.699C448.061 639.381 471.279 642.892 487.52 641.484C506.714 639.822 527.314 638.482 546.324 635.975C556.461 635.084 566.163 633.913 576.399 633.166L576.436 690.091C569.279 690.3 556.154 692.809 548.813 694.03L502.421 701.833C491.013 703.754 480.218 706.423 468.653 704.452C457.395 702.534 446.099 700.673 434.825 698.857L330.336 681.539C317.393 679.395 289.717 674.091 278 673.53L278.009 245.025C343.592 214.885 409.867 182.168 475.117 151.033Z"
        fill="currentColor"
      />
    </svg>
  );
}
