-- =====================================================================
-- Usuários com nível de acesso, login por nome e pixels do site
-- =====================================================================
--
-- Três níveis. O mapa é o mesmo de src/lib/permissoes.ts — mudou um,
-- mude o outro:
--
--   admin      tudo, inclusive usuários e pixels
--   editor     conteúdo do site e blog
--   comercial  empreendimentos, unidades, tipos e cadastros
--
-- A conta principal (a da Carolina) é um administrador que ninguém
-- rebaixa, suspende ou apaga — nem outro administrador.

-- ---------------------------------------------------------------------
-- 1. Perfis: nível novo, usuário e conta principal
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'editor', 'comercial'));

alter table public.profiles add column if not exists usuario text;
alter table public.profiles add column if not exists principal boolean not null default false;

alter table public.profiles drop constraint if exists profiles_usuario_formato;
alter table public.profiles
  add constraint profiles_usuario_formato
  check (usuario is null or usuario ~ '^[a-z0-9][a-z0-9._-]{1,38}[a-z0-9]$');

create unique index if not exists profiles_usuario_idx
  on public.profiles (lower(usuario)) where usuario is not null;

-- Uma conta principal só.
create unique index if not exists profiles_principal_idx
  on public.profiles (principal) where principal;

comment on column public.profiles.usuario is
  'Nome de acesso (carolina, joao.silva). Entra no login no lugar do e-mail.';
comment on column public.profiles.principal is
  'Conta dona do painel. Não pode ser rebaixada, suspensa nem apagada.';

-- ---------------------------------------------------------------------
-- 2. Quem pode o quê
-- ---------------------------------------------------------------------
create or replace function public.pode(area text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and ativo
      and (
        role = 'admin'
        or (role = 'editor' and area in ('conteudo', 'blog'))
        or (role = 'comercial' and area in ('obras', 'cadastros'))
      )
  );
$$;

revoke all on function public.pode(text) from public;
grant execute on function public.pode(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Ninguém se promove, e a conta principal não cai
--
-- A política "edita proprio perfil" deixa a pessoa mudar a própria linha,
-- e RLS não restringe coluna: sem isto, um editor rodaria
-- `update profiles set role = 'admin'` e viraria administrador.
-- ---------------------------------------------------------------------
create or replace function public.protege_perfis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.principal then
      raise exception 'A conta principal não pode ser apagada';
    end if;
    return old;
  end if;

  -- A conta principal vale para todo mundo, servidor incluído.
  if old.principal and (
    not new.principal or new.role <> 'admin' or not new.ativo
  ) then
    raise exception 'A conta principal continua administradora e ativa';
  end if;

  -- Sem usuário autenticado é o servidor (chave de serviço), que já
  -- conferiu quem pediu antes de chegar aqui.
  if auth.uid() is not null and not public.is_admin() and (
    new.role is distinct from old.role
    or new.ativo is distinct from old.ativo
    or new.principal is distinct from old.principal
    or new.usuario is distinct from old.usuario
  ) then
    raise exception 'Só administradores mudam nível, situação ou usuário';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protege on public.profiles;
create trigger profiles_protege
  before update or delete on public.profiles
  for each row execute function public.protege_perfis();

-- Conta nova nasce no nível mais baixo; promover é ato do painel.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Políticas por área
-- ---------------------------------------------------------------------
-- obras
drop policy if exists "equipe gerencia empreendimentos" on public.empreendimentos;
create policy "obras gerencia empreendimentos" on public.empreendimentos
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia caracteristicas" on public.empreendimento_caracteristicas;
create policy "obras gerencia caracteristicas" on public.empreendimento_caracteristicas
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia diferenciais" on public.empreendimento_diferenciais;
create policy "obras gerencia diferenciais" on public.empreendimento_diferenciais
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia referencias" on public.empreendimento_referencias;
create policy "obras gerencia referencias" on public.empreendimento_referencias
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia imagens" on public.empreendimento_imagens;
create policy "obras gerencia imagens" on public.empreendimento_imagens
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia unidades" on public.unidades;
create policy "obras gerencia unidades" on public.unidades
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia tipos emp" on public.tipos_empreendimento;
create policy "obras gerencia tipos emp" on public.tipos_empreendimento
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

drop policy if exists "equipe gerencia tipos un" on public.tipos_unidade;
create policy "obras gerencia tipos un" on public.tipos_unidade
  for all to authenticated using (public.pode('obras')) with check (public.pode('obras'));

-- conteúdo do site
drop policy if exists "equipe gerencia marcos" on public.marcos;
create policy "conteudo gerencia marcos" on public.marcos
  for all to authenticated using (public.pode('conteudo')) with check (public.pode('conteudo'));

-- Os pixels moram em site_settings, mas só o administrador mexe neles:
-- um script ali roda em toda página do site.
drop policy if exists "equipe gerencia configuracoes" on public.site_settings;
create policy "conteudo gerencia configuracoes" on public.site_settings
  for all to authenticated
  using ((public.pode('conteudo') and chave <> 'rastreamento') or public.is_admin())
  with check ((public.pode('conteudo') and chave <> 'rastreamento') or public.is_admin());

-- blog
drop policy if exists "equipe gerencia posts" on public.posts;
create policy "blog gerencia posts" on public.posts
  for all to authenticated using (public.pode('blog')) with check (public.pode('blog'));

-- cadastros: só quem atende lê os dados de contato
drop policy if exists "equipe le leads" on public.leads;
create policy "cadastros le leads" on public.leads
  for select to authenticated using (public.pode('cadastros'));
drop policy if exists "equipe gerencia leads" on public.leads;
create policy "cadastros gerencia leads" on public.leads
  for update to authenticated using (public.pode('cadastros')) with check (public.pode('cadastros'));

-- ---------------------------------------------------------------------
-- 5. Bloco dos pixels e scripts
-- ---------------------------------------------------------------------
insert into public.site_settings (chave, valor, publico)
values ('rastreamento', '{}'::jsonb, true)
on conflict (chave) do nothing;

-- ---------------------------------------------------------------------
-- 6. A conta que já existe vira a principal, no nome da Carolina
--
-- Só roda se ainda não houver conta principal: é a primeira conta de
-- administrador criada, a que o Petr entrega para ela.
-- ---------------------------------------------------------------------
update public.profiles
set nome = 'Carolina Ferreira', usuario = 'carolina', principal = true
where id = (
    select id from public.profiles
    where role = 'admin'
    order by created_at
    limit 1
  )
  and not exists (select 1 from public.profiles where principal);
