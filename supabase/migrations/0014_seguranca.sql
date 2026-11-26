-- =====================================================================
-- Revisão de segurança.
--
-- 1. Funções internas deixam de ser chamáveis pela API pública. As de
--    gatilho (handle_new_user, protege_perfis) não são chamadas por
--    ninguém; is_admin e pode só servem às políticas de quem está logado.
--    is_staff continua liberada para visitante: as políticas públicas
--    perguntam "publicado OU equipe", e para visitante ela só responde
--    "não".
-- 2. touch_updated_at com search_path fixo (aviso do Supabase).
-- 3. Registro de tentativas, para limitar login errado e cadastro em
--    série. Só o servidor lê e escreve (chave de serviço); as chaves
--    guardadas são hash, nunca o IP ou o e-mail em texto.
-- 4. Cadastro de interessado passa a entrar só pelo servidor do site,
--    que valida e limita. Antes, a chave pública deixava gravar direto
--    na tabela, sem passar por limite nenhum.
-- =====================================================================

-- ------------------------------------------------------------ funções
alter function public.touch_updated_at() set search_path = '';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protege_perfis() from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.pode(text) from public, anon;
grant execute on function public.pode(text) to authenticated;

-- ------------------------------------------------------- tentativas
create table if not exists public.tentativas (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('login', 'cadastro')),
  chave text not null,
  criado_em timestamptz not null default now()
);

create index if not exists tentativas_busca
  on public.tentativas (tipo, chave, criado_em desc);

alter table public.tentativas enable row level security;
revoke all on public.tentativas from anon, authenticated;

comment on table public.tentativas is
  'Tentativas recentes de login errado e de cadastro, por hash de IP ou de conta. Só a chave de serviço acessa.';

-- ---------------------------------------------------------- cadastros
drop policy if exists "visitante cadastra" on public.leads;

-- Tamanho máximo dos campos: um cadastro não carrega texto infinito.
alter table public.leads
  add constraint leads_tamanhos check (
    char_length(nome) <= 160
    and char_length(contato) <= 60
    and char_length(coalesce(profissao, '')) <= 120
    and char_length(coalesce(renda_mensal, '')) <= 60
    and char_length(coalesce(valor_entrada, '')) <= 60
    and char_length(coalesce(mensagem, '')) <= 2000
    and char_length(coalesce(origem, '')) <= 200
  );
