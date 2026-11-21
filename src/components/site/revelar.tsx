"use client";

import { useEffect } from "react";

const ALVOS = '[data-revelar], [data-palavras="rolagem"], [data-quadro]';

/**
 * As animações que acontecem ao rolar a página.
 *
 * O conteúdo chega VISÍVEL do servidor. Este componente, depois que o
 * JavaScript carrega, esconde só o que está abaixo da tela (marcando
 * data-oculto) e tira a marca quando o bloco chega perto — é aí que a
 * transição do CSS roda e o bloco entra.
 *
 * Era o contrário até a versão anterior, e isso quebrava duas coisas:
 *
 * 1. No F5 e em internet lenta, tudo abaixo do topo ficava em branco
 *    até o pacote de JS inteiro baixar e o React hidratar.
 * 2. Navegando entre páginas pelo próprio site, os blocos da página
 *    nova não apareciam nunca. Este componente fica no layout, que não
 *    remonta entre páginas, e só tinha olhado a primeira.
 *
 * O primeiro problema some porque nada depende do JS para existir. O
 * segundo, porque um MutationObserver acompanha o que o React insere
 * na página: cada bloco novo passa pela mesma triagem, na hora em que
 * entra no documento e antes de ser pintado.
 *
 * Só esconde o que está ABAIXO da tela. O que está à vista fica como
 * está, e o que já ficou para trás (um F5 no meio da página restaura a
 * rolagem) também — ninguém precisa ver de novo a entrada de um bloco
 * por onde já passou.
 *
 * E esconder acontece depois da hidratação, nunca antes. Marcar o HTML
 * antes de o React assumir faria ele acusar diferença entre servidor e
 * cliente.
 */
export function Revelar() {
  useEffect(() => {
    // Quem pediu menos movimento, ou navegador sem o observador, fica
    // com tudo à vista — que já é o estado do HTML.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    // Armadilha que já custou três rodadas de ajuste: as regras de
    // entrada definem a `transition` inteira do elemento, então num
    // elemento que também tem hover elas apagam a transição do hover.
    // Em desenvolvimento, quem cair nela fica sabendo na hora.
    if (process.env.NODE_ENV !== "production") {
      document.querySelectorAll(ALVOS).forEach((el) => {
        if (/(^|\s)(transition|duration-)/.test(el.getAttribute("class") ?? "")) {
          console.warn(
            "[Revelar] Este elemento tem animação de entrada E transição " +
              "própria — a de entrada vai apagar a outra. Ponha a entrada " +
              "num invólucro por fora (ver card-empreendimento.tsx).",
            el,
          );
        }
      });
    }

    const vistos = new WeakSet<Element>();

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.removeAttribute("data-oculto");
          observador.unobserve(entrada.target);
        }
      },
      // Começa um pouco antes de o bloco encostar na tela, para a
      // entrada já estar andando quando ele aparece — sem adiantar tanto
      // que a animação termine antes de alguém ver.
      { rootMargin: "0px 0px 15% 0px", threshold: 0 },
    );

    const preparar = (el: Element) => {
      if (vistos.has(el)) return;
      vistos.add(el);

      // Só o que está abaixo da dobra. Medir aqui força o layout, mas é
      // uma vez por bloco e na hora em que ele entra no documento.
      if (el.getBoundingClientRect().top < window.innerHeight) return;

      el.setAttribute("data-oculto", "");
      observador.observe(el);
    };

    const varrer = (raiz: Element) => {
      if (raiz.matches(ALVOS)) preparar(raiz);
      raiz.querySelectorAll(ALVOS).forEach(preparar);
    };

    varrer(document.body);

    // A navegação entre páginas troca o conteúdo sem recarregar. O
    // callback roda antes da próxima pintura, então o bloco novo abaixo
    // da tela some antes de alguém chegar a vê-lo.
    const vigia = new MutationObserver((mudancas) => {
      for (const mudanca of mudancas) {
        mudanca.addedNodes.forEach((no) => {
          if (no instanceof Element) varrer(no);
        });
      }
    });
    vigia.observe(document.body, { childList: true, subtree: true });

    return () => {
      vigia.disconnect();
      observador.disconnect();
    };
  }, []);

  return null;
}
