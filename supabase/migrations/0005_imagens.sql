-- =====================================================================
-- Liga as fotos já enviadas ao Storage aos empreendimentos.
--
-- O banco guarda o CAMINHO dentro do balde, não a URL inteira: se um dia
-- o projeto do Supabase mudar, nada no conteúdo precisa ser reescrito.
-- A versão pequena de cada foto é o mesmo caminho com "-sm" antes da
-- extensão, e quem monta isso é lib/midia.ts.
-- =====================================================================

-- ----------------------------------------------------- capa e mapa
update public.empreendimentos set
  imagem_principal = 'empreendimentos/house-premium-residence/house-fachada-casas.webp',
  mapa_imagem      = 'empreendimentos/house-premium-residence/house-localizacao.webp',
  mapa_link        = 'https://maps.app.goo.gl/QhR3fvLSuqVEdMD48'
where slug = 'house-premium-residence';

update public.empreendimentos set
  imagem_principal = 'empreendimentos/aurora-premium-residence/aurora-render-entrada.webp',
  logo_url         = 'empreendimentos/aurora-premium-residence/aurora-logo.webp',
  mapa_imagem      = 'empreendimentos/aurora-premium-residence/aurora-aerea.webp'
where slug = 'aurora-premium-residence';

update public.empreendimentos set
  imagem_principal = 'empreendimentos/flat-premium-ii/flat2-cena13.webp',
  mapa_imagem      = 'empreendimentos/flat-premium-ii/flat2-cena00.webp'
where slug = 'flat-premium-ii';

-- ------------------------------------------------------- galerias
insert into public.empreendimento_imagens (empreendimento_id, url, legenda, categoria, ordem)
select e.id,
       'empreendimentos/house-premium-residence/' || f.arquivo,
       f.legenda, f.categoria, f.ordem
from public.empreendimentos e
join (values
  ('house-entrada.webp',          'Portaria do condomínio',                'galeria',  1),
  ('house-condominio-aereo.webp', 'Entrada do House Premium',              'galeria',  2),
  ('house-rua-entardecer.webp',   'Alameda interna ao entardecer',         'galeria',  3),
  ('house-rua-carros.webp',       'Rua interna do condomínio',             'galeria',  4),
  ('house-comercio-rua.webp',     'Espaço para mini mercado',              'galeria',  5),
  ('house-aerea-alta.webp',       'Vista aérea das 100 casas',             'galeria',  6),
  ('house-fachada-gramado.webp',  'Fachada da casa',                       'galeria',  7),
  ('house-cs.webp',               'Guarita e controle de acesso',          'galeria',  8),
  ('house-obra-guarita.webp',     'Obra: guarita em construção',           'galeria',  9),
  ('house-obra-casas.webp',       'Obra: casas em construção',             'galeria', 10),
  ('house-obra-fachada.webp',     'Obra: fachada já erguida',              'galeria', 11),
  ('house-planta.webp',           'Planta da casa de 56 m²',               'planta',   1)
) as f(arquivo, legenda, categoria, ordem) on true
where e.slug = 'house-premium-residence';

insert into public.empreendimento_imagens (empreendimento_id, url, legenda, categoria, ordem)
select e.id,
       'empreendimentos/aurora-premium-residence/' || f.arquivo,
       f.legenda, f.categoria, f.ordem
from public.empreendimentos e
join (values
  ('aurora-fachada-pedra.webp',   'Fachada com revestimento em pedra',     'galeria',  1),
  ('aurora-area-gourmet.webp',    'Área gourmet com churrasqueira',        'galeria',  2),
  ('aurora-interior.webp',        'Interior da casa',                      'galeria',  3),
  ('aurora-area-externa.webp',    'Área externa e quintal',                'galeria',  4),
  ('aurora-garagem-coberta.webp', 'Garagem coberta para 2 carros',         'galeria',  5),
  ('aurora-garagem-dupla.webp',   'Acesso direto da garagem para a casa',  'galeria',  6),
  ('aurora-entrada.webp',         'Entrada da casa',                       'galeria',  7),
  ('aurora-lateral.webp',         'Lateral e acesso de serviço',           'galeria',  8),
  ('aurora-garagem.webp',         'Vista da garagem',                      'galeria',  9),
  ('aurora-render-fachada.webp',  'Projeto da fachada',                    'galeria', 10),
  ('aurora-planta-a.webp',        'Planta da casa de 133,81 m²',           'planta',   1),
  ('aurora-planta-b.webp',        'Planta da casa de 143 m²',              'planta',   2)
) as f(arquivo, legenda, categoria, ordem) on true
where e.slug = 'aurora-premium-residence';

insert into public.empreendimento_imagens (empreendimento_id, url, legenda, categoria, ordem)
select e.id,
       'empreendimentos/flat-premium-ii/' || f.arquivo,
       f.legenda, f.categoria, f.ordem
from public.empreendimentos e
join (values
  ('flat2-cena12.webp', 'O edifício visto da rua',                 'galeria',  1),
  ('flat2-cena14.webp', 'Fachada iluminada à noite',               'galeria',  2),
  ('flat2-cena11.webp', 'Acesso ao edifício',                      'galeria',  3),
  ('flat2-cena17.webp', 'Sala de estar e jantar integradas',       'galeria',  4),
  ('flat2-cena18.webp', 'Sacada com vista para a cidade',          'galeria',  5),
  ('flat2-cena19.webp', 'Cozinha e área de serviço',               'galeria',  6),
  ('flat2-cena22.webp', 'Suíte do flat',                           'galeria',  7),
  ('flat2-cena05.webp', 'Aeroporto Velho visto do alto',           'galeria',  8),
  ('flat2-cena09.webp', 'O entorno do empreendimento',             'galeria',  9),
  ('flat2-cena10.webp', 'A região ao anoitecer',                   'galeria', 10),
  ('flat2-cena20.webp', 'Planta do pavimento de garagem',          'planta',   1),
  ('flat2-cena21.webp', 'Planta do pavimento tipo',                'planta',   2)
) as f(arquivo, legenda, categoria, ordem) on true
where e.slug = 'flat-premium-ii';

-- --------------------------------------------- imagem da página inicial
update public.site_settings
set valor = jsonb_set(
      valor,
      '{imagem_desktop}',
      to_jsonb('empreendimentos/house-premium-residence/house-fachada-casas.webp'::text)
    )
where chave = 'hero';
