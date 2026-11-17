-- =====================================================================
-- Empreendimentos, transcritos da copy aprovada.
--
-- Publicados: os que já têm texto e fotos. Em rascunho: os que a copy
-- marca como [PENDENTE] quase inteiros — a Carolina completa pelo painel
-- e publica. Nenhum card vazio vai para o ar.
-- =====================================================================

insert into public.empreendimentos (
  slug, nome, status, situacao, tipo_id,
  frase_impacto, subtitulo, linha_card,
  sobre, conceito, historia,
  unidades_total, area_construida, terreno_dimensoes, terreno_area,
  distribuicao, vagas, previsao_entrega,
  endereco, bairro, localizacao_texto,
  atendimento_chamada, botao_primario, botao_secundario, legenda_galeria,
  destaque, ordem, seo_titulo, seo_descricao
) values

-- ----------------------------------------------------- Flat Premium II
('flat-premium-ii', 'Flat Premium II', 'publicado', 'em_construcao',
 (select id from public.tipos_empreendimento where slug = 'flats'),
 'Flats de 31,5 m² no Aeroporto Velho, para morar ou investir.',
 'Edifício com elevador, garagem administrada pelo condomínio e entrega prevista para janeiro de 2028.',
 'Flats de 31,5 m² com suíte, elevador e garagem administrada.',
 E'O Flat Premium II é um edifício de flats na Rua Magnólia, no Aeroporto Velho, com fácil acesso aos principais serviços e ao comércio de Santarém. Serve tanto para morar quanto para investir.\n\nSão 11 apartamentos por andar, cada um com 31,5 m², suíte, sala de estar e jantar integradas, cozinha e sacada de serviço.',
 'Planta funcional, sem espaço perdido: tudo o que o morador precisa em 31,5 m², com elevador, garagem organizada e administração do condomínio.',
 'O Flat Premium I foi entregue em 2023, com 60 unidades. O Flat Premium II é o próximo edifício de flats da CS, com obras a partir de outubro de 2026 e entrega prevista para janeiro de 2028.',
 '11 apartamentos por andar', '31,5 m²', null, null,
 '1 suíte, sala de estar e jantar integradas, cozinha e sacada de serviço',
 '1 pavimento de garagem, com vagas numeradas e demarcadas, administrado pelo condomínio',
 'Janeiro de 2028 (início das obras em outubro de 2026)',
 'Rua Magnólia', 'Aeroporto Velho',
 'Na Rua Magnólia, no Aeroporto Velho, perto dos principais serviços e do comércio de Santarém.',
 'Quer saber quais unidades estão disponíveis? Fale com o nosso time, venha ao escritório ou deixe seus dados.',
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 true, 1,
 'Flat Premium II | Flats no Aeroporto Velho',
 'Flats de 31,5 m² com suíte, elevador e garagem administrada, na Rua Magnólia, em Santarém. Entrega prevista para janeiro de 2028.'),

-- ------------------------------------------------ House Premium Residence
('house-premium-residence', 'House Premium Residence', 'publicado', 'em_construcao',
 (select id from public.tipos_empreendimento where slug = 'condominio'),
 'Condomínio fechado com 100 casas na Nova Moaçara.',
 'Casas de 56 m² com suíte, portaria 24h e entrega prevista para o início de 2027.',
 '100 casas planejadas em condomínio fechado, com portaria 24h.',
 E'O House Premium Residence é um condomínio fechado com 100 casas planejadas, na Nova Moaçara. É o maior projeto da CS e tem entrega prevista para o início de 2027.\n\nCada casa tem 56 m² com suíte, quarto, sala e cozinha integradas, área de serviço e vaga de garagem. O condomínio conta com guarita e portaria 24h, playground e estacionamento para visitantes.',
 'Casa completa e bem distribuída, em um condomínio organizado, com segurança e área de lazer dentro do próprio residencial.',
 'O House Premium vem depois de 140 unidades entregues pela CS desde 2016. É o maior projeto da empresa até aqui.',
 '100 casas', '56 m²', '6,12 x 18 m', '110,16 m²',
 '1 suíte, 1 quarto, banheiro social, sala de estar e jantar, cozinha integrada e área de serviço',
 '1 vaga de garagem', 'Início de 2027',
 null, 'Nova Moaçara',
 'O House Premium fica na Nova Moaçara, em Santarém.',
 'Quer conhecer o House Premium? Fale com a gente, venha ao escritório ou deixe seus dados.',
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 true, 2,
 'House Premium Residence | Casas na Nova Moaçara',
 '100 casas planejadas em condomínio fechado na Nova Moaçara, com portaria 24h. Entrega prevista para o início de 2027.'),

-- ----------------------------------------------- Aurora Premium Residence
('aurora-premium-residence', 'Aurora Premium Residence', 'publicado', 'em_construcao',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 '12 casas com até 143 m², 3 suítes e área gourmet.',
 'Rua C1, no Buriti Cidade Jardim, a 7 minutos do aeroporto.',
 '12 casas com até 143 m², 3 suítes e área gourmet.',
 E'O Aurora Premium Residence tem 12 casas na Rua C1, no Buriti Cidade Jardim, às margens da Av. Eng. Fernando Guilhon. As obras estão em andamento.\n\nCada casa tem até 143 m² de área construída, em terreno de 10 x 25 m, com 3 suítes, sala de estar e jantar integradas com a cozinha, área gourmet com churrasqueira e lavabo, banheiro social, área de serviço independente e 2 vagas de garagem coberta com acesso direto à casa.',
 'Casa ampla para receber a família e os amigos, com ambientes integrados e área gourmet pronta.',
 'O Aurora segue o padrão de acabamento das casas já entregues pela CS.',
 '12 casas', '133,81 m² e 143 m²', '10 x 25 m', '250 m²',
 '3 suítes, sala de estar e jantar integradas com a cozinha, área gourmet com churrasqueira e lavabo, banheiro social e área de serviço independente',
 '2 vagas de garagem coberta', null,
 'Rua C1', 'Buriti Cidade Jardim',
 'O Aurora fica às margens da Av. Eng. Fernando Guilhon, no Buriti Cidade Jardim, em Santarém.',
 'Agende uma visita para conhecer o padrão de acabamento da CS. Fale com a gente ou deixe seus dados.',
 'Agendar visita', 'Chamar no WhatsApp',
 'Fotos reais de uma casa entregue pela CS, no padrão de acabamento do Aurora.',
 true, 3,
 'Aurora Premium Residence | Casas no Buriti',
 '12 casas com até 143 m², 3 suítes e área gourmet na Rua C1, no Buriti Cidade Jardim, em Santarém. Agende uma visita.'),

-- --------------------------------------------- Floratta Premium Residence
('floratta-premium-residence', 'Floratta Premium Residence', 'publicado', 'em_acabamento',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 'Casas na fase final de obra, no bairro Floresta.',
 null,
 'Casas já na fase de acabamento da obra.',
 'O Floratta Premium Residence reúne casas na Rua Chico Irene, no bairro Floresta, em Santarém. A obra está em fase de acabamento, com o padrão de construção que a CS leva a todos os seus projetos.',
 null, null,
 null, null, null, null, null, null, null,
 'Rua Chico Irene', 'Floresta', null,
 'Quer conhecer o Floratta? Fale com a gente ou deixe seus dados.',
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 false, 4, null, null),

-- ------------------------------------------------------ Flat Premium I
('flat-premium-i', 'Flat Premium I', 'publicado', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'flats'),
 'Flats entregues, com a qualidade CS.',
 null,
 'Edifício de flats com 60 unidades, entregue em 2023.',
 'O Flat Premium I é um edifício de flats com 60 unidades, na Travessa Dália, no Aeroporto Velho. Foi entregue em 2023 e deu origem à linha de flats da CS, que continua no Flat Premium II.',
 null, null,
 '60', null, null, null, null, null, 'Entregue em 2023',
 'Travessa Dália, 808', 'Aeroporto Velho', null,
 'Quer conhecer os empreendimentos que estão em obra? Fale com a gente.',
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 false, 5, null, null),

-- ------------------------- entregues sem material: a CS completa e publica
('moacara-premium-residence', 'Moaçara Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 'Casas entregues, famílias morando.', null,
 'Casas entregues, com o padrão de construção da CS.',
 'O Moaçara Premium Residence é um dos residenciais de casas que a CS já entregou em Santarém. Cada casa foi feita com projeto bem pensado e acabamento de qualidade, a mesma preocupação que guia todos os nossos empreendimentos.',
 null, null, null, null, null, null, null, null, null,
 null, null, null, null, 'Quero ser atendido', 'Chamar no WhatsApp',
 'Imagens meramente ilustrativas.', false, 6, null, null),

('exclusive-premium-residence', 'Exclusive Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 'Casas entregues, famílias morando.', null,
 'Casas entregues, com o padrão de construção da CS.',
 'O Exclusive Premium Residence é um dos residenciais de casas que a CS já entregou em Santarém. Cada casa foi feita com projeto bem pensado e acabamento de qualidade, a mesma preocupação que guia todos os nossos empreendimentos.',
 null, null, null, null, null, null, null, null, null,
 null, null, null, null, 'Quero ser atendido', 'Chamar no WhatsApp',
 'Imagens meramente ilustrativas.', false, 7, null, null),

('cravo-premium-residence', 'Cravo Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 'Casas entregues, famílias morando.', null,
 'Casas entregues, com o padrão de construção da CS.',
 'O Cravo Premium Residence é um dos residenciais de casas que a CS já entregou em Santarém. Cada casa foi feita com projeto bem pensado e acabamento de qualidade, a mesma preocupação que guia todos os nossos empreendimentos.',
 null, null, null, null, null, null, null, null, null,
 null, null, null, null, 'Quero ser atendido', 'Chamar no WhatsApp',
 'Imagens meramente ilustrativas.', false, 8, null, null),

('maracana-premium-residence', 'Maracanã Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 'Casas entregues, famílias morando.', null,
 'Casas entregues, com o padrão de construção da CS.',
 'O Maracanã Premium Residence é um dos residenciais de casas que a CS já entregou em Santarém. Cada casa foi feita com projeto bem pensado e acabamento de qualidade, a mesma preocupação que guia todos os nossos empreendimentos.',
 null, null, null, null, null, null, null, null, null,
 null, null, null, null, 'Quero ser atendido', 'Chamar no WhatsApp',
 'Imagens meramente ilustrativas.', false, 9, null, null),

-- ------- estão no Drive mas não na copy: entram em rascunho, sem texto
-- ------- inventado, para a CS preencher e decidir se publica.
('village-premium-residence', 'Village Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 null, null, null, null, null, null,
 null, null, null, null, null, null, null, null, null, null, null,
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 false, 10, null, null),

('vitoria-premium-residence', 'Vitória Premium Residence', 'rascunho', 'entregue',
 (select id from public.tipos_empreendimento where slug = 'casas'),
 null, null, null, null, null, null,
 null, null, null, null, null, null, null, null, null, null, null,
 'Quero ser atendido', 'Chamar no WhatsApp', 'Imagens meramente ilustrativas.',
 false, 11, null, null)

on conflict (slug) do nothing;

-- =====================================================================
-- Características, diferenciais e pontos de referência
-- =====================================================================
insert into public.empreendimento_caracteristicas (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('56 m² de área construída, com sala e cozinha integradas', 1),
  ('Suíte, quarto e banheiro social', 2),
  ('Área de serviço e 1 vaga de garagem', 3),
  ('Piso cerâmico, bancadas em granito, portas e janelas em vidro temperado', 4)
) as t(texto, ordem) on true
where e.slug = 'house-premium-residence';

insert into public.empreendimento_diferenciais (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('Guarita e portaria 24h', 1),
  ('Cerca elétrica e muros de, no mínimo, 2,5 m de altura em todo o residencial', 2),
  ('Área de lazer com playground', 3),
  ('Espaço para mini mercado dentro do condomínio', 4),
  ('Estacionamento para visitantes, com 5 vagas', 5),
  ('Alameda interna de 6 m, em paver, com calçadas laterais', 6),
  ('Escritório para a gestão do condomínio', 7),
  ('Reservatório próprio de água, com caixa de 20.000 litros', 8)
) as t(texto, ordem) on true
where e.slug = 'house-premium-residence';

insert into public.empreendimento_referencias (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('Perto da Gazin Outlet', 1),
  ('A 10 minutos do Rio Tapajós Shopping', 2),
  ('A 15 minutos das interpraias', 3),
  ('A 20 minutos do aeroporto', 4)
) as t(texto, ordem) on true
where e.slug = 'house-premium-residence';

insert into public.empreendimento_diferenciais (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('11 apartamentos por andar, distribuídos ao redor de um corredor central', 1),
  ('Elevador e escada no centro do pavimento', 2),
  ('Garagem com vagas numeradas, administrada pelo condomínio', 3),
  ('Espaço de convivência com espelho d''água e área verde no térreo', 4),
  ('Boa ventilação e iluminação natural em todas as unidades', 5)
) as t(texto, ordem) on true
where e.slug = 'flat-premium-ii';

insert into public.empreendimento_diferenciais (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('Área gourmet com churrasqueira e lavabo', 1),
  ('3 suítes', 2),
  ('Garagem coberta para 2 carros, com acesso direto à casa', 3),
  ('Sala de estar e jantar integradas com a cozinha', 4),
  ('Banheiro social e área de serviço independente', 5)
) as t(texto, ordem) on true
where e.slug = 'aurora-premium-residence';

insert into public.empreendimento_referencias (empreendimento_id, texto, ordem)
select e.id, t.texto, t.ordem
from public.empreendimentos e
join (values
  ('A 7 minutos do aeroporto', 1),
  ('A poucos metros da EETEPA e de supermercados', 2),
  ('A poucos metros do shopping', 3),
  ('Fácil acesso às interpraias', 4)
) as t(texto, ordem) on true
where e.slug = 'aurora-premium-residence';

-- =====================================================================
-- Unidades
--
-- A copy marca estas tabelas como dados provisórios da apresentação, então
-- entram como RASCUNHO: ficam no painel, não no site, até a CS confirmar
-- valor e situação. Valor fica nulo, nunca R$ 0,00.
-- =====================================================================
insert into public.unidades (
  empreendimento_id, identificacao, tipo_id, andar,
  area_construida, terreno_dimensoes, valor, situacao, status, observacao, ordem
)
select e.id, u.ident,
       (select id from public.tipos_unidade where slug = 'apartamento'),
       u.andar, '31,5 m²', null, null, u.situacao, 'rascunho',
       'A forma de pagamento é combinada com o consultor.', u.ordem
from public.empreendimentos e
join (values
  ('Apartamento 304', '3º', 'disponivel', 1),
  ('Apartamento 308', '3º', 'reservada', 2),
  ('Apartamento 604', '6º', 'disponivel', 3),
  ('Apartamento 606', '6º', 'disponivel', 4),
  ('Apartamento 706', '7º', 'disponivel', 5)
) as u(ident, andar, situacao, ordem) on true
where e.slug = 'flat-premium-ii';

insert into public.unidades (
  empreendimento_id, identificacao, tipo_id,
  area_construida, terreno_dimensoes, terreno_area, valor, situacao, status, ordem
)
select e.id, u.ident,
       (select id from public.tipos_unidade where slug = 'casa'),
       u.area, '10 x 25 m', '250 m²', null, u.situacao, 'rascunho', u.ordem
from public.empreendimentos e
join (values
  ('Casa 01', null, 'vendida', 1),
  ('Casa 02', null, 'vendida', 2),
  ('Casa 03', null, 'vendida', 3),
  ('Casa 04', null, 'vendida', 4),
  ('Casa 05', null, 'vendida', 5),
  ('Casa 06', '133,81 m²', 'disponivel', 6),
  ('Casa 07', null, 'vendida', 7),
  ('Casa 08', '143 m²', 'disponivel', 8),
  ('Casa 09', null, 'vendida', 9),
  ('Casa 10', null, 'vendida', 10),
  ('Casa 11', '143 m²', 'disponivel', 11),
  ('Casa 12', null, 'vendida', 12)
) as u(ident, area, situacao, ordem) on true
where e.slug = 'aurora-premium-residence';
