-- =====================================================================
-- Vídeos dos empreendimentos.
--
-- Dois jeitos: link (YouTube, Instagram, TikTok, Vimeo), que não pesa
-- nada no Supabase, ou arquivo enviado pelo painel para o Storage. O
-- plano gratuito tem 1 GB de espaço e 5 GB de tráfego por mês, então o
-- painel recomenda o link e limita o arquivo.
--
-- url: o link colado, ou o caminho do arquivo no balde "midia".
-- capa: só para arquivo, a imagem gerada no navegador na hora do envio.
-- =====================================================================

create table if not exists public.empreendimento_videos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  tipo text not null check (tipo in ('arquivo', 'youtube', 'instagram', 'tiktok', 'vimeo')),
  url text not null check (char_length(url) <= 500),
  capa text check (char_length(capa) <= 500),
  titulo text check (char_length(titulo) <= 160),
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists empreendimento_videos_emp
  on public.empreendimento_videos (empreendimento_id, ordem);

alter table public.empreendimento_videos enable row level security;

create policy "videos visiveis"
  on public.empreendimento_videos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.empreendimentos e
      where e.id = empreendimento_videos.empreendimento_id
        and (e.status = 'publicado' or public.is_staff())
    )
  );

create policy "obras gerencia videos"
  on public.empreendimento_videos for all
  to authenticated
  using (public.pode('obras'))
  with check (public.pode('obras'));
