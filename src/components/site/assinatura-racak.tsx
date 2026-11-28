/**
 * "Desenvolvido por Racak Studio", no pé do rodapé, levando ao Instagram
 * do estúdio. Versão melhorada da assinatura da Garniplay.
 *
 * O ícone da Racak tem simetria de 45°: girado um oitavo de volta, fica
 * idêntico a si mesmo. Então ele dá um "tique" de 45° de tempos em
 * tempos, e o laço emenda sem salto nenhum. Parado, é creme e discreto,
 * no tom do rodapé. No hover (ou no foco do teclado) o ícone e o nome
 * ganham o degradê da marca (roxo, rosa, amarelo), o ícone gira de vez e
 * um fio no mesmo degradê corre por baixo do nome.
 *
 * Quem pediu menos movimento vê o ícone parado (ver .assinatura-racak em
 * globals.css).
 */
const ICONE =
  "M320.861 264.046L251.717 219.51L209.294 23.35L317.388 0L361.019 201.746L320.861 264.096V264.046ZM416.273 457.136L353.873 416.928L309.337 486.072L350.149 674.733L458.243 651.383L416.273 457.136ZM218.604 422.765L110.409 590.643L203.356 650.578L309.337 486.122L292.177 406.863L218.554 422.765H218.604ZM471.428 30.4455L361.019 201.695L376.921 275.318L456.18 258.208L564.375 90.3301L471.428 30.4455ZM87.2604 113.529L27.3255 206.476L195.153 314.671L268.827 298.719L251.717 219.51L87.2604 113.529ZM479.53 366.353L400.271 383.463L416.223 457.186L587.473 567.545L647.408 474.598L479.53 366.403V366.353ZM0 356.842L23.35 464.936L218.554 422.715L260.926 356.993L195.153 314.621L0 356.842ZM651.383 216.037L456.18 258.259L413.808 323.981L479.53 366.353L674.733 324.132L651.383 216.037Z";

export function AssinaturaRacak() {
  return (
    <a
      href="https://www.instagram.com/petr_racak"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Desenvolvido por Racak Studio (abre o Instagram)"
      className="assinatura-racak"
    >
      <span className="assinatura-racak-por">Desenvolvido por</span>
      <span className="assinatura-racak-marca">
        <span className="assinatura-racak-icone" aria-hidden>
          <svg viewBox="0 0 675 675">
            <defs>
              <linearGradient
                id="racak-degrade"
                x1="0"
                y1="337"
                x2="675"
                y2="337"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A900FF" />
                <stop offset="0.5" stopColor="#FF5379" />
                <stop offset="1" stopColor="#FEB012" />
              </linearGradient>
            </defs>
            {/* Duas cópias do desenho: a creme, de sempre, e a em degradê
                por cima, que aparece no hover. Trocar a opacidade anima;
                trocar o fill de cor para degradê não anima. */}
            <path d={ICONE} className="assinatura-racak-liso" />
            <path
              d={ICONE}
              fill="url(#racak-degrade)"
              className="assinatura-racak-cor"
            />
          </svg>
        </span>
        <span className="assinatura-racak-nome">Racak Studio</span>
      </span>
    </a>
  );
}
