import { FormPost } from "@/components/admin/form-post";
import { Cabecalho } from "@/components/admin/ui";
import { exigirPerfil } from "@/lib/auth";

export default async function NovaPublicacao() {
  await exigirPerfil();

  return (
    <div className="space-y-8">
      <Cabecalho voltar={{ href: "/admin/blog", rotulo: "Blog" }} titulo="Nova publicação" />
      <FormPost post={{}} />
    </div>
  );
}
