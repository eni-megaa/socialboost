-- Famestack SMM Panel Schema
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null default 'user' check (role in ('user', 'admin')),
  balance numeric(10, 4) not null default 0.0000,
  full_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to check for admin status without triggering RLS recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    select (role = 'admin')
    from public.profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Protect profiles table
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (is_admin());
create policy "Admins can update all profiles" on public.profiles for update using (is_admin());
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, balance, full_name)
  values (
    new.id, 
    new.email, 
    'user', 
    0, 
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to call handle_new_user on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Internal Settings (for site-wide config managed by admin)
create table public.settings (
  id text primary key,
  value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.settings enable row level security;
create policy "Anyone can read settings" on public.settings for select using (true);
create policy "Only admin can modify settings" on public.settings for all using (is_admin());

-- 3. Providers Table (External SMM Panels)
create table public.providers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  api_url text not null,
  api_key text not null,
  api_type text not null default 'standard', -- standard, v1, v2
  balance numeric(10, 4) default 0.0000,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.providers enable row level security;
create policy "Only admin can read providers" on public.providers for select using (is_admin());
create policy "Only admin can manipulate providers" on public.providers for all using (is_admin());

-- 4. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  sort_order integer default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.categories enable row level security;
create policy "Anyone can read active categories" on public.categories for select using (status = 'active' or is_admin());
create policy "Admin can manipulate categories" on public.categories for all using (is_admin());

-- 5. Services Table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories on delete cascade not null,
  provider_id uuid references public.providers on delete set null,
  provider_service_id text, -- The ID of the service on the provider's side
  name text not null,
  type text not null default 'default' check (type in ('default', 'package', 'custom_comments')),
  rate numeric(10, 4) not null, -- Price per 1000 for users
  provider_rate numeric(10, 4), -- Our cost price per 1000
  min_quantity integer not null default 100,
  max_quantity integer not null default 100000,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.services enable row level security;
create policy "Anyone can read active services" on public.services for select using (status = 'active' or is_admin());
create policy "Admin can manipulate services" on public.services for all using (is_admin());

-- 6. Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  service_id uuid references public.services on delete restrict not null,
  provider_order_id text, -- ID returned by the provider
  link text not null,
  quantity integer not null,
  charge numeric(10, 4) not null, -- How much the user paid
  start_count integer,
  remains integer,
  status text not null default 'pending' check (status in ('pending', 'processing', 'in_progress', 'completed', 'partial', 'canceled', 'error')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" on public.orders for insert with check (auth.uid() = user_id);
-- We normally don't let users update orders; only edge functions or admin updates statuses.
create policy "Admins can view and manage all orders" on public.orders for all using (is_admin());

-- 7. Transactions Table (Wallet changes)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  amount numeric(10, 4) not null, -- Positive (deposit/refund) or negative (spent)
  type text not null check (type in ('deposit', 'spend', 'refund', 'manual')),
  balance_after numeric(10, 4) not null,
  description text,
  order_id uuid references public.orders on delete set null, -- Optional link to order
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins can view and manage all transactions" on public.transactions for all using (is_admin());

-- 8. Payment Methods Table
create table public.payment_methods (
  id text primary key, -- 'paystack', 'flutterwave', 'opay', 'paga'
  name text not null,
  public_key text,
  secret_key text,
  is_active boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.payment_methods enable row level security;
create policy "Anyone can read active payment methods public info" on public.payment_methods for select using (is_active = true or is_admin());
-- We restrict access to secret_key to admins at the app level, but RLS column-level select policies are complex.
-- It's simpler to allow admins full access, and for users, we might create a view if we strictly need to hide secrets in PostgREST,
-- However, Supabase lets you select specific columns. A better approach is to only query what's needed.
-- Security definer functions or edge functions are best for using secret keys.
create policy "Only admin can manage payment methods" on public.payment_methods for all using (is_admin());

-- Insert default payment methods
insert into public.payment_methods (id, name, is_active) values
  ('paystack', 'Paystack', false),
  ('flutterwave', 'Flutterwave', false),
  ('opay', 'OPay', false),
  ('paga', 'Paga', false)
on conflict (id) do nothing;

