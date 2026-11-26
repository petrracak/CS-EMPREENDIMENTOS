"use client";

import { CircleCheck, Eye, Laptop, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Moldura, Palco, Vaga } from "@/components/admin/aparelhos";
import { useEnvioDeImagem } from "@/components/admin/enviar-imagem";
import { classeBotao } from "@/components/admin/estilos";
import {
  CartaoDoBanner,
  FORMATO_CELULAR,
  FORMATO_COMPUTADOR,
  type DadosBanner,
} from "@/components/site/banner-campanha";

/**
 * As artes do banner de campanha, as medidas para o designer e a prévia
 * nos aparelhos, que abre numa janela por cima do painel.
 *
 * A prévia desenha o pop-up do site no tamanho real de cada tela (1440 ×
 * 900 no notebook, 390 × 844 no iPhone) e só depois reduz o conjunto,
 * então o tamanho da arte e dos botões é o que o visitante vai ver. Os
 * textos acompanham os campos enquanto a pessoa digita, antes de salvar.
 */

type Textos = Pick<DadosBanner, "descricao" | "botao" | "fechar">;

export function ArtesDoBanner({
  computador,
  celular,
  textos: iniciais,
}: {
  computador: string | null;
  celular: string | null;
  textos: Textos;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const janela = useRef<HTMLDialogElement>(null);
  const [textos, setTextos] = useState(iniciais);

  const pc = useEnvioDeImagem({
    inicial: computador,
    pasta: "campanhas",
    larguraIdeal: 1920,
    limite: 1920,
    formatoIdeal: { largura: 1920, altura: 1080 },
  });
  const cel = useEnvioDeImagem({
    inicial: celular,
    pasta: "campanhas",
    larguraIdeal: 1080,
    limite: 1350,
    formatoIdeal: { largura: 1080, altura: 1350 },
  });

  // Os textos moram em outros campos do mesmo formulário.
  useEffect(() => {
    const form = raiz.current?.closest("form");
    if (!form) return;
    const ler = () => {
      const valor = (nome: string) => {
        const el = form.elements.namedItem(nome);
        return el instanceof HTMLInputElement ? el.value : "";
      };
      setTextos({
        descricao: valor("descricao"),
        botao: valor("botao"),
        fechar: valor("botao_fechar"),
      });
    };
    form.addEventListener("input", ler);
    return () => form.removeEventListener("input", ler);
  }, []);

  const dados: DadosBanner = {
    computador: pc.caminho ?? "",
    celular: cel.caminho,
    descricao: textos.descricao,
    botao: textos.botao || "Quero saber mais",
    botaoUrl: "#",
    fechar: textos.fechar || "Agora não",
  };

  return (
    <div ref={raiz} className="space-y-5">
      <input type="hidden" name="imagem_desktop" value={pc.caminho ?? ""} />
      <input type="hidden" name="imagem_mobile" value={cel.caminho ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <Vaga
          titulo="Computador"
          Icone={Laptop}
          formato="Arte deitada, 16:9"
          medida="1920 × 1080 px"
          dica="É a arte principal: sem ela o banner não aparece. Notebooks e monitores mostram esta, com até 1100 px de largura na tela."
          envio={pc}
          proporcao="16 / 9"
        />
        <Vaga
          titulo="Celular"
          Icone={Smartphone}
          formato="Arte em pé, 4:5 (opcional)"
          medida="1080 × 1350 px"
          dica="Aparece em telas com menos de 768 px de largura. Sem ela, o celular mostra a arte do computador inteira, na largura da tela, e ela fica pequena."
          envio={cel}
          proporcao="4 / 5"
          observacao={
            !cel.caminho && pc.caminho
              ? "Sem arte própria: o celular usa a do computador."
              : undefined
          }
        />
      </div>

      {/* ------------------------------------------ medidas para o designer */}
      <div className="rounded-2xl border border-[var(--borda)] bg-[var(--bg)] p-4 sm:p-5">
        <p className="text-[0.8125rem] font-medium text-[var(--fg)]">
          Para passar ao designer
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm leading-relaxed text-[var(--fg-suave)] sm:grid-cols-2">
          {[
            "Computador em 1920 × 1080 px (16:9). Celular em 1080 × 1350 px (4:5).",
            "Textos e logos a pelo menos 100 px das bordas. No canto de cima à direita fica o botão de fechar.",
            "Não desenhe botão na arte. O botão da campanha e o de fechar entram embaixo dela, de verdade.",
            "JPG, PNG ou WebP. O painel converte e reduz o peso sozinho.",
          ].map((texto) => (
            <li key={texto} className="flex gap-2.5">
              <CircleCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-verde-600)]"
                strokeWidth={1.8}
              />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => janela.current?.showModal()}
        className={classeBotao("neutro")}
      >
        <Eye className="h-4 w-4" strokeWidth={1.8} />
        Ver no notebook e no celular
      </button>

      {/* ------------------------------------------------ janela da prévia */}
      <dialog
        ref={janela}
        aria-label="Prévia do banner nos aparelhos"
        onClick={(e) => {
          if (e.target === e.currentTarget) janela.current?.close();
        }}
        className="previa-banner m-auto w-[min(72rem,calc(100vw-1.5rem))] max-w-none rounded-[1.5rem] border-0 bg-[var(--painel-fundo)] p-0 shadow-2xl backdrop:bg-[rgb(1_38_22/0.6)] backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--borda)] px-5 py-4 sm:px-7">
          <div>
            <p className="text-lg font-light tracking-[-0.03em] text-[#28513f]">
              Como o banner aparece no site
            </p>
            <p className="mt-0.5 text-sm text-[var(--fg-tenue)]">
              No tamanho real de cada tela. Os botões não funcionam aqui.
            </p>
          </div>
          <button
            type="button"
            onClick={() => janela.current?.close()}
            className={classeBotao("neutro")}
          >
            <X className="h-4 w-4" />
            Fechar
          </button>
        </div>

        <div className="p-4 sm:p-7">
          <Palco>
            <div
              className="absolute"
              style={{ left: 0, top: 70, width: 740, height: 434 }}
            >
              <Moldura aparelho="macbook-pro">
                <div
                  className="absolute top-0 left-0 origin-top-left"
                  style={{
                    width: 1440,
                    height: 900,
                    transform: "scale(0.41389)",
                  }}
                >
                  <TelaComBanner dados={dados} modo="computador" />
                </div>
              </Moldura>
            </div>
            <div
              className="absolute origin-top-left"
              style={{
                left: 690,
                top: 40,
                width: 428,
                height: 868,
                transform: "scale(0.56)",
              }}
            >
              <Moldura aparelho="iphone-14-pro">
                <TelaComBanner dados={dados} modo="celular" />
              </Moldura>
            </div>
          </Palco>
        </div>
      </dialog>
    </div>
  );
}

/**
 * A tela do aparelho: o topo do site esmaecido atrás, como fica com o
 * pop-up aberto, e o cartão do banner no meio, na largura que o site
 * calcularia para aquela tela.
 */
function TelaComBanner({
  dados,
  modo,
}: {
  dados: DadosBanner;
  modo: "computador" | "celular";
}) {
  const pc = modo === "computador";
  const largura = pc ? 1440 : 390;
  const altura = pc ? 900 : 844;
  const formato = pc
    ? FORMATO_COMPUTADOR
    : dados.celular
      ? FORMATO_CELULAR
      : FORMATO_COMPUTADOR;
  // A mesma conta de .banner-campanha em globals.css.
  const cartao = pc
    ? Math.min(1100, largura - 64, (altura - 64 - 88) * formato)
    : Math.min(largura - 24, (altura - 24 - 132) * formato);

  return (
    // inert: na prévia nada é clicável nem recebe foco.
    <div
      inert
      className="site relative h-full w-full overflow-hidden bg-[#ebfff6]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/site/topo-fundo.webp"
        alt=""
        className="absolute top-0 max-w-none"
        style={pc ? { left: 0, width: 1464 } : { left: -330, width: 1100 }}
      />
      <div
        className="absolute rounded-lg bg-[rgb(0_69_39/0.68)]"
        style={
          pc
            ? { left: 108, right: 108, top: 16, height: 72 }
            : { left: 12, right: 12, top: 56, height: 64 }
        }
      />
      <div className="absolute inset-0 bg-[rgb(1_38_22/0.72)] backdrop-blur-[6px]" />

      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          paddingTop: pc ? 0 : 60,
          ["--formato-celular" as string]: formato,
        }}
      >
        <div style={{ width: cartao }}>
          {dados.computador || dados.celular ? (
            <CartaoDoBanner dados={dados} modo={modo} />
          ) : (
            <div className="banner-cartao" data-modo={modo}>
              <div
                className="grid place-items-center bg-[#ebfff6] text-center text-[#49836a]"
                style={{ aspectRatio: formato, fontSize: pc ? 28 : 16 }}
              >
                Arte do{" "}
                {pc ? "computador, 1920 × 1080" : "celular, 1080 × 1350"}
              </div>
              <div className="h-20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
