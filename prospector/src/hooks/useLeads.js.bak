import { useState, useEffect, useCallback } from 'react'
import { getLeads, updateLead, deleteLead, getLeadStats } from '../lib/supabase'

export function useLeads(filters = {}) {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [data, statsData] = await Promise.all([
        getLeads(filters),
        getLeadStats(),
      ])
      setLeads(data)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const update = useCallback(async (id, updates) => {
    const updated = await updateLead(id, updates)
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
    // Refresh stats
    getLeadStats().then(setStats).catch(console.error)
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await deleteLead(id)
    setLeads((prev) => prev.filter((l) => l.id !== id))
    getLeadStats().then(setStats).catch(console.error)
  }, [])

  return { leads, stats, loading, error, refresh: fetchLeads, update, remove }
}

export function useLeadActions(lead, onUpdate) {
  const updateStatus = useCallback(
    async (status) => {
      const updates = { status }
      if (status === 'contatado' && !lead.data_primeiro_contato) {
        updates.data_primeiro_contato = new Date().toISOString()
      }
      updates.data_ultimo_contato = new Date().toISOString()
      await onUpdate(lead.id, updates)
    },
    [lead, onUpdate]
  )

  const markContacted = useCallback(async () => {
    const updates = {
      status: 'contatado',
      mensagem_enviada: true,
      data_ultimo_contato: new Date().toISOString(),
    }
    if (!lead.data_primeiro_contato) {
      updates.data_primeiro_contato = new Date().toISOString()
    }
    await onUpdate(lead.id, updates)
  }, [lead, onUpdate])

  return { updateStatus, markContacted }
}
