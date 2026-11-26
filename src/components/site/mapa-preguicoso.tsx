"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * O mapa do Google só é carregado quando chega perto da tela. Embutido
 * direto, ele baixa uns 600 KB de JavaScript assim que a página abre,
 * mesmo lá embaixo, e isso pesava mais que todo o resto da ficha.
 */
export function MapaPreguicoso({
  src,
  titulo,
}: {
  src: string;
  titulo: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPerto(true);
          observador.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={caixa} className="absolute inset-0">
      {perto ? (
        <iframe
          title={titulo}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[#ebfff6] text-[#2c6149]">
          <MapPin className="h-8 w-8" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
