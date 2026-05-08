# Vency Hub — Inteligência Financeira Multi-empresa

Plataforma estratégica para gestão financeira de múltiplas operações (PJ) e controle familiar (PF), com foco em valor/hora, previsibilidade de receita e automação de insights com IA.

## Tecnologias
- **Core**: React 19 + TypeScript + Vite
- **Estilização**: Tailwind CSS 4
- **Backend**: Supabase (Auth + DB + RLS)
- **Ícones**: Lucide React
- **IA**: Google Gemini (Integration)

## Estrutura do Projeto
- `/src/components`: Componentes modulares de interface.
- `/src/hooks`: Lógica de dados centralizada no `useDashboardData`.
- `/src/lib`: Utilitários, motores de cálculo e integração com Supabase.
- `/src/assets`: Recursos visuais e marcas.

## Como Rodar Localmente
1. Instale as dependências: `npm install`
2. Configure o `.env` com suas chaves do Supabase.
3. Inicie o servidor: `npm run dev`
