# SPD — Simulador de Penalidades DESO

O SPD é um sistema avançado de gestão de compliance e simulação de penalidades regulatórias, focado nos contratos de concessão (CPA) e interdependência (CI) da Companhia de Saneamento de Sergipe (DESO).

## 🚀 Funcionalidades

- **Dashboard de Riscos**: Visão consolidada da exposição financeira e rito processual.
- **Simulador AGRESE**: Cálculo de multas baseado na Cláusula 22 do CPA (Agravantes/Atenuantes).
- **Equação D**: Descontos por lucros cessantes conforme Cláusula 11.2 do CI.
- **Matriz de Riscos**: Alocação de riscos e controle de processos de conformidade.
- **Gestão de Evidências**: Captura de tela integrada e geração de relatórios PDF.
- **Ambiente Híbrido**: Uso público via `localStorage` e gestão administrativa via Supabase.

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript.
- **Estilização**: CSS Vanilla com Design System Premium (Glassmorphism).
- **Backend**: Supabase (Auth & PostgreSQL).
- **Relatórios**: jsPDF & html2canvas.

## 📦 Como Publicar (Gratuitamente)

Siga estes passos para publicar o sistema em menos de 10 minutos:

### 1. Banco de Dados (Supabase)
1. Crie uma conta gratuita em [supabase.com](https://supabase.com).
2. Crie um novo projeto.
3. No **SQL Editor**, cole o conteúdo do arquivo `supabase-schema.sql` e execute.
4. Vá em **Authentication > Providers** e garanta que o e-mail está habilitado.
5. Crie seu usuário administrador em **Authentication > Users**.

### 2. Frontend (Vercel)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Importe seu repositório do GitHub.
3. Nas **Environment Variables**, adicione as chaves contidas no seu `.env.local` (ou siga o `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY` (Opcional)
4. Clique em **Deploy**.

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

---
Desenvolvido para gestão ativa e estratégica de conformidade regulatória.
