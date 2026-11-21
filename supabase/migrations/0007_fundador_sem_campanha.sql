-- ============================================================
-- 0007 — tira a seção de campanha e abre o bloco do fundador
--
-- A seção escura de campanha saiu da página inicial. Ela era uma
-- caixa a mais para a mesma coisa que o topo já faz, e o topo é
-- editável: imagem, título e botões. Campanha pontual passa a ser
-- trocar o banner principal, não ligar um bloco paralelo. A faixa
-- fina do topo continua existindo, para aviso de curta duração.
--
-- O bloco do fundador deixa de ter título fixo no código. Olho,
-- começo do título e palavra em destaque passam a viver aqui, como
-- no topo da página, e o texto cresce — estava curto demais para
-- apresentar a empresa.
-- ============================================================

-- A linha 'banner_campanha' continua no banco de propósito. Nenhum
-- código lê mais ela, então não aparece no site nem no painel; fica
-- como registro do texto da Black Friday caso a CS queira reaproveitar
-- a redação. Apagar é seguro quando não fizer mais falta:
--   delete from public.site_settings where chave = 'banner_campanha';

update public.site_settings
set valor = jsonb_build_object(
  'olho', 'A CS',
  'titulo_antes', 'Conheça o',
  'titulo_destaque', 'Girlan',
  'foto', valor -> 'foto',
  'legenda', valor ->> 'legenda',
  'texto', E'Girlan Carneiro procurava uma casa para comprar em Santarém. Visitou o que estava à venda e não encontrou o projeto nem o acabamento que queria para a própria família. Em 2016 decidiu construir aquilo que não achava no mercado, e as primeiras quatro casas, feitas em parceria, deram origem à CS.\n\nNos anos seguintes vieram as sete casas do Maracanã, os flats e os condomínios fechados. São 140 unidades entregues na cidade até aqui, entre casas, apartamentos e terrenos.\n\nHoje a construtora toca o House Premium Residence, o maior projeto da empresa: 100 casas em condomínio fechado, com entrega prevista para o início de 2027. O critério é o mesmo da primeira obra — entregar o imóvel que o Girlan não encontrou para comprar.',
  'botao', valor ->> 'botao',
  'botao_url', valor ->> 'botao_url'
),
descricao = 'Bloco do fundador na página inicial. Título e chamada são editáveis.'
where chave = 'construtor';
