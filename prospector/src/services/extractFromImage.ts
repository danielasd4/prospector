export interface ExtractedLeadData {
  nome?: string
  telefone?: string
  instagram?: string
  site?: string
  endereco?: string
  cidade?: string
  categoria?: string
  segmento?: string
}

export async function extractLeadFromImage(imageBase64: string): Promise<ExtractedLeadData> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('Chave OpenAI não configurada')

  const prompt = `Você é um assistente que extrai informações de negócios a partir de prints do Google Maps ou de perfis de empresas.

Analise a imagem e extraia as seguintes informações, se visíveis:
- nome: nome do negócio
- telefone: número de telefone (apenas dígitos, sem formatação, com DDD)
- instagram: @ do perfil ou URL do Instagram
- site: URL do site
- endereco: endereço completo
- cidade: apenas a cidade
- categoria: categoria ou tipo do negócio (ex: "Clínica estética", "Restaurante", "Mecânica")
- segmento: um dos seguintes valores exatos: "Oficina mecânica", "Clínica estética", "Restaurante", "Dentista", "Academia", "Imobiliária", "Advogado", "Loja", "Outro"

Responda APENAS com um JSON válido, sem explicações. Exemplo:
{
  "nome": "Clínica Silva",
  "telefone": "11999998888",
  "instagram": "@clinicasilva",
  "site": "https://clinicasilva.com.br",
  "endereco": "Rua das Flores, 123",
  "cidade": "São Paulo",
  "categoria": "Clínica estética",
  "segmento": "Clínica estética"
}

Se não encontrar uma informação, omita o campo. Não invente dados.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erro ao processar imagem')
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'

  try {
    const cleaned = content.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as ExtractedLeadData
  } catch {
    return {}
  }
}

export function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/...;base64, prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
