import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase não configurado. Adicione as variáveis no .env')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status)
  }
  if (filters.segmento && filters.segmento !== 'todos') {
    query = query.eq('segmento', filters.segmento)
  }
  if (filters.busca) {
    query = query.ilike('nome', `%${filters.busca}%`)
  }
  if (filters.orderBy) {
    query = query.order(filters.orderBy, { ascending: filters.ascending ?? false })
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createLead(lead) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLead(id, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLead(id) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('leads').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw error
}

export async function getLeadById(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) throw error
  return data
}

export async function getLeadStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { total: 0, novo: 0, contatado: 0, respondeu: 0, sem_resposta: 0, fechado: 0, nao_interessado: 0 }

  const { data, error } = await supabase
    .from('leads')
    .select('status, data_primeiro_contato')
    .eq('user_id', user.id)
  if (error) throw error

  const today = new Date().toDateString()
  const stats = {
    total: data.length,
    novo: 0,
    contatado: 0,
    respondeu: 0,
    sem_resposta: 0,
    fechado: 0,
    nao_interessado: 0,
    contatados_hoje: 0,
  }

  data.forEach((l) => {
    if (stats[l.status] !== undefined) stats[l.status]++
    if (l.data_primeiro_contato && new Date(l.data_primeiro_contato).toDateString() === today) {
      stats.contatados_hoje++
    }
  })

  return stats
}

// ─── Interaction Logs ─────────────────────────────────────────────────────────

export async function addInteractionLog(lead_id, tipo, descricao) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('interaction_logs').insert([{
    lead_id,
    tipo,
    descricao,
    user_id: user.id,
  }])
  if (error) console.error('Log error:', error)
}

export async function getInteractionLogs(lead_id) {
  const { data, error } = await supabase
    .from('interaction_logs')
    .select('*')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Templates ─────────────────────────────────────────────────────────────────

export async function getTemplates() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('segmento')
  if (error) return []
  return data
}

export async function upsertTemplate(template) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { error } = await supabase.from('message_templates').upsert({
    ...template,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'segmento,user_id' })
  if (error) throw error
}

// ─── App Settings ──────────────────────────────────────────────────────────────

export async function getAppSettings() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data
}

export async function saveAppSettings(settings) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { error } = await supabase.from('app_settings').upsert({
    ...settings,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw error
}

// ─── Configurações (legacy) ─────────────────────────────────────────────────────

export async function getConfig(chave) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', chave)
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data?.valor
}

export async function setConfig(chave, valor) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { error } = await supabase
    .from('configuracoes')
    .upsert({ chave, valor, user_id: user.id }, { onConflict: 'chave' })
  if (error) throw error
}
