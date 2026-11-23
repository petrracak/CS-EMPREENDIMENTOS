"use client";

import { Check, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";

import {
  salvarRastreamento,
  type EstadoRastreamento,
} from "@/app/actions/rastreamento";
import { Interruptor } from "@/components/admin/bloco-conteudo";
import { Aviso, Campo, Cartao, Entrada, Area, BarraSalvar, Salvar } from "@/components/admin/ui";
import { FORMATOS, limparId, type Rastreamento } from "@/lib/rastreamento";
import { cn } from "@/lib/utils";

type CampoId = keyof typeof FORMATOS;

/** Campo de identificador que mostra, enquanto digita, se o formato bate. */
function CampoId({
  campo,
  rotulo,
  apoio,
  valor,
}: {
  campo: CampoId;
  rotulo: string;
  apoio: string;
  valor: string;
}) {
  const [texto, setTexto] = useState(valor);
  const achado = limparId(campo, texto);
  const preenchido = texto.trim() !== "";

  return (
    <div>
      <Campo rotulo={rotulo} apoio={apoio}>
        <Entrada
          name={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={FORMATOS[campo].exemplo}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="font-mono"
        />
      </Campo>
      {preenchido ? (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs",
            achado ? "text-[var(--color-verde-700)]" : "text-[var(--color-acento-forte)]",
          )}
        >
          {achado ? <Check className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
          {achado
            ? achado === texto.trim()
              ? "Formato certo"
              : `Vai ser usado: ${achado}`
            : `Não parece um código válido. Exemplo: ${FORMATOS[campo].exemplo}`}
        </p>
      ) : null}
    </div>
  );
}

function Secao({
  titulo,
  texto,
  ativo,
  children,
}: {
  titulo: string;
  texto: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Cartao className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--borda)] px-5 py-4 sm:px-7">
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight font-medium tracking-[-0.01em]">{titulo}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--fg-tenue)]">{texto}</p>
        </div>
        <span
          className={cn(
            "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            ativo
              ? "bg-[var(--color-verde-50)] text-[var(--color-verde-800)]"
              : "bg-[var(--bg-fundo)] text-[var(--fg-tenue)]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              ativo ? "bg-[var(--color-verde-600)]" : "bg-[var(--fg-tenue)]",
            )}
          />
          {ativo ? "Ligado" : "Desligado"}
        </span>
      </div>
      <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-7">{children}</div>
    </Cartao>
  );
}

export function FormRastreamento({ valor }: { valor: Rastreamento }) {
  const [estado, acao] = useActionState<EstadoRastreamento, FormData>(salvarRastreamento, {});

  return (
    <form action={acao} className="space-y-5">
      <Secao
        titulo="Meta (Facebook e Instagram)"
        texto="O pixel mede quem veio dos anúncios e quem se cadastrou. A verificação prova ao Meta que o domínio é da CS."
        ativo={Boolean(valor.meta_pixel)}
      >
        <CampoId
          campo="meta_pixel"
          rotulo="ID do pixel"
          apoio="No Gerenciador de Eventos do Meta, em Fontes de dados. Só números. Pode colar o código inteiro do pixel: o número é achado nele."
          valor={valor.meta_pixel}
        />
        <CampoId
          campo="verificacao_meta"
          rotulo="Verificação de domínio"
          apoio="No Gerenciador de Negócios, em Segurança da marca → Domínios → Verificar por meta-tag. Cole a tag ou só o código."
          valor={valor.verificacao_meta}
        />
      </Secao>

      <Secao
        titulo="Google"
        texto="Use o Tag Manager se a agência configurar tudo por ele. Sem ele, preencha Analytics e Ads direto aqui."
        ativo={Boolean(valor.gtm || valor.ga4 || valor.google_ads)}
      >
        <CampoId
          campo="gtm"
          rotulo="Google Tag Manager"
          apoio="O código do contêiner, que começa com GTM-."
          valor={valor.gtm}
        />
        <CampoId
          campo="ga4"
          rotulo="Google Analytics 4"
          apoio="O ID de métricas do fluxo da web, que começa com G-."
          valor={valor.ga4}
        />
        <CampoId
          campo="google_ads"
          rotulo="Google Ads"
          apoio="O ID da tag do Google Ads, que começa com AW-."
          valor={valor.google_ads}
        />
        <CampoId
          campo="google_ads_rotulo"
          rotulo="Rótulo da conversão (cadastro)"
          apoio="Na ação de conversão do Ads, o trecho depois da barra em AW-123456789/AbCdEf. Com ele, cada cadastro no site conta como conversão."
          valor={valor.google_ads_rotulo}
        />
        <CampoId
          campo="verificacao_google"
          rotulo="Verificação do Search Console"
          apoio="Em Search Console → Adicionar propriedade → Tag HTML. Cole a tag ou só o código."
          valor={valor.verificacao_google}
        />
      </Secao>

      <Secao
        titulo="TikTok"
        texto="Para quando a CS anunciar no TikTok."
        ativo={Boolean(valor.tiktok)}
      >
        <CampoId
          campo="tiktok"
          rotulo="ID do pixel"
          apoio="No TikTok Ads Manager, em Ferramentas → Eventos. Pode colar o código inteiro."
          valor={valor.tiktok}
        />
      </Secao>

      <Cartao className="overflow-hidden">
        <div className="border-b border-[var(--borda)] px-5 py-4 sm:px-7">
          <h2 className="font-display text-lg leading-tight font-medium tracking-[-0.01em]">
            Outros scripts
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--fg-tenue)]">
            Para ferramentas que não estão acima (Hotjar, Clarity, LinkedIn, chat…). Cole o código
            como a ferramenta entrega.
          </p>
        </div>
        <div className="space-y-5 px-5 py-6 sm:px-7">
          <Aviso tipo="erro">
            O que for colado aqui roda em todas as páginas do site. Use só código de ferramenta
            conhecida, vindo da própria ferramenta ou da agência. Um script errado pode deixar o
            site lento ou quebrado.
          </Aviso>
          <Campo rotulo="No <head>" apoio="Onde a maioria das ferramentas pede para colar.">
            <Area
              name="script_head"
              rows={6}
              defaultValue={valor.script_head}
              spellCheck={false}
              autoCapitalize="none"
              className="font-mono text-base sm:text-xs"
              placeholder="<script>…</script>"
            />
          </Campo>
          <Campo rotulo="No fim do <body>" apoio="Para o que a ferramenta pedir que vá no corpo da página.">
            <Area
              name="script_body"
              rows={4}
              defaultValue={valor.script_body}
              spellCheck={false}
              autoCapitalize="none"
              className="font-mono text-base sm:text-xs"
              placeholder="<script>…</script>"
            />
          </Campo>
        </div>
      </Cartao>

      <Cartao className="p-5 sm:p-7">
        <Interruptor
          nome="pedir_consentimento"
          rotulo="Pedir consentimento de cookies (LGPD)"
          apoio="Ligado, os pixels e scripts só carregam depois que o visitante aceita, num aviso discreto no rodapé. É o que a LGPD pede. Desligado, carregam direto."
          padrao={valor.pedir_consentimento}
        />
      </Cartao>

      <BarraSalvar>
        <Salvar />
        {estado.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-verde-600)]">
            <Check className="h-4 w-4" />
            Salvo e publicado no site
          </span>
        ) : null}
        {estado.erro ? <span className="text-sm text-[var(--color-acento-forte)]">{estado.erro}</span> : null}
        {estado.ok && estado.ignorados?.length ? (
          <span className="text-sm text-[var(--color-acento-forte)]">
            Ficou de fora por não ter o formato certo: {estado.ignorados.join(", ")}.
          </span>
        ) : null}
      </BarraSalvar>
    </form>
  );
}
