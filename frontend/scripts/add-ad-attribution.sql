-- Which Apple Search Ads campaign brought an install (api/ads/attribution).
--
-- No reader and no account is named here. `install_id` is a random name the
-- app makes for itself so a retry can be matched to the right install, and
-- `token` is Apple's attribution token, held only until Apple answers and
-- never past `token_expires_at` (24 hours). The campaign numbers are from the
-- ad account, not from the phone.
create table if not exists public.ad_attribution (
  install_id text primary key,
  token text,
  token_expires_at timestamptz,
  attributed boolean,
  campaign_id bigint,
  ad_group_id bigint,
  keyword_id bigint,
  conversion_type text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- The sweep looks for tokens past their day.
create index if not exists ad_attribution_token_expiry
  on public.ad_attribution (token_expires_at)
  where token is not null;

-- Only the server touches this table; no reader may read it.
alter table public.ad_attribution enable row level security;

-- The 24-hour promise, kept by the database itself. Vercel's free plan allows
-- one scheduled run a day, which is not often enough, so the sweep lives here:
-- every hour, any token past its day is cleared. The campaign numbers stay;
-- they say nothing about anyone.
create extension if not exists pg_cron;

select cron.schedule(
  'ad-attribution-token-sweep',
  '0 * * * *',
  $$update public.ad_attribution
      set token = null
    where token is not null
      and token_expires_at < now()$$
);
