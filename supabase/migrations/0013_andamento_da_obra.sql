-- =====================================================================
-- Andamento da obra, em porcentagem, para a barra "Acompanhe a obra" da
-- ficha do empreendimento. Vazio, a barra não aparece (empreendimento
-- entregue ou sem número para mostrar).
-- =====================================================================

alter table public.empreendimentos
  add column if not exists andamento_obra smallint
  check (andamento_obra is null or andamento_obra between 0 and 100);

comment on column public.empreendimentos.andamento_obra is
  'Porcentagem da obra concluída (0 a 100). Vazio esconde a barra na ficha.';

-- A legenda padrão "Imagens meramente ilustrativas." sai das galerias, a
-- pedido da CS. Legenda escrita de propósito (a do Aurora) fica.
update public.empreendimentos
set legenda_galeria = null
where legenda_galeria ilike 'imagens meramente ilustrativas%';

-- E sai do rodapé do site também.
update public.site_settings
set valor = valor || '{"aviso": null}'::jsonb
where chave = 'rodape' and valor->>'aviso' ilike 'imagens meramente ilustrativas%';
