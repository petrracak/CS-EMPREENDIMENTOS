import type { NextConfig } from "next";

/**
 * O que este build enxerga do ambiente, sem revelar valor nenhum.
 *
 * Quando a variável "não existe", a causa quase nunca é ela faltar de
 * verdade: é o nome com uma letra trocada, o valor vazio, ou a variável
 * cadastrada só em Preview quando o build é de Production. Listar os
 * nomes parecidos e o ambiente da Vercel separa essas causas de uma vez,
 * direto no log de deploy. Só nomes e "preenchida"/"VAZIA" saem daqui.
 */
function diagnosticoDoAmbiente(): string {
  const parecidas = Object.keys(process.env)
    .filter((nome) => /supabase|site_url/i.test(nome))
    .sort()
    .map((nome) => `  - ${nome}: ${process.env[nome] ? "preenchida" : "VAZIA"}`);

  return [
    `Ambiente deste build (VERCEL_ENV): ${process.env.VERCEL_ENV ?? "fora da Vercel"}`,
    parecidas.length
      ? "Variáveis com nome parecido que o build enxerga:\n" +
        parecidas.join("\n")
      : "Nenhuma variável com SUPABASE ou SITE_URL no nome chegou a este build.",
  ].join("\n");
}

/**
 * O host do Supabase, de onde vêm todas as fotos.
 *
 * Isto roda antes de qualquer página, na carga da configuração. Se a
 * variável não existir, `new URL(undefined)` estoura um "Invalid URL" sem
 * dizer de onde veio — foi o que aconteceu na primeira tentativa de
 * deploy. A mensagem abaixo troca isso pelo que precisa ser feito.
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não está definida.\n\n" +
        "Localmente: copie o .env.example para .env.local e preencha.\n" +
        "Na Vercel: Settings → Environment Variables, marcando Production, " +
        "Preview e Development. O build lê o banco para gerar as páginas, " +
        "então sem isso ele não termina.\n\n" +
        diagnosticoDoAmbiente(),
    );
  }

  try {
    return new URL(url).hostname;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL não é uma URL válida: "${url}". ` +
        "Esperado algo como https://seuprojeto.supabase.co",
    );
  }
})();

/**
 * Cabeçalhos de segurança de toda resposta.
 *
 * A CSP leva só as diretivas que não dependem de saber de onde vêm os
 * scripts: impedem que o site seja embutido em página de terceiros (clique
 * enganoso), que um <base> forjado reescreva os links e que um formulário
 * seja enviado para fora.
 */
const SEGURANCA = [
  // Só HTTPS por dois anos, também nos subdomínios.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  images: {
    // As fotos já são guardadas prontas no Storage, em dois tamanhos, então
    // o carregador só escolhe qual servir. Evita a cota do otimizador da
    // Vercel, que no plano free responde 402 e faz a imagem sumir.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Cache de navegação no aparelho. Toda alteração feita pelo painel chama
    // revalidatePath, então a Carolina nunca vê o cache escondendo o que ela
    // acabou de salvar.
    staleTimes: { dynamic: 30, static: 60 },
    // Marca que as atualizações de segurança do Next são aplicadas por
    // agente. O próprio `next build` interrompe quando a versão instalada
    // tem aviso publicado; isto registra como a correção é feita aqui.
    agentUpgrade: "security",
    // O Phosphor exporta mais de 1500 ícones num índice só. Sem isto o
    // modo de desenvolvimento carrega todos para usar meia dúzia.
    optimizePackageImports: ["@phosphor-icons/react"],
    // As fotos sobem por Server Action, já convertidas em WebP no
    // navegador. O limite padrão (1 MB) barrava a foto de fundo do topo,
    // que vai até 2400 px. A Vercel aceita até 4,5 MB por requisição.
    serverActions: { bodySizeLimit: "4mb" },
  },
  // A home nova foi testada em /home-nova antes de virar a página inicial;
  // quem guardou o link cai na home.
  async redirects() {
    return [{ source: "/home-nova", destination: "/", permanent: true }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: SEGURANCA },
      // O painel não aparece em busca nenhuma, nem por link solto.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Arquivos de public/ não têm hash no nome: um dia fresco, uma semana
      // servindo o antigo enquanto confere.
      {
        source:
          "/:arquivo((?!_next|midia).*\\.(?:webp|png|jpg|jpeg|svg|ico|avif))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
