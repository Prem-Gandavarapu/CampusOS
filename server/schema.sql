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
create sequence if not exists complaint_number_seq start with 3000;
create table if not exists complaints (
  id text primary key default ('CMP-' || nextval('complaint_number_seq')::text),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  category text not null,
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  department text not null,
  authority text not null,
  sla text not null,
  status text not null default 'Received' check (status in ('Received', 'In review', 'Resolved')),
  location text not null,
  impact integer not null default 1,
  confidence integer not null default 94,
  description text not null,
  submitted_at timestamptz not null default now(),
  admin_email_status text not null default 'pending',
  resolution_summary text,
  resolved_by text,
  resolved_at timestamptz,
  student_email_status text
);
create index if not exists complaints_user_idx on complaints(user_id, submitted_at desc);
create index if not exists complaints_status_idx on complaints(status, priority, submitted_at desc);
do $$
declare
  seed_user uuid;
begin
  if not exists (select 1 from complaints) then
    select id into seed_user from users where role = 'student' order by created_at limit 1;
    if seed_user is not null then
      insert into complaints (user_id, title, category, priority, department, authority, sla, status, location, impact, confidence, description)
      values
        (seed_user, 'Projector failure', 'Infrastructure', 'High', 'Campus Operations', 'Academic Services Coordinator', '2 hours', 'In review', 'CSE Lab 204', 42, 96, 'The projector in CSE Lab 204 is not displaying the instructor workstation during an active lab session.'),
        (seed_user, 'Wi-Fi outage', 'Network & IT', 'High', 'Campus Operations', 'Network Operations', '2 hours', 'Received', 'Block B', 68, 95, 'Students in Block B cannot connect to the campus Wi-Fi network since the morning.'),
        (seed_user, 'Hostel water issue', 'Utilities', 'Medium', 'Campus Operations', 'Facilities Coordinator', '24 hours', 'In review', 'Hostel A', 24, 93, 'Water supply is intermittent on the second floor of Hostel A and affecting residents.'),
        (seed_user, 'Classroom AC failure', 'Infrastructure', 'Medium', 'Campus Operations', 'Facilities Coordinator', '24 hours', 'Received', 'Block C', 38, 92, 'The air conditioner in the Block C classroom is not cooling during afternoon lectures.'),
        (seed_user, 'Library printer issue', 'Library Services', 'Low', 'Campus Operations', 'Library Services Desk', '72 hours', 'Received', 'Library', 8, 94, 'The first-floor library printer is showing an error and cannot print student documents.');
    end if;
  end if;
end $$;

create table if not exists student_verification_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  roll_number text not null,
  email text not null,
  year_of_study smallint not null check (year_of_study between 1 and 6),
  branch text not null,
  section text not null,
  id_card_data text not null,
  id_card_mime text not null,
  confidence integer not null default 0,
  extracted_data jsonb not null default '{}'::jsonb,
  mismatches jsonb not null default '[]'::jsonb,
  recommendation text not null default 'MANUAL_REVIEW' check (recommendation in ('APPROVE','MANUAL_REVIEW','REJECT')),
  status text not null default 'Pending' check (status in ('Pending','AI Verified','Manual Review','Approved','Waiting List','Rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists verification_status_idx on student_verification_requests(status, created_at desc);
alter table student_verification_requests add column if not exists matches jsonb not null default '[]'::jsonb;
alter table student_verification_requests add column if not exists reason text not null default '';
