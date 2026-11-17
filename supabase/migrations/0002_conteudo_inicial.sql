-- =====================================================================
-- Conteúdo inicial, transcrito do documento de copy aprovado.
--
-- Regra que atravessa tudo: campo marcado [PENDENTE] na copy entra como
-- NULL, nunca como "R$ 0,00" ou "a definir". O site esconde campo nulo, e
-- a CS preenche pelo painel quando tiver o dado.
-- =====================================================================

-- ------------------------------------------------------------- tipos
insert into public.tipos_empreendimento (nome, slug, ordem) values
  ('Condomínio', 'condominio', 1),
  ('Casas', 'casas', 2),
  ('Prédio', 'predio', 3),
  ('Flats', 'flats', 4),
  ('Terrenos', 'terrenos', 5)
on conflict (slug) do nothing;

insert into public.tipos_unidade (nome, slug, ordem) values
  ('Casa', 'casa', 1),
  ('Apartamento', 'apartamento', 2),
  ('Terreno', 'terreno', 3)
on conflict (slug) do nothing;

-- ------------------------------------------------- linha do tempo
insert into public.marcos (ano, texto, ordem) values
  ('2016', 'Início da CS, com 4 casas feitas em parceria.', 1),
  ('2017', '7 casas no Maracanã.', 2),
  ('2023', 'Entrega do Flat Premium I, com 60 unidades.', 3),
  ('2026', '140 unidades entregues. House Premium em obra, com entrega no início de 2027.', 4);

-- =====================================================================
-- Conteúdo editável do site
--
-- Cada chave é uma tela do painel. O formato é jsonb para a CS acrescentar
-- itens (um número de apoio a mais, por exemplo) sem migração.
-- =====================================================================
insert into public.site_settings (chave, valor, descricao) values

('empresa', jsonb_build_object(
  'razao_social', 'CS Construções e Serviços Imobiliários LTDA',
  'cnpj', '37.032.706/0001-45',
  'endereco', 'Travessa Dália, 808, sala 02, Aeroporto Velho, Santarém, PA, CEP 68020-260',
  'email', 'construtora@csstm.com.br',
  'whatsapp', '(93) 99141-5334',
  'whatsapp_link', 'https://wa.me/message/NIFUOGNCF27II1',
  'atendimento', 'Segunda a sexta, das 8h às 12h e das 14h às 18h. Sábado, das 8h às 12h.',
  'instagram', 'https://www.instagram.com/csempreendimentosstm',
  'facebook', 'https://www.facebook.com/share/1EDU4n3zu3/',
  'maps', 'https://maps.app.goo.gl/QhR3fvLSuqVEdMD48'
), 'Dados da empresa usados no rodapé, no contato e nos dados estruturados.'),

('faixa_campanha', jsonb_build_object(
  'ativo', true,
  'texto_forte', 'Black Friday CS:',
  'texto', 'de 17 a 30 de novembro, condições especiais nos nossos empreendimentos.',
  'link_texto', 'Quero saber as condições',
  'link_url', '/cadastro'
), 'Faixa fina no topo do site. A CS liga e desliga sem precisar de ajuda.'),

('hero', jsonb_build_object(
  'chamada', 'Construtora e incorporadora em Santarém',
  'titulo_antes', 'Há 10 anos construindo',
  'titulo_destaque', 'lares',
  'titulo_depois', 'em Santarém.',
  'subtitulo', 'Casas, apartamentos e terrenos com projeto bem pensado e acabamento de qualidade. Veja o que está em obra e o que já foi entregue.',
  'botao_primario', 'Ver empreendimentos',
  'botao_primario_url', '/empreendimentos',
  'botao_secundario', 'Falar com um consultor',
  'botao_secundario_url', '/cadastro',
  'imagem_desktop', null,
  'imagem_mobile', null,
  'numeros', jsonb_build_array(
    jsonb_build_object('valor', 'Desde 2016', 'texto', 'construindo em Santarém'),
    jsonb_build_object('valor', '140', 'texto', 'unidades habitacionais entregues'),
    jsonb_build_object('valor', '100', 'texto', 'casas no House Premium Residence, nosso maior projeto, em construção')
  )
), 'Primeira dobra da página inicial: imagem, título, botões e números de apoio.'),

('banner_campanha', jsonb_build_object(
  'ativo', true,
  'titulo', 'Black Friday CS',
  'texto', 'De 17 a 30 de novembro, vantagens especiais para quem quer conquistar o imóvel próprio.',
  'botao', 'Quero saber as condições',
  'botao_url', '/cadastro',
  'imagem_desktop', null,
  'imagem_mobile', null
), 'Banner de campanha da página inicial, para ofertas pontuais.'),

('construtor', jsonb_build_object(
  'titulo', 'Conheça o construtor',
  'foto', null,
  'legenda', 'Girlan Carneiro, fundador da CS',
  'texto', E'A CS começou em 2016. O Girlan procurava uma casa para comprar e não encontrou o projeto e o acabamento que queria. Passou a construir o que não achava no mercado.\n\nHoje a CS soma 140 unidades entregues em Santarém e constrói o House Premium Residence, o maior projeto da empresa, com 100 casas.',
  'botao', 'Ver empreendimentos',
  'botao_url', '/empreendimentos'
), 'Bloco do fundador na página inicial. A foto ainda será produzida.'),

('destaques', jsonb_build_object(
  'titulo', 'Empreendimentos em destaque',
  'subtitulo', 'Os projetos que estamos construindo agora.'
), 'Título da seção de empreendimentos em destaque.'),

('todos_empreendimentos', jsonb_build_object(
  'titulo', 'Todos os empreendimentos',
  'texto', 'Casas, apartamentos e terrenos, em obra e já entregues. Veja os projetos da CS e as unidades de cada um.',
  'botao', 'Ver todos os empreendimentos',
  'botao_url', '/empreendimentos'
), 'Chamada para a listagem completa, na página inicial.'),

('blog_home', jsonb_build_object(
  'titulo', 'Blog da CS',
  'subtitulo', 'Novidades da CS, evolução das obras e dicas para quem quer comprar um imóvel em Santarém.',
  'botao', 'Ver todas as publicações',
  'botao_url', '/blog'
), 'Seção do blog na página inicial.'),

('faixa_contato', jsonb_build_object(
  'titulo', 'Fale com a CS',
  'texto', 'Conte um pouco sobre você e receba as opções que combinam com o seu perfil.',
  'botao_primario', 'Quero ser atendido',
  'botao_primario_url', '/cadastro',
  'botao_secundario', 'Falar no WhatsApp'
), 'Faixa de contato que aparece antes do rodapé.'),

('rodape', jsonb_build_object(
  'institucional', 'Construímos casas e apartamentos em Santarém desde 2016.',
  'aviso', 'Imagens meramente ilustrativas.',
  'copyright', '© 2026 CS Empreendimentos. Todos os direitos reservados.'
), 'Textos do rodapé.'),

('whatsapp_flutuante', jsonb_build_object(
  'ativo', true,
  'texto', 'Fale com a CS'
), 'Botão flutuante do WhatsApp.'),

('cadastro', jsonb_build_object(
  'titulo', 'Cadastre-se e receba atendimento',
  'texto', 'Preencha os dados abaixo. Com o seu perfil, um consultor da CS entra em contato com as opções que combinam com você.',
  'consentimento', 'Concordo em receber contato da CS Empreendimentos pelos dados informados. Meus dados serão usados apenas para o atendimento comercial.',
  'botao', 'Quero ser atendido',
  'sucesso_titulo', 'Recebemos o seu cadastro.',
  'sucesso_texto', 'Em breve, um consultor da CS vai falar com você pelo WhatsApp.',
  'erro', 'Não conseguimos enviar o seu cadastro. Confira os campos e tente de novo ou fale com a gente pelo WhatsApp.',
  'alternativa', 'Prefere falar agora? Chame a CS no WhatsApp. Atendimento de segunda a sexta, das 8h às 12h e das 14h às 18h, e aos sábados, das 8h às 12h.'
), 'Textos da página de cadastro de interessados.'),

('seo', jsonb_build_object(
  'titulo', 'CS Empreendimentos | Casas e apartamentos em Santarém',
  'descricao', 'Construtora e incorporadora em Santarém desde 2016. Casas, apartamentos e terrenos com projeto bem pensado e acabamento de qualidade.'
), 'Título e descrição da página inicial no Google.')

on conflict (chave) do nothing;
