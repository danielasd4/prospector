/**
 * Extração de informações de leads via OpenAI
 * Suporta: links do Google Maps e prints (imagens)
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const API_URL = 'https://api.openai.com/v1/chat/completions'

const SEGMENTOS = [
  'Oficina mecânica', 'Clínica estética', 'Restaurante', 'Dentista', 'Loja',
  'Imobiliária', 'Advogado', 'Salão de beleza', 'Farmácia', 'Academia',
  'Escola', 'Clínica médica', 'Pet shop', 'Padaria', 'Supermercado',
  'Hotel', 'Pousada', 'Bar', 'Cafeteria', 'Contabilidade', 'Outro'
]

/**
 * Extrai info a partir de um link do Google Maps
 */
export async function extractFromGoogleMapsLink(link) {
  if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY não configurada no .env')
  }

  const prompt = `Analise este link do Google Maps e extraia as informações do negócio:

Link: ${link}

Com base no link e no nome/dados que conseguir identificar na URL, retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura exata:
{
  "nome": "Nome do negócio",
  "segmento": "Um dos seguintes: ${SEGMENTOS.join(', ')}",
  "cidade": "Cidade/Estado",
  "telefone": "",
  "instagram": "",
  "site": "",
  "endereco": "",
  "google_link": "${link}",
  "origem": "google_maps",
  "confianca": "baixa|media|alta"
}

Notas:
- Tente identificar o tipo de negócio pelo nome na URL
- Se não conseguir extrair um campo, deixe string vazia
- O campo "confianca" indica a qualidade da extração
- Retorne APENAS o JSON, sem nenhum texto antes ou depois`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erro na API OpenAI')
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Não foi possível interpretar a resposta da IA')
  }
}

/**
 * Extrai info a partir de uma imagem (print da ficha do Google Maps)
 */
export async function extractFromImage(file) {
  if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY não configurada no .env')
  }

  // Converter file para base64
  const base64 = await fileToBase64(file)
  const mediaType = file.type || 'image/jpeg'

  const prompt = `Esta imagem é um print da ficha de um negócio (provavelmente do Google Maps, Google My Business, Instagram ou similar).

Extraia todas as informações do negócio visíveis na imagem e retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "nome": "Nome do negócio",
  "segmento": "Um dos seguintes: ${SEGMENTOS.join(', ')}",
  "cidade": "Cidade/Estado",
  "telefone": "Telefone com DDD",
  "instagram": "@ do perfil sem https://instagram.com/",
  "site": "URL do site",
  "endereco": "Endereço completo",
  "google_link": "",
  "origem": "print",
  "confianca": "baixa|media|alta"
}

Notas:
- Extraia telefone exatamente como aparece na imagem
- Para Instagram: se aparecer link ou @, extraia apenas o @username
- Se não conseguir extrair um campo, deixe string vazia
- Retorne APENAS o JSON`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${base64}` },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erro na API OpenAI')
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Não foi possível interpretar a resposta da IA')
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

export const SEGMENTOS_LIST = SEGMENTOS
