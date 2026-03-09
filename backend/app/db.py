"""Supabase client singleton."""
from __future__ import annotations

from functools import lru_cache

from supabase import create_client, Client

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return a Supabase client using the service role key (full access)."""
    return create_client(settings.supabase_url, settings.supabase_service_key)


@lru_cache(maxsize=1)
def get_supabase_anon() -> Client:
    """Return a Supabase client using the anon key (RLS-respecting)."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)
