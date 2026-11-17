import { Navegacao } from "@/components/admin/navegacao";
import { exigirPerfil } from "@/lib/auth";

export default async function LayoutDoPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirPerfil();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] lg:flex-row">
      <Navegacao nome={perfil.nome} email={perfil.email} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
