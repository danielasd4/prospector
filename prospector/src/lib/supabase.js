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
  let query = supabase
    .from('leads')
    .select('*')
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
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function getLeadStats() {
  const { data, error } = await supabase.from('leads').select('status')
  if (error) throw error

  const stats = {
    total: data.length,
    novo: 0,
    contatado: 0,
    respondeu: 0,
    sem_resposta: 0,
    fechado: 0,
    nao_interessado: 0,
  }

  data.forEach((l) => {
    if (stats[l.status] !== undefined) stats[l.status]++
  })

  return stats
}

// ─── Configurações ─────────────────────────────────────────────────────────────

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
