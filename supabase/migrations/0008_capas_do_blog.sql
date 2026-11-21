-- ============================================================
-- 0008 — capas de exemplo para os três posts
--
-- São fotos de banco (Unsplash, licença livre para uso comercial),
-- cortadas em 16:9 e guardadas nos dois tamanhos de sempre. Entram
-- como provisórias: servem para ver o blog com imagem enquanto a CS
-- não fotografa as próprias obras. Trocar é pelo painel, no campo
-- de capa de cada post.
--
-- Originais, para quem precisar rastrear:
--   condominio  unsplash photo-1775112077888-8fa36e9bbc51
--   planta      unsplash photo-1621511075938-f03482369feb
--   flat        unsplash photo-1775733924258-5363323b3ab8
-- ============================================================

update public.posts set capa_url = 'blog/condominio.webp'
where slug = 'casa-em-condominio-fechado-em-santarem';

update public.posts set capa_url = 'blog/planta.webp'
where slug = 'comprar-imovel-na-planta-em-santarem';

update public.posts set capa_url = 'blog/flat.webp'
where slug = 'flat-em-santarem-morar-ou-investir';
