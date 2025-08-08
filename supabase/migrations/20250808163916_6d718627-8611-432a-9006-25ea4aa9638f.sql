-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- Shared trigger function for updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Weekly summaries table to store generated weekly reports (for PDF/email export)
create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  week_end date not null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_summaries_unique_per_week unique (user_id, week_start, week_end)
);

alter table public.weekly_summaries enable row level security;

-- Owner-based RLS policies
create policy if not exists "Users can view their weekly summaries"
  on public.weekly_summaries for select
  using (auth.uid() = user_id);

create policy if not exists "Users can create their weekly summaries"
  on public.weekly_summaries for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their weekly summaries"
  on public.weekly_summaries for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their weekly summaries"
  on public.weekly_summaries for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger if not exists set_timestamp_weekly_summaries
before update on public.weekly_summaries
for each row execute function public.update_updated_at_column();

-- Goal reminders table for advanced goals + reminders
create table if not exists public.goal_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_id uuid not null references public.learning_goals(id) on delete cascade,
  active boolean not null default true,
  days_of_week int[] not null default '{}', -- 0=Sun ... 6=Sat
  reminder_time time not null,
  notify_channel text not null default 'email' check (notify_channel in ('email','push')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goal_reminders enable row level security;

create policy if not exists "Users can view their goal reminders"
  on public.goal_reminders for select
  using (auth.uid() = user_id);

create policy if not exists "Users can manage their goal reminders"
  on public.goal_reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger if not exists set_timestamp_goal_reminders
before update on public.goal_reminders
for each row execute function public.update_updated_at_column();

create index if not exists idx_goal_reminders_user_active on public.goal_reminders(user_id, active);

-- RPC to compute percentile rank of user's minutes vs peers for last 7 days
-- Note: This assumes appropriate RLS to allow aggregate access; adjust policies as needed in your project.
create or replace function public.get_weekly_benchmarks()
returns table (
  date date,
  user_minutes integer,
  minutes_percentile numeric
) language sql stable as $$
with last7 as (
  select generate_series((current_date - interval '6 days')::date, current_date::date, interval '1 day')::date as date
),
all_user_day_minutes as (
  select ds.user_id, ds.date, coalesce(ds.total_time_minutes, 0)::int as minutes
  from public.daily_stats ds
  join last7 l on l.date = ds.date
),
ranked as (
  select date,
         user_id,
         minutes,
         case when count(*) over (partition by date) > 1
              then percent_rank() over (partition by date order by minutes)
              else 1::numeric
         end as pr
  from all_user_day_minutes
)
select r.date, r.minutes as user_minutes, r.pr as minutes_percentile
from ranked r
where r.user_id = auth.uid()
order by r.date;
$$;

grant execute on function public.get_weekly_benchmarks() to authenticated;