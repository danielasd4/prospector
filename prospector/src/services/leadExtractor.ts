export interface ExtractedData {
  nome?: string
  categoria?: string
  telefone?: string
  instagram?: string
  site?: string
  endereco?: string
  cidade?: string
}

// Mock extractor - ready for real integration
export async function extractFromGoogleLink(link: string): Promise<ExtractedData> {
  // Future: integrate with scraping API or Google Places API
  // For now, extract what we can from URL patterns
  const data: ExtractedData = {}

  // Try to extract place name from URL
  try {
    const url = new URL(link)
    const pathParts = url.pathname.split('/')
    const placeIndex = pathParts.findIndex(p => p === 'place')
    if (placeIndex !== -1 && pathParts[placeIndex + 1]) {
      const rawName = pathParts[placeIndex + 1]
      data.nome = decodeURIComponent(rawName.replace(/\+/g, ' ')).replace(/-/g, ' ')
    }
    // Check for search params
    const q = url.searchParams.get('q')
    if (q && !data.nome) {
      data.nome = q.split(',')[0].trim()
    }
  } catch {}

  return data
}
