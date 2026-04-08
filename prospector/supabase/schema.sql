-- ============================================================
-- PROSPECTOR — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS leads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  segmento      TEXT,
  cidade        TEXT,
  telefone      TEXT,
  instagram     TEXT,
  site          TEXT,
  endereco      TEXT,
  google_link   TEXT,
  origem        TEXT DEFAULT 'manual',
  status        TEXT DEFAULT 'novo'
                CHECK (status IN ('novo','contatado','respondeu','sem_resposta','fechado','nao_interessado')),
  mensagem_enviada     BOOLEAN DEFAULT false,
  data_primeiro_contato TIMESTAMPTZ,
  data_ultimo_contato   TIMESTAMPTZ,
  observacoes   TEXT,
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to leads table (safe to run even if columns exist)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subsegmento text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_link text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_nivel text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diagnostico jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mensagem_gerada text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_1_enviado boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_2_enviado boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Tabela de configurações do usuário (legacy)
CREATE TABLE IF NOT EXISTS configuracoes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave           TEXT NOT NULL,
  valor           TEXT,
  user_id         UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- interaction_logs table
CREATE TABLE IF NOT EXISTS interaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  tipo text,
  descricao text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_logs" ON interaction_logs;
CREATE POLICY "users_own_logs" ON interaction_logs FOR ALL USING (auth.uid() = user_id);

-- message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento text NOT NULL,
  titulo text,
  conteudo text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_templates" ON message_templates;
CREATE POLICY "users_own_templates" ON message_templates FOR ALL USING (auth.uid() = user_id);

-- app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  followup_1_days integer DEFAULT 2,
  followup_2_days integer DEFAULT 5,
  default_country_code text DEFAULT '55',
  generic_template text,
  enable_score boolean DEFAULT true,
  enable_diagnostico boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_settings" ON app_settings;
CREATE POLICY "users_own_settings" ON app_settings FOR ALL USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated" ON leads;
DROP POLICY IF EXISTS "Allow all for authenticated" ON configuracoes;

-- User-scoped policies for leads
CREATE POLICY "users_own_leads" ON leads FOR ALL USING (auth.uid() = user_id);

-- Policy for configuracoes
CREATE POLICY "users_own_config" ON configuracoes FOR ALL USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_segmento_idx ON leads(segmento);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
