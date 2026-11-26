import Link from "next/link";
import { MapPin, Mail, Clock } from "lucide-react";

import { Facebook, Instagram, Whatsapp } from "@/components/icones-sociais";
import { Logo } from "@/components/site/logo";
import { listarEmpreendimentos } from "@/lib/queries";
import { lerConfig, lerEmpresa, txt } from "@/lib/settings";

export async function Rodape() {
  const [empresa, config, empreendimentos] = await Promise.all([
    lerEmpresa(),
    lerConfig("rodape"),
    listarEmpreendimentos(),
  ]);

  // Só os quatro primeiros cabem na coluna; o resto fica atrás do "Ver todos".
  const emDestaque = empreendimentos.slice(0, 4);

  return (
    <footer className="rodape text-[var(--fg-sobre-tinta)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* ---------------------------------------------- institucional */}
          <div className="lg:pr-6">
            <Logo variante="branca" className="h-12 w-auto" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {txt(
                config,
                "institucional",
                "Construímos casas e apartamentos em Santarém desde 2016.",
              )}
            </p>
          </div>

          {/* -------------------------------------------- empreendimentos */}
          <div>
            <h3 className="text-[0.9375rem] text-[var(--color-ouro-300)]">
              Empreendimentos
            </h3>
            <ul className="mt-3 space-y-0 text-sm">
              {emDestaque.map((e) => (
                <li key={e.id}>
                  <Link
                    prefetch={false}
                    href={`/empreendimentos/${e.slug}`}
                    className="inline-block py-2.5 text-white/60 transition-colors hover:text-white"
                  >
                    {e.nome}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  prefetch={false}
                  href="/empreendimentos"
                  className="inline-block py-2.5 font-medium text-white underline-offset-4 hover:underline"
                >
                  Ver todos
                </Link>
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------ fale conosco */}
          <div>
            <h3 className="text-[0.9375rem] text-[var(--color-ouro-300)]">
              Fale com a gente
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <span className="leading-relaxed">{empresa.endereco}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <a
                  href={`mailto:${empresa.email}`}
                  className="-my-2.5 inline-block py-2.5 break-all transition-colors hover:text-white"
                >
                  {empresa.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Whatsapp className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <a
                  href={empresa.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-my-2.5 inline-block py-2.5 transition-colors hover:text-white"
                >
                  {empresa.whatsapp}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                <span className="leading-relaxed">{empresa.atendimento}</span>
              </li>
            </ul>

            {empresa.maps ? (
              <a
                href={empresa.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                <MapPin className="h-3.5 w-3.5" />
                Ver no Google Maps
              </a>
            ) : null}
          </div>

          {/* ------------------------------------------------------ redes */}
          <div>
            <h3 className="text-[0.9375rem] text-[var(--color-ouro-300)]">
              Siga a CS
            </h3>
            <div className="mt-5 flex gap-3">
              {[
                {
                  href: empresa.instagram,
                  Icone: Instagram,
                  nome: "Instagram",
                },
                { href: empresa.facebook, Icone: Facebook, nome: "Facebook" },
                {
                  href: empresa.whatsapp_link,
                  Icone: Whatsapp,
                  nome: "WhatsApp",
                },
              ]
                .filter((r) => r.href)
                .map(({ href, Icone, nome }) => (
                  <a
                    key={nome}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={nome}
                    className="rounded-full border border-white/15 p-3 text-white/70 transition-all duration-500 [transition-timing-function:var(--ease-suave)] hover:-translate-y-0.5 hover:border-[var(--color-ouro-300)] hover:bg-white/5 hover:text-[var(--color-ouro-300)]"
                  >
                    <Icone className="h-4 w-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- linha legal */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {empresa.razao_social}. CNPJ {empresa.cnpj}
            </p>
            <p>{txt(config, "copyright")}</p>
          </div>
          <nav
            aria-label="Documentos"
            className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55"
          >
            <Link
              prefetch={false}
              href="/termos-de-uso"
              className="transition-colors hover:text-[var(--color-ouro-300)]"
            >
              Termos de uso e compromisso
            </Link>
            <Link
              prefetch={false}
              href="/politica-de-privacidade"
              className="transition-colors hover:text-[var(--color-ouro-300)]"
            >
              Política de privacidade
            </Link>
          </nav>
          {txt(config, "aviso") ? (
            <p className="mt-3 text-xs text-white/30">{txt(config, "aviso")}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
