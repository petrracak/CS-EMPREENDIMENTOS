import { cn } from "@/lib/utils";

/**
 * Texto de campo longo do painel: quebra em parágrafos nas linhas vazias.
 * A CS escreve em caixa de texto comum, sem saber o que é HTML.
 */
export function Paragrafos({
  texto,
  className,
}: {
  texto: string | null | undefined;
  className?: string;
}) {
  if (!texto?.trim()) return null;
  const partes = texto.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className={cn("space-y-4", className)}>
      {partes.map((p, i) => (
        <p key={i} className="leading-relaxed text-[var(--fg-suave)]">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}

/**
 * Markdown bem reduzido para o conteúdo do blog: títulos com ##, itens
 * com -, negrito com ** e parágrafos. É o suficiente para o que a CS
 * escreve, e não traz nenhuma biblioteca junto.
 */
export function Markdown({ texto }: { texto: string | null | undefined }) {
  if (!texto?.trim()) return null;
  const blocos = texto.split(/\n\s*\n/).filter((b) => b.trim());

  return (
    <div className="space-y-6">
      {blocos.map((bloco, i) => {
        const limpo = bloco.trim();

        if (limpo.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display pt-4 text-2xl font-medium text-balance"
            >
              {limpo.slice(3)}
            </h2>
          );
        }

        if (limpo.startsWith("- ")) {
          const itens = limpo
            .split("\n")
            .map((l) => l.replace(/^-\s*/, "").trim())
            .filter(Boolean);
          return (
            <ul key={i} className="space-y-2.5">
              {itens.map((item, j) => (
                <li key={j} className="flex gap-3 text-[var(--fg-suave)]">
                  <span
                    aria-hidden
                    className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-acento)]"
                  />
                  <span className="leading-relaxed">
                    <Negrito texto={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-[var(--fg-suave)]">
            <Negrito texto={limpo} />
          </p>
        );
      })}
    </div>
  );
}

/** Converte **assim** em negrito, sem interpretar mais nada. */
function Negrito({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith("**") && parte.endsWith("**") ? (
          <strong key={i} className="font-semibold text-[var(--fg)]">
            {parte.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{parte}</span>
        ),
      )}
    </>
  );
}
