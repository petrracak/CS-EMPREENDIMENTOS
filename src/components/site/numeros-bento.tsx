import Image from "next/image";
import {
  BuildingsIcon,
  CalendarCheckIcon,
  HandshakeIcon,
  HouseLineIcon,
  KeyIcon,
  MapTrifoldIcon,
  RulerIcon,
  SealCheckIcon,
  TrophyIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";

import { Contador } from "@/components/site/contador";
import { Simbolo } from "@/components/site/logo";
import { cn, partirNumero } from "@/lib/utils";

/**
 * Os números da CS, em bento.
 *
 * Duas tentativas anteriores não funcionaram: três cartões iguais com
 * ícone em cima (lia como gerado) e uma régua editorial sem ícone (fria
 * demais). O que o cliente gostou na referência Aurevant foi o bento —
 * peças de tamanhos diferentes, cada uma com um tratamento, e ícones
 * que se mexem. É isso aqui:
 *
 *   peça com foto     quando o número tem imagem no painel
 *   peça escura       verde da marca, numeral em dourado
 *   peça clara        papel, numeral em verde
 *
 * A foto real de uma obra da CS é o que mais afasta o bloco de modelo
 * pronto: ninguém gera "100 casas" em cima da vista aérea das 100 casas.
 *
 * Ícones do Phosphor, estilo duotone. Cada um tem um gesto próprio
 * (a chave gira, a casa sobe, o calendário carimba), que roda uma vez
 * quando a peça entra e de novo no hover.
 */

export const ICONES_NUMERO = {
  calendario: {
    Icone: CalendarCheckIcon,
    gesto: "carimbo",
    rotulo: "Calendário",
  },
  selo: { Icone: SealCheckIcon, gesto: "carimbo", rotulo: "Selo de garantia" },
  chave: { Icone: KeyIcon, gesto: "girar", rotulo: "Chave" },
  casa: { Icone: HouseLineIcon, gesto: "subir", rotulo: "Casa" },
  predio: { Icone: BuildingsIcon, gesto: "subir", rotulo: "Prédios" },
  pessoas: { Icone: UsersThreeIcon, gesto: "subir", rotulo: "Pessoas" },
  trofeu: { Icone: TrophyIcon, gesto: "carimbo", rotulo: "Troféu" },
  mapa: { Icone: MapTrifoldIcon, gesto: "subir", rotulo: "Mapa" },
  regua: { Icone: RulerIcon, gesto: "girar", rotulo: "Régua" },
  aperto: { Icone: HandshakeIcon, gesto: "carimbo", rotulo: "Aperto de mão" },
} as const;

export type ChaveIcone = keyof typeof ICONES_NUMERO;

// Ícone de reserva por posição, para quando o painel não disser nenhum.
const PADRAO: ChaveIcone[] = ["calendario", "chave", "casa"];

type Numero = {
  valor: string;
  texto: string;
  icone?: string | null;
  imagem?: string | null;
};

/* Larguras do bento. Em tela média, as duas primeiras dividem a linha e
   a terceira atravessa; em tela grande, as três ficam lado a lado com
   tamanhos diferentes — é a assimetria que dá o desenho de bento. */
const LARGURAS = [
  "md:col-span-6 lg:col-span-4",
  "md:col-span-6 lg:col-span-3",
  "md:col-span-12 lg:col-span-5",
];

export function NumerosBento({ numeros }: { numeros: Numero[] }) {
  const validos = numeros.filter((n) => n?.valor);
  if (!validos.length) return null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 sm:gap-4 md:grid-cols-12">
      {validos.map((numero, i) => {
        const chave = (
          numero.icone && numero.icone in ICONES_NUMERO
            ? numero.icone
            : PADRAO[i % PADRAO.length]
        ) as ChaveIcone;
        const { Icone, gesto } = ICONES_NUMERO[chave];
        const { antes, numero: valor, depois } = partirNumero(numero.valor);

        // A foto manda no tratamento; sem foto, escuro e claro alternam.
        const tom = numero.imagem ? "foto" : i % 2 === 0 ? "escuro" : "claro";

        return (
          <div
            key={i}
            data-revelar
            style={{ "--atraso": `${i * 120}ms` } as React.CSSProperties}
            className={cn("bento-peca", LARGURAS[i % LARGURAS.length])}
          >
            <div
              className={cn(
                "group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-2xl p-7 sm:min-h-[16rem] sm:p-8",
                "transition-[transform,box-shadow] duration-[800ms] [transition-timing-function:var(--ease-lento)]",
                "hover:-translate-y-1 hover:shadow-[0_24px_50px_-16px_rgb(1_38_22/0.35)]",
                tom === "escuro" && "bg-[var(--bg-tinta)] text-white",
                tom === "claro" &&
                  "border border-[var(--borda)] bg-[var(--bg-elevado)] text-[var(--fg)]",
                tom === "foto" && "bg-[var(--color-verde-900)] text-white",
              )}
            >
              {/* ---------------------------------------------- fundos */}
              {tom === "foto" && numero.imagem ? (
                <>
                  <Image
                    src={numero.imagem}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-[1600ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-[1.05]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[var(--color-verde-950)]/90 via-[var(--color-verde-950)]/40 to-[var(--color-verde-950)]/10"
                  />
                </>
              ) : null}

              {tom === "escuro" ? (
                <>
                  {/* Luz quente no canto, que cresce no hover. */}
                  <div
                    aria-hidden
                    className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(255_178_117/0.35),transparent_65%)] transition-transform duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-125"
                  />
                  <Simbolo className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-auto text-white/[0.05]" />
                </>
              ) : null}

              {tom === "claro" ? (
                <div
                  aria-hidden
                  className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(47_131_97/0.12),transparent_65%)] transition-transform duration-[1400ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-125"
                />
              ) : null}

              {/* -------------------------------------- ícone e índice */}
              <div className="relative flex items-start justify-between">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-2xl ring-1 transition-[transform,box-shadow] duration-[800ms] [transition-timing-function:var(--ease-lento)] group-hover:scale-105",
                    tom === "escuro" &&
                      "bg-white/[0.07] text-[var(--color-ouro-300)] ring-white/10 group-hover:shadow-[0_0_0_6px_rgb(243_214_148/0.08)]",
                    tom === "claro" &&
                      "bg-[var(--color-verde-50)] text-[var(--color-verde-700)] ring-[var(--color-verde-100)] group-hover:shadow-[0_0_0_6px_rgb(47_131_97/0.08)]",
                    tom === "foto" &&
                      "bg-white/15 text-white ring-white/25 backdrop-blur-md group-hover:shadow-[0_0_0_6px_rgb(255_255_255/0.1)]",
                  )}
                >
                  <Icone
                    size={28}
                    weight="duotone"
                    className={`icone-gesto icone-${gesto}`}
                  />
                </span>

                <span
                  className={cn(
                    "tabular text-[0.6875rem] font-semibold tracking-[0.2em]",
                    tom === "claro"
                      ? "text-[var(--color-ouro-600)]"
                      : "text-white/45",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* -------------------------------------- número e texto */}
              <div className="relative mt-10">
                <p className="font-display flex items-baseline gap-2 font-medium">
                  {antes ? (
                    <span
                      className={cn(
                        "text-lg",
                        tom === "claro"
                          ? "text-[var(--fg-tenue)]"
                          : "text-white/60",
                      )}
                    >
                      {antes}
                    </span>
                  ) : null}
                  <Contador
                    valor={valor}
                    className={cn(
                      "tabular text-[3.25rem] leading-[0.95] tracking-[-0.045em] sm:text-6xl",
                      tom === "escuro" && "destaque-ouro",
                      tom === "claro" && "destaque",
                    )}
                  />
                  {depois ? (
                    <span
                      className={cn(
                        "text-lg",
                        tom === "claro"
                          ? "text-[var(--fg-tenue)]"
                          : "text-white/60",
                      )}
                    >
                      {depois}
                    </span>
                  ) : null}
                </p>
                <p
                  className={cn(
                    "mt-3 max-w-[30ch] text-sm leading-relaxed",
                    tom === "claro"
                      ? "text-[var(--fg-suave)]"
                      : "text-white/75",
                  )}
                >
                  {numero.texto}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
