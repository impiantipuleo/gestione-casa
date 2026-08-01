import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://vbhvbvguhdeiwujewjzm.supabase.co';
const DEFAULT_KEY = 'sb_publishable_2jqauNNULfMPIfoxWEktaQ_jLoSQmXz';

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('gc_supabase_url') || import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
  const key = localStorage.getItem('gc_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
};

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    return createClient(url, key);
  } catch (err) {
    console.error("Errore inizializzazione Supabase:", err);
    return null;
  }
};

// SQL Schema script with Realtime publication enabled for all tables
export const SUPABASE_SQL_SCHEMA = `-- Schema SQL per Gestione Casa PWA con Realtime Abilitato
-- Esegui questo script nell'editor SQL di Supabase

-- 1. Tabella Utenti
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  password TEXT,
  permissions JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Tabella Spesa
CREATE TABLE IF NOT EXISTS public.groceries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT,
  priority TEXT,
  bought BOOLEAN DEFAULT false,
  added_by TEXT,
  bought_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.groceries ADD COLUMN IF NOT EXISTS bought_by TEXT;

-- 3. Tabella Compiti
CREATE TABLE IF NOT EXISTS public.chores (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to JSONB,
  due_date TEXT,
  points INT DEFAULT 10,
  frequency TEXT,
  status TEXT DEFAULT 'da_fare',
  completed_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabella Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  estimated_price NUMERIC(10,2) DEFAULT 0,
  category TEXT,
  priority TEXT,
  url TEXT,
  requester TEXT,
  purchased BOOLEAN DEFAULT false,
  purchased_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS purchased_by TEXT;

-- 5. Tabella Bollette e Spese
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  due_date TEXT,
  paid BOOLEAN DEFAULT false,
  paid_by TEXT,
  splits JSONB,
  provider TEXT,
  added_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS added_by TEXT;

-- Abilita le tabelle per le query pubbliche anonime (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groceries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Accesso totale utenti" ON public.users;
DROP POLICY IF EXISTS "Accesso totale spesa" ON public.groceries;
DROP POLICY IF EXISTS "Accesso totale compiti" ON public.chores;
DROP POLICY IF EXISTS "Accesso totale wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Accesso totale bollette" ON public.bills;

CREATE POLICY "Accesso totale utenti" ON public.users FOR ALL USING (true);
CREATE POLICY "Accesso totale spesa" ON public.groceries FOR ALL USING (true);
CREATE POLICY "Accesso totale compiti" ON public.chores FOR ALL USING (true);
CREATE POLICY "Accesso totale wishlist" ON public.wishlist FOR ALL USING (true);
CREATE POLICY "Accesso totale bollette" ON public.bills FOR ALL USING (true);

-- ABILITA LA SINCRONIZZAZIONE REALTIME DI SUPABASE SU TUTTE LE TABELLE
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.users, public.groceries, public.chores, public.wishlist, public.bills;
COMMIT;
`;
