# Site da CS Empreendimentos

Site institucional e painel de administração da CS Construções e Serviços
Imobiliários, de Santarém (PA).

## O que é

A CS é construtora, não imobiliária. O conteúdo tem dois níveis, e é essa a
diferença que atravessa todo o projeto:

```
Empreendimento (House Premium Residence)
  └── Unidade (Casa 06 · 143 m² · R$ … · Disponível)
```

O site público mostra os empreendimentos e, dentro de cada um, o catálogo de
unidades. O painel deixa a CS editar tudo isso — e também o conteúdo do
próprio site: banner da página inicial, títulos, textos dos botões e faixa de
campanha.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run dev
```

O painel fica em `/admin`.

## Stack

- **Next.js 16** (App Router, Turbopack) e React 19
- **Tailwind 4**, com os tokens da marca em `src/app/globals.css`
- **Supabase** para banco, autenticação e armazenamento de imagens
- **Switzer** (Fontshare), servida pelo próprio site, em `src/fontes`

## Estrutura

```
src/
  app/
    (site)/        páginas públicas
    admin/         painel
    actions/       Server Actions (o que escreve no banco)
  components/
    site/          componentes do site público
    admin/         componentes do painel
  lib/             consultas, configurações, utilidades
supabase/
  migrations/      o banco, em ordem
```

## Decisões que valem saber

**Campo vazio não aparece.** Valor, registro de incorporação, previsão de
entrega: enquanto a CS não preencher, o campo some do site junto com o
rótulo, em vez de virar "R$ 0,00" ou "a consultar". A regra está em
`textoUtil` e `formatarValor`, em `src/lib/utils.ts`.

**Nada nasce escondido.** O HTML que sai do servidor tem todo o
conteúdo visível. Depois que o JavaScript carrega, o componente
`Revelar` (`src/components/site/revelar.tsx`) esconde só o que está
abaixo da tela, marcando `data-oculto`, e tira a marca quando a pessoa
rola até lá — é quando a transição do CSS roda. Um MutationObserver faz
a mesma triagem nas páginas que o React troca sem recarregar. A
primeira dobra usa `data-entrada`, que é animação de CSS pura e corre
no carregamento. Se o JS falhar ou demorar, o site aparece inteiro, só
sem animação. `data-palavras` divide a frase e anima palavra por
palavra, saindo de um desfoque; o componente é
`src/components/site/palavras.tsx`.

**Entrada por fora, hover por dentro.** As regras de entrada
(`data-revelar`, `data-quadro`) definem a `transition` inteira do
elemento. Num elemento que também tem hover, elas apagam a transição do
hover, e o zoom e a sombra passam a trocar de uma vez. Por isso todo card
tem três camadas: um invólucro com a entrada, o `CartaoVivo` com o hover
e o conteúdo dentro — e o `data-quadro` fica na moldura da foto, não na
foto. Em desenvolvimento, o `Revelar` avisa no console se alguém juntar
os dois no mesmo elemento.

**Rolagem em camadas.** O topo da página inicial e da ficha é um palco
parado (sticky); o resto sobe por cima, numa `.cortina`. A dobra do
Girlan fica presa enquanto os destaques passam por cima (`Empilhada` e
`.sobrepor`). Texto saindo e foto escurecendo são animações ligadas à
rolagem, em CSS; onde o navegador não tem suporte, o resto funciona sem
elas. No celular a seção presa é desligada.

**A duração do hover é um ajuste só.** `--default-transition-duration` e
`--default-transition-timing-function`, no `@theme` de `globals.css`,
valem para todo utilitário `transition-*` do Tailwind. O padrão da
biblioteca é 150 ms, que no site lê como corte; aqui são 420 ms com uma
curva que chega devagar.

**Os ícones das redes são os oficiais.** Vêm do Simple Icons (CC0), que é
dependência de desenvolvimento: o desenho é copiado para
`src/components/icones-sociais.tsx` na geração, em vez de carregar 5 MB de
índice para usar três marcas. Marca de rede social não se redesenha — a
forma é registrada e o olho reconhece a diferença.

**Imagens em dois tamanhos.** Cada foto é guardada como `foto.webp` (até
1600px) e `foto-sm.webp` (até 640px). O carregador em `src/lib/image-loader.ts`
escolhe qual servir, sem passar pelo otimizador da Vercel — que no plano free
responde 402 quando a cota acaba e faz as imagens sumirem.

**O redimensionamento é no navegador.** `src/lib/preparar-imagem.ts` reduz e
converte antes de subir, o que evita a dependência nativa (sharp) no deploy e
não sobe 8 MB de foto de celular para reduzir do outro lado.

**Conteúdo editável em `site_settings`.** Uma linha por bloco do site, em
jsonb. O formulário do painel manda campos achatados (`numeros.0.valor`) e a
Server Action remonta o objeto — assim a CS nunca vê JSON.

## Dados do cliente

O briefing, a ata e as apresentações ficam fora do repositório. O
`.gitignore` já cobre `material-do-cliente/` e `acessos-locais.md`.
