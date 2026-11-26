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

**O design está em dois invólucros.** `.site` (layout público) e `.painel`
(`/admin`, com a tela de login) levam o redesenho do Figma: Switzer Light,
letras a -6%, títulos em `#28513F`, destaque em gradiente `#004527 →
#00AB61`, botões de cantos de ~11 px. As regras ficam em `globals.css`, fora
de `@layer`, para vencer os utilitários do Tailwind. O botão do site é o
`BotaoNovo` (`BotaoLink`/`BotaoExterno` em `ui.tsx` usam ele). A copy da
página inicial sai do painel.

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
parado (sticky); o resto sobe por cima, numa `.cortina`. Texto saindo e foto escurecendo são animações ligadas à
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

**Imagens em três tamanhos.** Cada foto é guardada como `foto.webp` (até
1600 px), `foto-md.webp` (680 px de largura, a do celular) e `foto-sm.webp`
(até 640 px no lado maior, miniatura). O carregador em
`src/lib/image-loader.ts` escolhe pelo tamanho pedido, sem passar pelo
otimizador da Vercel — que no plano free responde 402 quando a cota acaba.
O "-sm" não serve para foto em pé no celular: tem só 357 px de largura.

**O redimensionamento é no navegador.** `src/lib/preparar-imagem.ts` reduz e
converte para WebP antes de subir, qualquer que seja o formato escolhido (JPG,
PNG, HEIC), o que evita a dependência nativa (sharp) no deploy e
não sobe 8 MB de foto de celular para reduzir do outro lado.

**Topo com a logo e os empreendimentos.** O topo da página inicial não tem
foto escolhida no painel: a logo da CS serve de máscara para um slide em
preto e branco das fotos dos empreendimentos (`vitrine-logo.tsx`), e quem
escolhe as fotos é uma regra, a cada envio no painel (`src/lib/vitrine.ts`).
A tela de login usa a mesma cena.

**Banner de campanha.** O bloco `banner_campanha` abre como pop-up por cima
do site (`banner-campanha.tsx`), uma vez por visita: arte de computador
1920 × 1080 e, opcional, de celular 1080 × 1350. Embaixo da arte, o botão
da campanha e um botão de fechar do mesmo tamanho. O painel tem as medidas
para o designer e a prévia num notebook e num iPhone, sempre à vista no bloco.

**O blog é escrito como no Word.** O corpo da publicação usa um editor
com barra de formatação (`editor-conteudo.tsx`): título, subtítulo,
negrito, listas, citação, link, imagem. Grava HTML, e o site lê por
`src/lib/conteudo-blog.ts`, que só deixa passar essas marcas e endereços
seguros. As publicações antigas, em Markdown, abrem já convertidas.

**Ficha do empreendimento.** Banner contido na largura do cabeçalho, e não
a foto na tela inteira (que borrava qualquer foto abaixo de 2500 px). Ficha
técnica, características e diferenciais com ícone; o ícone sai das palavras
de cada linha (`src/components/site/icone-do-item.ts`), e o painel mostra a
prévia embaixo da caixa. Fotos e plantas em carrossel (`galeria.tsx`), mapa
do Google embutido pelo endereço e barra "Acompanhe a obra" quando o campo
`andamento_obra` tem número.

**SEO e IAs.** O domínio vem de `NEXT_PUBLIC_SITE_URL` (`src/lib/seo.ts`):
canonical, `sitemap.xml`, `robots.txt` (aberto também para os robôs de IA),
`/llms.txt` e os dados estruturados (empresa, empreendimento, publicação,
trilha e perguntas frequentes) acompanham a variável. Ao trocar o domínio,
troque a variável e publique de novo.

**Segurança.** Login com limite de tentativas (5 erros por conta ou 20 por
IP em 15 minutos) e cadastro com limite por visitante, guardados em
`public.tentativas` como hash (`src/lib/limite.ts`). Cadastro de
interessado só entra pelo servidor (a chave pública não grava em `leads`).
Troca de senha pede a atual; senha comum ou com o próprio nome é recusada
(`src/lib/senha.ts`). Upload confere que o arquivo é WebP de verdade.

**Termos e privacidade.** `/termos-de-uso` e `/politica-de-privacidade`,
com os dados da empresa do painel. O aviso de cookies aparece para todos,
com ou sem pixel. Os textos são um modelo: vale a revisão de um advogado.

**Vídeos.** Cada empreendimento aceita link (YouTube, Instagram, TikTok,
Vimeo, `src/lib/videos.ts`) ou arquivo de até 45 MB, que vai do navegador
direto para o Storage com autorização de uso único. O site mostra só a capa
e carrega o player no toque. O plano gratuito do Supabase tem 1 GB de espaço
e 5 GB de tráfego por mês: o painel recomenda o link.

**Desempenho.** Medido com o Lighthouse no celular simulado, todas as páginas
principais ficaram acima de 90. O que segura a nota: a abertura curta (1,7
s), a foto principal com prioridade, o mapa e os vídeos carregando só perto
da tela, a fonte só em 300, 400 e 500, e os links do site sem pré-carregar
outras páginas (`prefetch={false}`), que disputavam banda com a foto.

**Painel como aplicativo.** O `/admin` tem manifesto próprio
(`public/painel.webmanifest`, abre em `/admin`), ícones em `public/painel` e
um service worker de escopo `/admin` (`public/sw-painel.js`) que guarda só
arquivos do build e ícones; página e dado do painel nunca entram em cache.
O botão "Instalar o painel" abre a janela do Android quando o navegador
deixa, e um passo a passo (iPhone pelo Compartilhar, Android pelo menu)
quando não. Navegação instantânea: links do menu com `prefetch`,
`loading.tsx` com esqueleto, sessão conferida localmente (chave ES256) e
funções na mesma região do banco (`vercel.json`, iad1).

**Textos com negrito.** Os textos da página inicial saem do painel com
negrito (`EditorTitulo` com `tamanho="texto"`; com `paragrafos`, para os
textos longos). O site lê pelo `Trecho` e pelo `TextoRico`
(`src/components/site/texto-rico.tsx`), sem injetar HTML.

**Painel: explicação no "?", nunca solta.** Rótulo numa linha só; o texto de
apoio vai para `<Dica>` (balão no hover, toque no celular). Texto aberto
embaixo do rótulo deixava um campo mais alto que o vizinho e a linha torta.

**Títulos: uma caixa só, com destaque onde a pessoa marcar.** O editor
(`src/components/admin/editor-titulo.tsx`, Tiptap) grava um HTML mínimo no
campo `titulo`: `<strong>`, `<em>`, `<u>` e `<mark>` (o gradiente).
O site nunca injeta esse HTML: `src/lib/texto-rico.ts` lê peça por peça e o
`<Palavras>` monta os spans, então outra marcação é descartada. Blocos
antigos com `titulo_antes`/`titulo_destaque`/`titulo_depois` continuam
funcionando por `lerTitulo()` até serem salvos de novo.

**Pop-up de saída.** `src/components/site/popup-saida.tsx`, ligado em
`site_settings.popup_saida`. Saída é adivinhada pelo gesto (cursor saindo
pela borda de cima; no celular, rolagem rápida para cima depois de ler um
pouco), nunca prendendo o botão de voltar. Uma vez por visita
(`sessionStorage`) e nunca para quem já se cadastrou em qualquer formulário
(`localStorage` `cs:cadastrado`). Não aparece em `/cadastro`.

**Usuários em três níveis, e uma conta principal.** Administrador (tudo),
Editor do site (conteúdo e blog) e Comercial (obras, unidades e
cadastros). O mapa existe duas vezes, de propósito: `src/lib/permissoes.ts`
decide menu e telas, e a função `public.pode()` do banco barra a escrita
nas políticas — mudou um, mude o outro. A conta principal (`principal`)
não é rebaixada, suspensa nem apagada, nem por outro administrador: o
gatilho `protege_perfis` recusa. O mesmo gatilho impede alguém de mudar
o próprio nível. O login aceita usuário ou e-mail; quem não tem e-mail
ganha um endereço interno (`@equipe.csstm.com.br`) que nunca recebe
mensagem, então a senha dessas contas é trocada pelo administrador.

**Pixels e scripts.** `site_settings.rastreamento`, que só administrador
edita. Cada identificador é conferido pelo formato (`src/lib/rastreamento.ts`)
e pode ser colado junto com o trecho inteiro do Meta ou do Google. Com o
consentimento ligado, nada carrega antes do aceite no aviso de cookies.
Todo cadastro do site vira conversão (`Lead` no Meta, `generate_lead` e a
conversão do Ads no Google, `SubmitForm` no TikTok e o evento `cadastro`
no dataLayer), em `src/lib/conversao.ts`.

**Id do rótulo vai por contexto.** O `Campo` passa o id à caixa por
`useIdDoCampo()`, não por `cloneElement`: em página grande o servidor manda
alguns filhos depois, e o clone não os via — o id só aparecia no navegador.

**Molduras de aparelho na camada base.** A prévia do topo usa devices.css
(MIT), importado em `src/components/admin/aparelhos.css` com `layer(base)`.
Solto, o `.device * { display: block }` da biblioteca venceria as classes do
Tailwind e desmontaria a tela desenhada dentro do aparelho.

**`cn()` e `text-display-*`.** O tailwind-merge lê `text-display-xl` como cor
e descarta um `text-white` no mesmo `cn()`. Nesses casos, string comum.

**Conteúdo editável em `site_settings`.** Uma linha por bloco do site, em
jsonb. O formulário do painel manda campos achatados (`numeros.0.valor`) e a
Server Action remonta o objeto — assim a CS nunca vê JSON.

## Dados do cliente

O briefing, a ata e as apresentações ficam fora do repositório. O
`.gitignore` já cobre `material-do-cliente/` e `acessos-locais.md`.
