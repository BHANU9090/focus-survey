-- Run this in Supabase → SQL Editor.
-- One row per completed survey. Public visitors (anon) can INSERT only; they can never read responses.

create table if not exists public.survey_responses (
  id                           uuid primary key default gen_random_uuid(),
  created_at                   timestamptz not null default now(),

  -- Section 1: About you
  q1_age_group                 text not null,
  q2_gender                    text not null,
  q3_situation                 text not null,
  q4_city                      text,

  -- Section 2: Focus & concentration
  q5_concentration_difficulty  text not null,
  q6_focus_duration            text not null,
  q7_focus_frequency           jsonb not null,   -- {"phone_distraction":"Often", ...}
  q8_struggle_situations       text[],
  q9_affecting_factors         text[],

  -- Section 3: Daily habits
  q10_phone_time               text not null,
  q11_sleep                    text not null,
  q12_caffeine                 text not null,
  q13_coping                   text[],

  -- Section 4: Focus-support products
  q14_purchased                text not null,
  q15_formats                  text[],
  q16_priorities               text[],
  q17_interest                 smallint not null check (q17_interest between 1 and 5),
  q18_price                    text not null,
  q19_hesitations              text[],

  -- Section 5: Final thoughts
  q20_change_one_thing         text check (char_length(q20_change_one_thing) <= 2000),
  q21_trust_factors            text check (char_length(q21_trust_factors) <= 2000),

  -- "Other, please specify" text, e.g. {"q3_situation":"Gig worker"}
  other_text                   jsonb,

  constraint q4_len   check (q4_city is null or char_length(q4_city) <= 80),
  constraint q9_max   check (q9_affecting_factors is null or cardinality(q9_affecting_factors) <= 3),
  constraint q16_max  check (q16_priorities is null or cardinality(q16_priorities) <= 3)
);

-- Row Level Security: anon may only insert.
alter table public.survey_responses enable row level security;

drop policy if exists "anon can insert responses" on public.survey_responses;
create policy "anon can insert responses"
  on public.survey_responses
  for insert
  to anon
  with check (true);

revoke all on public.survey_responses from anon, authenticated;
grant insert on public.survey_responses to anon;
-- No SELECT policy for anon: read results from the Supabase dashboard (Table Editor) or with the service role.

-- Handy view for analysis (queried from the dashboard / service role only)
create or replace view public.survey_summary as
select q1_age_group, q3_situation, q5_concentration_difficulty, q14_purchased,
       round(avg(q17_interest),2) as avg_interest, count(*) as responses
from public.survey_responses
group by 1,2,3,4;
revoke all on public.survey_summary from anon, authenticated;
