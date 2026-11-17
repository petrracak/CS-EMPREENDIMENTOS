import { FormConta } from "@/components/admin/form-conta";
import { exigirPerfil } from "@/lib/auth";

export default async function PaginaConta() {
  const perfil = await exigirPerfil();

  return (
    <>
      <header>
        <h1 className="font-display text-2xl font-medium">Minha conta</h1>
        <p className="mt-1.5 text-sm text-[var(--fg-tenue)]">
          {perfil.email}
        </p>
      </header>

      <div className="mt-8">
        <FormConta nome={perfil.nome} />
      </div>
    </>
  );
}
