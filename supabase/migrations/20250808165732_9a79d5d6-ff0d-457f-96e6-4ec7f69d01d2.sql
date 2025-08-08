-- Create goal_reminders table with correct FK type to learning_goals (integer)
create table if not exists public.goal_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_id integer not null references public.learning_goals(id) on delete cascade,
  active boolean not null default true,
  days_of_week int[] not null default '{}', -- 0=Sun ... 6=Sat
  reminder_time time not null,
  notify_channel text not null default 'email' check (notify_channel in ('email','push')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goal_reminders enable row level security;

create policy "Users can view their goal reminders"
  on public.goal_reminders for select
  using (auth.uid() = user_id);

create policy "Users can manage their goal reminders"
  on public.goal_reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp_goal_reminders ON public.goal_reminders;
create trigger set_timestamp_goal_reminders
before update on public.goal_reminders
for each row execute function public.update_updated_at_column();

-- Helpful index
create index if not exists idx_goal_reminders_user_active on public.goal_reminders(user_id, active);
