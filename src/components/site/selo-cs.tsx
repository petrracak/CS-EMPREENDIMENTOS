import { Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

/**
 * O selo redondo da CS: o símbolo no centro e o nome girando devagar em
 * volta, num anel.
 *
 * Só o anel gira, e quem gira é o <svg> inteiro (uma caixa do HTML), não
 * um grupo dentro dele: assim a rotação fica com a placa de vídeo e não
 * custa nada à página. Para quem pediu menos movimento, fica parado.
 *
 * Duas cores: "verde" (selo verde, letras douradas) para fundos claros e
 * fotos; "creme" (selo creme, letras verdes) para o verde da marca.
 */
const TEXTO = "CS EMPREENDIMENTOS · SANTARÉM · DESDE 2016 · ";

export function SeloCS({
  cor = "verde",
  className,
}: {
  cor?: "verde" | "creme";
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("selo-cs", `selo-cs-${cor}`, className)}>
      <svg viewBox="0 0 200 200" className="selo-cs-anel">
        <defs>
          <path
            id="selo-cs-caminho"
            d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0"
          />
        </defs>
        <circle cx="100" cy="100" r="99" className="selo-cs-fundo" />
        <circle cx="100" cy="100" r="58" className="selo-cs-fio" />
        <circle cx="100" cy="100" r="92" className="selo-cs-fio" />
        <text className="selo-cs-texto">
          <textPath
            href="#selo-cs-caminho"
            textLength="468"
            lengthAdjust="spacing"
          >
            {TEXTO}
          </textPath>
        </text>
      </svg>
      <Simbolo className="selo-cs-simbolo" />
    </div>
  );
}
