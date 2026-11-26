-- =====================================================================
-- O painel acompanha o layout novo.
--
-- 1. Banner de campanha: um bloco novo, que abre como pop-up no site,
--    com uma imagem para computador e outra (opcional) para celular.
--    Substitui a foto de fundo do topo, que o layout novo não usa. A
--    chave já existia, sem uso desde a 0007, num formato antigo (título,
--    texto e uma imagem só): é refeita no formato novo, desligada.
-- 2. A copy revista da página inicial (sem travessão nem dois-pontos,
--    com negrito) estava fixa no código. Volta para o painel aqui, já
--    no formato do editor: <strong> para negrito, <mark> para destaque
--    e <p> separando os parágrafos.
-- 3. A linha do tempo do Girlan passa a morar no bloco do fundador, para
--    ser editada junto com o texto.
-- =====================================================================

insert into public.site_settings (chave, valor, descricao)
values (
  'banner_campanha',
  jsonb_build_object(
    'ativo', false,
    'imagem_desktop', null,
    'imagem_mobile', null,
    'descricao', 'Black Friday CS',
    'botao', 'Quero saber as condições',
    'botao_url', '/cadastro',
    'botao_fechar', 'Agora não'
  ),
  'Banner de campanha que abre como pop-up no site.'
)
on conflict (chave) do update
  set valor = excluded.valor, descricao = excluded.descricao;

-- ------------------------------------------------------------ o topo
-- O objeto é refeito do zero: saem a foto de fundo, os números de apoio
-- (a dobra foi retirada) e campos internos do formulário que tinham
-- vazado para o banco.
update public.site_settings set valor = jsonb_build_object(
  'chamada', coalesce(valor->>'chamada', 'Construtora e incorporadora em Santarém'),
  'titulo', 'Há <mark>10 anos</mark> construindo <mark>lares</mark> em Santarém',
  'subtitulo', 'Casas, apartamentos e terrenos com <strong>projeto bem pensado</strong> e <strong>acabamento de qualidade</strong>. Veja o que está em obra e o que já entregamos.',
  'botao_primario', 'Conheça nossos empreendimentos',
  'botao_primario_url', '/empreendimentos',
  'botao_secundario', 'Falar com um consultor',
  'botao_secundario_url', null
)
where chave = 'hero';

update public.site_settings set valor = valor
  || jsonb_build_object(
    'olho', 'Em obra agora',
    'subtitulo', 'Acompanhe o que está <strong>saindo do chão</strong> em Santarém neste momento.'
  )
where chave = 'destaques';

update public.site_settings set valor = valor
  || jsonb_build_object(
    'texto', 'Os projetos em obra e os já entregues, cada um com <strong>as suas unidades</strong>, de casas e apartamentos a terrenos.'
  )
where chave = 'todos_empreendimentos';

update public.site_settings set valor = valor
  || jsonb_build_object(
    'olho', 'Blog',
    'subtitulo', 'O andamento das obras, as novidades da CS e <strong>dicas para quem quer comprar imóvel em Santarém</strong>.'
  )
where chave = 'blog_home';

update public.site_settings set valor = valor
  || jsonb_build_object(
    'texto', 'Conte o que você procura e um consultor da CS te mostra <strong>as opções que fazem sentido para você</strong>.'
  )
where chave = 'faixa_contato';

update public.site_settings set valor = jsonb_build_object(
  'foto', '/site/girlan-fundador.webp',
  'olho', 'Quem está por trás da CS',
  'titulo', coalesce(
    nullif(valor->>'titulo', ''),
    trim(concat_ws(' ',
      valor->>'titulo_antes',
      '<mark>' || nullif(valor->>'titulo_destaque', '') || '</mark>',
      valor->>'titulo_depois'))
  ),
  'texto',
    '<p>Em 2016, o Girlan Carneiro estava procurando uma casa para comprar. Rodou a cidade, visitou projeto por projeto e <strong>não encontrou nada no padrão que queria</strong>. Foi aí que percebeu que, se estava difícil para ele, estava difícil para muita gente.</p>'
    || '<p>No fim daquele ano, um amigo o chamou para construir em parceria num terreno dele. Saíram quatro casas, e o Girlan nunca mais saiu do ramo. Em 2017 ele comprou um terreno na Rua Raimundo Xavier, no Maracanã, e levantou sete casas. Foi <strong>o primeiro empreendimento que tocou sozinho</strong>.</p>'
    || '<p>Depois vieram os outros. Em 2023 a CS entregou o Flat Premium, com 60 unidades, e até 2026 já são <strong>140 unidades entregues</strong>. Agora está em obra o maior projeto da empresa, o <strong>House Premium, com 100 casas</strong> e entrega prevista para o início de 2027.</p>'
    || '<p>A regra continua a mesma do começo. <strong>Construir algo que dure</strong> e fazer o melhor por quem escolhe morar num imóvel da CS.</p>',
  'marcos', jsonb_build_array(
    jsonb_build_object('ano', '2016', 'texto', 'Começo da CS, com quatro casas feitas em parceria.'),
    jsonb_build_object('ano', '2017', 'texto', 'Sete casas na Rua Raimundo Xavier, no Maracanã. A primeira obra que o Girlan tocou sozinho.'),
    jsonb_build_object('ano', '2023', 'texto', 'Entrega do Flat Premium I, com 60 unidades.'),
    jsonb_build_object('ano', '2026', 'texto', '140 unidades entregues e o House Premium em obra, com entrega no início de 2027.')
  ),
  'botao', coalesce(valor->>'botao', 'Ver empreendimentos'),
  'botao_url', coalesce(valor->>'botao_url', '/empreendimentos')
)
where chave = 'construtor';

-- ------------------------------------------------ limpeza dos blocos
-- Campos internos do formulário ($ACTION_…) que entraram no banco antes
-- de o painel passar a ignorá-los.
update public.site_settings
set valor = (
  select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
  from jsonb_each(valor) as campos(k, v)
  where k not like '$%'
)
where exists (select 1 from jsonb_object_keys(valor) k where k like '$%');
