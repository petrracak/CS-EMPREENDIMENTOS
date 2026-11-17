-- =====================================================================
-- CS Empreendimentos — estrutura inicial
--
-- A diferença para um site de imobiliária está aqui: a CS é construtora,
-- então o conteúdo tem dois níveis. Um EMPREENDIMENTO (um condomínio, um
-- prédio) contém UNIDADES (a casa 06, o apartamento 304, o lote 12), e é a
-- unidade que tem valor e situação de venda.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- util
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- Pessoas do painel
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  email       text,
  role        text not null default 'editor' check (role in ('admin', 'editor')),
  ativo       boolean not null default true,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Lidas pelas policies. SECURITY DEFINER para não cair na própria RLS de
-- profiles e girar em recursão.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and ativo
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and ativo and role = 'admin'
  );
$$;

-- =====================================================================
-- Tipos — a ata pede que a CS possa criar novos sem programador
-- =====================================================================
create table public.tipos_empreendimento (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null unique,
  slug    text not null unique,
  ordem   integer not null default 0
);

create table public.tipos_unidade (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null unique,
  slug    text not null unique,
  ordem   integer not null default 0
);

-- =====================================================================
-- Empreendimentos
-- =====================================================================
create table public.empreendimentos (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  nome          text not null,
  status        text not null default 'rascunho'
                check (status in ('rascunho', 'publicado')),
  situacao      text not null default 'em_construcao'
                check (situacao in ('em_construcao', 'em_acabamento', 'entregue')),
  tipo_id       uuid references public.tipos_empreendimento (id) on delete set null,

  -- abertura
  frase_impacto text,
  subtitulo     text,
  linha_card    text,
  logo_url      text,
  imagem_principal text,

  -- textos
  sobre         text,
  conceito      text,
  historia      text,

  -- ficha técnica. Tudo opcional de propósito: campo vazio não aparece
  -- no site, e a CS preenche quando tiver o dado.
  unidades_total      text,
  area_construida     text,
  -- A ata pede os dois formatos: "10 x 25 m" OU "250 m²". São campos
  -- separados porque a CS informa um ou outro, nunca os dois obrigatórios.
  terreno_dimensoes   text,
  terreno_area        text,
  distribuicao        text,
  vagas               text,
  previsao_entrega    text,
  -- Fica oculto no site enquanto for nulo ou zero (regra da copy).
  valor_a_partir_de   numeric(12, 2),
  registro_incorporacao text,

  -- localização
  endereco        text,
  bairro          text,
  cidade          text not null default 'Santarém',
  mapa_link       text,
  mapa_imagem     text,
  localizacao_texto text,

  -- atendimento
  atendimento_chamada text,
  botao_primario      text,
  botao_secundario    text,
  legenda_galeria     text,

  -- vitrine
  destaque      boolean not null default false,
  ordem         integer not null default 0,

  -- busca
  seo_titulo     text,
  seo_descricao  text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger empreendimentos_touch before update on public.empreendimentos
  for each row execute function public.touch_updated_at();

create index empreendimentos_status_idx on public.empreendimentos (status);
create index empreendimentos_destaque_idx on public.empreendimentos (destaque, ordem);
create index empreendimentos_situacao_idx on public.empreendimentos (situacao);

-- Listas livres do empreendimento. Tabelas em vez de text[] porque a CS
-- reordena e edita item a item no painel.
create table public.empreendimento_caracteristicas (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  texto             text not null,
  ordem             integer not null default 0
);

create table public.empreendimento_diferenciais (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  texto             text not null,
  ordem             integer not null default 0
);

create table public.empreendimento_referencias (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  texto             text not null,
  ordem             integer not null default 0
);

create table public.empreendimento_imagens (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  url               text not null,
  legenda           text,
  -- galeria: fotos do projeto. planta: a planta baixa. video: link externo.
  categoria         text not null default 'galeria'
                    check (categoria in ('galeria', 'planta', 'video')),
  ordem             integer not null default 0,
  created_at        timestamptz not null default now()
);

create index empreendimento_imagens_idx
  on public.empreendimento_imagens (empreendimento_id, categoria, ordem);

-- =====================================================================
-- Unidades — o catálogo dentro de cada empreendimento
-- =====================================================================
create table public.unidades (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  identificacao     text not null,              -- "Casa 06", "Apartamento 304"
  tipo_id           uuid references public.tipos_unidade (id) on delete set null,
  andar             text,
  area_construida   text,
  terreno_dimensoes text,
  terreno_area      text,
  -- Nulo ou zero some do site. A CS cadastra a unidade antes de ter preço.
  valor             numeric(12, 2),
  situacao          text not null default 'disponivel'
                    check (situacao in ('disponivel', 'reservada', 'vendida')),
  -- As unidades provisórias da apresentação entram como rascunho até a CS
  -- confirmar valor e situação.
  status            text not null default 'rascunho'
                    check (status in ('rascunho', 'publicado')),
  observacao        text,
  ordem             integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger unidades_touch before update on public.unidades
  for each row execute function public.touch_updated_at();

create index unidades_empreendimento_idx
  on public.unidades (empreendimento_id, ordem);
create index unidades_situacao_idx on public.unidades (situacao);

-- =====================================================================
-- Marcos da empresa (a linha do tempo da home)
-- =====================================================================
create table public.marcos (
  id        uuid primary key default gen_random_uuid(),
  ano       text not null,
  texto     text not null,
  ordem     integer not null default 0
);

-- =====================================================================
-- Blog
-- =====================================================================
create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titulo        text not null,
  resumo        text,
  conteudo      text,
  capa_url      text,
  categoria     text,
  status        text not null default 'rascunho'
                check (status in ('rascunho', 'publicado')),
  seo_titulo    text,
  seo_descricao text,
  publicado_em  timestamptz,
  autor_id      uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

create index posts_publicados_idx on public.posts (status, publicado_em desc);

-- =====================================================================
-- Cadastro de interessados
--
-- Os campos saem da ata: a CS quer o perfil antes do atendimento.
-- =====================================================================
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  contato           text not null,
  profissao         text,
  renda_mensal      text,
  valor_entrada     text,
  empreendimento_id uuid references public.empreendimentos (id) on delete set null,
  unidade_id        uuid references public.unidades (id) on delete set null,
  mensagem          text,
  origem            text,                       -- a página de onde veio
  consentimento     boolean not null default false,
  situacao          text not null default 'novo'
                    check (situacao in ('novo', 'em_atendimento', 'convertido', 'arquivado')),
  anotacoes         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create index leads_recentes_idx on public.leads (created_at desc);

-- =====================================================================
-- Conteúdo editável do site (banner, faixa, títulos, CTAs)
-- =====================================================================
create table public.site_settings (
  chave       text primary key,
  valor       jsonb not null default '{}'::jsonb,
  descricao   text,
  publico     boolean not null default true,     -- false = só o painel enxerga
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles (id) on delete set null
);

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- RLS
--
-- Regra geral: o site anônimo só enxerga o que está publicado; quem tem
-- perfil ativo gerencia tudo.
-- =====================================================================
alter table public.profiles                       enable row level security;
alter table public.tipos_empreendimento           enable row level security;
alter table public.tipos_unidade                  enable row level security;
alter table public.empreendimentos                enable row level security;
alter table public.empreendimento_caracteristicas enable row level security;
alter table public.empreendimento_diferenciais    enable row level security;
alter table public.empreendimento_referencias     enable row level security;
alter table public.empreendimento_imagens         enable row level security;
alter table public.unidades                       enable row level security;
alter table public.marcos                         enable row level security;
alter table public.posts                          enable row level security;
alter table public.leads                          enable row level security;
alter table public.site_settings                  enable row level security;

-- perfis
create policy "perfil proprio" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "edita proprio perfil" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "admin gerencia perfis" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- tipos: o site precisa deles para montar os filtros
create policy "tipos visiveis" on public.tipos_empreendimento
  for select to anon, authenticated using (true);
create policy "equipe gerencia tipos emp" on public.tipos_empreendimento
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "tipos unidade visiveis" on public.tipos_unidade
  for select to anon, authenticated using (true);
create policy "equipe gerencia tipos un" on public.tipos_unidade
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- empreendimentos
create policy "empreendimentos publicados" on public.empreendimentos
  for select to anon, authenticated
  using (status = 'publicado' or public.is_staff());
create policy "equipe gerencia empreendimentos" on public.empreendimentos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- As listas e imagens seguem a visibilidade do empreendimento dono.
create policy "caracteristicas visiveis" on public.empreendimento_caracteristicas
  for select to anon, authenticated using (
    exists (select 1 from public.empreendimentos e
            where e.id = empreendimento_id
              and (e.status = 'publicado' or public.is_staff()))
  );
create policy "equipe gerencia caracteristicas" on public.empreendimento_caracteristicas
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "diferenciais visiveis" on public.empreendimento_diferenciais
  for select to anon, authenticated using (
    exists (select 1 from public.empreendimentos e
            where e.id = empreendimento_id
              and (e.status = 'publicado' or public.is_staff()))
  );
create policy "equipe gerencia diferenciais" on public.empreendimento_diferenciais
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "referencias visiveis" on public.empreendimento_referencias
  for select to anon, authenticated using (
    exists (select 1 from public.empreendimentos e
            where e.id = empreendimento_id
              and (e.status = 'publicado' or public.is_staff()))
  );
create policy "equipe gerencia referencias" on public.empreendimento_referencias
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "imagens visiveis" on public.empreendimento_imagens
  for select to anon, authenticated using (
    exists (select 1 from public.empreendimentos e
            where e.id = empreendimento_id
              and (e.status = 'publicado' or public.is_staff()))
  );
create policy "equipe gerencia imagens" on public.empreendimento_imagens
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- unidades: publicadas, e só dentro de empreendimento publicado
create policy "unidades publicadas" on public.unidades
  for select to anon, authenticated using (
    public.is_staff() or (
      status = 'publicado'
      and exists (select 1 from public.empreendimentos e
                  where e.id = empreendimento_id and e.status = 'publicado')
    )
  );
create policy "equipe gerencia unidades" on public.unidades
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- marcos
create policy "marcos visiveis" on public.marcos
  for select to anon, authenticated using (true);
create policy "equipe gerencia marcos" on public.marcos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- blog
create policy "posts publicados" on public.posts
  for select to anon, authenticated
  using (status = 'publicado' or public.is_staff());
create policy "equipe gerencia posts" on public.posts
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- leads: qualquer visitante cria o seu; só a equipe lê.
create policy "visitante cadastra" on public.leads
  for insert to anon, authenticated with check (true);
create policy "equipe le leads" on public.leads
  for select to authenticated using (public.is_staff());
create policy "equipe gerencia leads" on public.leads
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "admin apaga leads" on public.leads
  for delete to authenticated using (public.is_admin());

-- configurações do site
create policy "configuracoes publicas" on public.site_settings
  for select to anon, authenticated using (publico or public.is_staff());
create policy "equipe gerencia configuracoes" on public.site_settings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
-- Storage: um balde público para as fotos dos empreendimentos
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('midia', 'midia', true)
on conflict (id) do nothing;

create policy "midia leitura publica" on storage.objects
  for select to anon, authenticated using (bucket_id = 'midia');
create policy "equipe envia midia" on storage.objects
  for insert to authenticated with check (bucket_id = 'midia' and public.is_staff());
create policy "equipe atualiza midia" on storage.objects
  for update to authenticated using (bucket_id = 'midia' and public.is_staff());
create policy "equipe apaga midia" on storage.objects
  for delete to authenticated using (bucket_id = 'midia' and public.is_staff());

-- =====================================================================
-- Novo usuário do Supabase Auth vira perfil automaticamente
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
