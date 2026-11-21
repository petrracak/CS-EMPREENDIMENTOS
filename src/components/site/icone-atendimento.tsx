import { HeadsetIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

/**
 * O headset da faixa de contato.
 *
 * O ícone é o Headset do Phosphor, em duotone. A versão anterior era
 * desenhada à mão, pequena, com ondas finas, e lia como improviso.
 *
 * O movimento vem de três camadas, cada uma num ritmo:
 *   um arco dourado que gira em volta do círculo (6 s, constante)
 *   um halo quente atrás, que respira (3,6 s)
 *   o próprio headset, flutuando dois pixels (4,2 s)
 *
 * Ritmos diferentes de propósito: nunca coincidem, então o conjunto não
 * "bate" num compasso — parece vivo em vez de mecânico.
 */
export function IconeAtendimento({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "atendimento relative grid h-24 w-24 place-items-center sm:h-28 sm:w-28",
        className,
      )}
    >
      <span className="atendimento-halo absolute inset-0 rounded-full" />
      <span className="atendimento-arco absolute inset-0 rounded-full" />
      <span className="absolute inset-[6px] rounded-full bg-white/[0.06] ring-1 ring-white/15 backdrop-blur-sm" />
      <HeadsetIcon
        weight="duotone"
        className="atendimento-fone relative h-12 w-12 text-[var(--color-ouro-300)] sm:h-14 sm:w-14"
      />
    </span>
  );
}
