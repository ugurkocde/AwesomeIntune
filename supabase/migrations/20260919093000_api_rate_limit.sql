-- Durable fixed-window rate limiting for public API routes. The website keeps
-- an in-memory limiter as a best-effort fallback; this table makes the limit
-- hold across serverless instances and cold starts.
create table if not exists public.api_rate_limits (
  bucket text primary key,
  window_start timestamptz not null,
  count integer not null
);

create index if not exists api_rate_limits_window_start_idx
  on public.api_rate_limits (window_start);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.api_rate_limits to service_role;

-- Atomically increments the counter for a bucket and reports whether the
-- request is still within the limit. Only the server-side service role may
-- call it; there is no anonymous access.
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_bucket is null or length(p_bucket) > 300 or p_bucket <> btrim(p_bucket)
    or p_limit < 1 or p_limit > 100000
    or p_window_seconds < 1 or p_window_seconds > 86400
  then
    raise exception 'Invalid rate limit parameters' using errcode = '22023';
  end if;

  -- Prune buckets untouched for a day so the table cannot grow without bound.
  delete from public.api_rate_limits where window_start < now() - interval '1 day';

  insert into public.api_rate_limits (bucket, window_start, count)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update
    set
      count = case
        when public.api_rate_limits.window_start
          < now() - make_interval(secs => p_window_seconds)
        then 1
        else public.api_rate_limits.count + 1
      end,
      window_start = case
        when public.api_rate_limits.window_start
          < now() - make_interval(secs => p_window_seconds)
        then now()
        else public.api_rate_limits.window_start
      end
  returning count into current_count;

  return current_count <= p_limit;
end;
$$;

-- Supabase default privileges grant execute to anon and authenticated, so
-- revoke those explicitly. Only the server-side service role may call it.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
