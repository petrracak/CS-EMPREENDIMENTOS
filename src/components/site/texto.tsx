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
