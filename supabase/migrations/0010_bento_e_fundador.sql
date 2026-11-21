-- ============================================================
-- 0010 — bento de números e ajustes no bloco do fundador
--
-- Números: cada um ganha um ícone (escolhido no painel, de uma lista
-- do Phosphor) e pode ganhar uma foto. Com foto, a peça do bento vira
-- foto com o número por cima. O terceiro número, as 100 casas do House
-- Premium, recebe a vista aérea das 100 casas, que já está no Storage.
--
-- Fundador: o título leva o nome completo, e o último parágrafo troca
-- de fecho. "É o que o Girlan procurava quando saiu para comprar e não
-- encontrou" amarrava de volta no começo, mas soava como frase de
-- efeito. O novo fecho fica com o que ele disse no áudio — fazer algo
-- durável e fazer sempre o melhor para quem compra.
-- ============================================================

update public.site_settings
set valor = jsonb_set(
  valor,
  '{numeros}',
  (
    select jsonb_agg(
      item
      || jsonb_build_object(
        'icone', (array['calendario', 'chave', 'casa'])[ordem::int],
        'imagem', case when ordem = 3
          then 'empreendimentos/house-premium-residence/house-aerea-alta.webp'
          else null end
      )
      order by ordem
    )
    from jsonb_array_elements(valor -> 'numeros') with ordinality as t(item, ordem)
  )
)
where chave = 'hero';

update public.site_settings
set valor = valor
  || jsonb_build_object('titulo_destaque', 'Girlan Carneiro')
  || jsonb_build_object('texto',
    E'Em 2016 Girlan Carneiro procurava uma casa para comprar. Rodou a cidade, olhou projeto, olhou acabamento, e não achou nada no padrão que queria. Foi daí que veio a ideia: se estava difícil para ele, estava difícil para muita gente.\n\nNo fim daquele ano um amigo o chamou para construir em parceria, num terreno dele. Saíram quatro casas, e o Girlan não saiu mais do ramo. Em 2017 comprou um terreno próprio na Rua Raimundo Xavier, no Maracanã, e levantou sete casas — o primeiro empreendimento que tocou sozinho.\n\nDe lá para cá vieram os outros. São 140 unidades habitacionais entregues pela CS até 2026, e em 2023 veio o Flat Premium, com 60 unidades. Hoje está em obra o maior legado da empresa: o House Premium, 100 casas, com entrega para o início de 2027.\n\nO que sustenta esse caminho é a responsabilidade de não só construir, mas entregar algo durável — e fazer sempre o melhor por quem escolhe morar num imóvel da CS.')
where chave = 'construtor';
