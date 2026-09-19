-- Per-recipient delivery tracking for the new-tool notification job. The job
-- records each successful (tool, subscriber) pair, so a retry after a partial
-- failure only sends to recipients who have not received that tool yet. This
-- removes reliance on Resend's 24-hour idempotency window.
create table if not exists public.notification_deliveries (
  tool_id text not null,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (tool_id, subscriber_id)
);

create index if not exists notification_deliveries_subscriber_idx
  on public.notification_deliveries (subscriber_id);

alter table public.notification_deliveries enable row level security;
revoke all on public.notification_deliveries from anon, authenticated;
grant select, insert, delete on public.notification_deliveries to service_role;
