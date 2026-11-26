/**
 * Esqueleto que aparece no mesmo instante do toque, enquanto a página
 * chega. O menu e as barras já estão na tela; só este miolo troca. É o
 * que faz o painel parecer aplicativo no celular, em vez de site que
 * fica parado esperando.
 */
function Bloco({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[var(--borda)]/70 ${className}`}
    />
  );
}

export default function Carregando() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2.5">
        <Bloco className="h-9 w-56 !rounded-lg" />
        <Bloco className="h-4 w-72 max-w-full !rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Bloco className="h-32" />
        <Bloco className="h-32" />
        <Bloco className="h-32" />
        <Bloco className="h-32" />
      </div>
      <Bloco className="h-48" />
      <Bloco className="h-40" />
    </div>
  );
}
