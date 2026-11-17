-- =====================================================================
-- Logos próprios dos empreendimentos.
--
-- Os primeiros vieram recortados das apresentações em PDF e traziam fundo
-- opaco: sobre a foto do topo viravam um adesivo branco. Estes saem das
-- pastas LOGOS do Drive, com transparência de verdade, e a versão branca
-- do Aurora é a que funciona sobre imagem escura.
-- =====================================================================

update public.empreendimentos
set logo_url = 'empreendimentos/aurora-premium-residence/aurora-logo-marca.webp'
where slug = 'aurora-premium-residence';

update public.empreendimentos
set logo_url = 'empreendimentos/flat-premium-ii/flat2-logo-marca.webp'
where slug = 'flat-premium-ii';

-- O logo antigo some da galeria: era o mesmo arquivo com fundo chapado.
delete from public.empreendimento_imagens
where url like '%aurora-logo.webp';
