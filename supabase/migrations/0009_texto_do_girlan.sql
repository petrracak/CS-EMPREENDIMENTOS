-- ============================================================
-- 0009 — o texto do fundador, a partir do áudio dele
--
-- O cliente mandou a gravação do Girlan contando como a CS começou.
-- O texto anterior era uma paráfrase curta escrita a partir da ata;
-- este segue o relato dele, em terceira pessoa, no mesmo tom
-- institucional do resto do site.
--
-- Fatos que vieram do áudio e não existiam antes: a rua do segundo
-- empreendimento (Raimundo Xavier, no Maracanã), o fato de as sete
-- casas terem sido a primeira obra que ele tocou sozinho — as quatro
-- primeiras foram em parceria —, e a palavra "legado", que é dele e
-- aparece duas vezes na gravação.
--
-- Ficou de fora, de propósito, o "graças a Deus" que ele usa ao falar
-- do resultado: numa página institucional isso é escolha do cliente,
-- e o campo é editável no painel.
-- ============================================================

update public.site_settings
set valor = jsonb_set(
  valor,
  '{texto}',
  to_jsonb(E'Em 2016 Girlan Carneiro procurava uma casa para comprar. Rodou a cidade, olhou projeto, olhou acabamento, e não achou nada no padrão que queria. Foi daí que veio a ideia: se estava difícil para ele, estava difícil para muita gente.\n\nNo fim daquele ano um amigo o chamou para construir em parceria, num terreno dele. Saíram quatro casas, e o Girlan não saiu mais do ramo. Em 2017 comprou um terreno próprio na Rua Raimundo Xavier, no Maracanã, e levantou sete casas — o primeiro empreendimento que tocou sozinho.\n\nDe lá para cá vieram os outros. São 140 unidades habitacionais entregues pela CS até 2026, e em 2023 veio o Flat Premium, com 60 unidades. Hoje está em obra o maior legado da empresa: o House Premium, 100 casas, com entrega para o início de 2027.\n\nO que faz isso dar certo é a responsabilidade de não só construir, mas entregar algo durável. É o que o Girlan procurava quando saiu para comprar e não encontrou.'::text)
)
where chave = 'construtor';

-- A linha do tempo ganha o detalhe que o áudio trouxe.
update public.marcos
set texto = 'Sete casas na Rua Raimundo Xavier, no Maracanã — a primeira obra tocada sozinho.'
where ano = '2017';
