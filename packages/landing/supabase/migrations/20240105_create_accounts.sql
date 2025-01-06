-- Create accounts table
create table if not exists public.accounts (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  extension_id text unique,
  dashboard_last_login timestamp with time zone,
  extension_last_login timestamp with time zone
);

-- Enable RLS
alter table public.accounts enable row level security;

-- Create policies
create policy "Users can view own account"
  on public.accounts for select
  using ( auth.uid() = id );

create policy "Users can update own account"
  on public.accounts for update
  using ( auth.uid() = id );

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.accounts (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
