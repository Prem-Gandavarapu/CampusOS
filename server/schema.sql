create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('admin', 'student');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists students (
  user_id uuid primary key references users(id) on delete cascade,
  roll_number text not null unique,
  department text not null default 'Computer Science and Engineering',
  year_of_study smallint not null default 1 check (year_of_study between 1 and 6),
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on users(role);
create index if not exists students_roll_number_idx on students(roll_number);