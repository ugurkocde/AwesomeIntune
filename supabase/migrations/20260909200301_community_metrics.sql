-- Only aggregate community data. The ingestion token itself stays outside Git.
create table public.community_metrics (
  id boolean primary key default true check (id),
  member_count integer check (member_count between 1 and 1000000),
  observed_at timestamptz,
  ingest_hash text not null check (length(ingest_hash) = 64)
);
alter table public.community_metrics enable row level security;
revoke all on public.community_metrics from anon, authenticated;
grant select, insert, update on public.community_metrics to service_role;

-- Machine ingestion is authenticated by a dedicated high-entropy token, not a
-- user session. This function can update only the singleton aggregate row.
create function public.update_community_metrics(p_token text, p_count integer, p_observed_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_token is null or length(p_token) <> 64 or not exists (
    select 1 from public.community_metrics where id = true
      and ingest_hash = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')),'hex')
  ) then raise exception 'Unauthorized' using errcode = '42501'; end if;
  if p_count is null or p_count < 1 or p_count > 1000000 or p_observed_at is null
    or p_observed_at > now() + interval '2 minutes' or p_observed_at < now() - interval '15 minutes'
    then raise exception 'Invalid metrics'; end if;
  update public.community_metrics set member_count=p_count, observed_at=p_observed_at
    where id=true and (observed_at is null or p_observed_at > observed_at);
end;
$$;
revoke all on function public.update_community_metrics(text,integer,timestamptz) from public, authenticated;
grant execute on function public.update_community_metrics(text,integer,timestamptz) to anon;
