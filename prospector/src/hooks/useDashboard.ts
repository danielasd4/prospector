import { useQuery } from '@tanstack/react-query'
import { getLeadStats, getLeads } from '../lib/supabase'
import { isEligibleForFollowup } from '../utils/date'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getLeadStats,
  })
}

export function useFollowupLeads(followup1Days = 2) {
  return useQuery({
    queryKey: ['followup-leads'],
    queryFn: async () => {
      const leads = await getLeads({ status: 'contatado' })
      return leads.filter((l: any) => {
        const { followup1, followup2 } = isEligibleForFollowup(l, followup1Days)
        return followup1 || followup2
      })
    },
  })
}

export function useNextLead() {
  return useQuery({
    queryKey: ['next-lead'],
    queryFn: async () => {
      const leads = await getLeads({ status: 'novo' })
      if (!leads.length) return null
      return leads.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0]
    },
  })
}
