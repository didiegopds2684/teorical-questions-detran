# Guia de Hospedagem Gratuita — Simulado Detran

Stack: **Neon** (PostgreSQL gratuito) + **Render** (API + frontend estático gratuitos)

Custo total: **R$ 0,00**

---

## Visão Geral

| Serviço | O que hospeda | Plano |
|---------|--------------|-------|
| [neon.tech](https://neon.tech) | Banco PostgreSQL | Free (0,5 GB, serverless) |
| [render.com](https://render.com) | API Node.js | Free (750 h/mês) |
| [render.com](https://render.com) | Frontend React (estático) | Free (ilimitado) |

---

## Passo 1 — Criar o banco no Neon

1. Acesse **https://neon.tech** e crie uma conta (pode usar login do GitHub).
2. Clique em **"New Project"**, dê um nome (ex: `detran`) e escolha a região **US East** ou **US West**.
3. Após criar, vá em **"Connection Details"** e copie a **Connection String** no formato:
   ```
   postgresql://usuario:senha@host.neon.tech/dbname?sslmode=require
   ```
4. Guarde essa string — você vai usá-la no próximo passo.

---

## Passo 2 — Fazer o deploy no Render via Blueprint

O arquivo `render.yaml` na raiz do projeto já configura tudo automaticamente.

1. Acesse **https://render.com** e crie uma conta (pode usar login do GitHub).
2. No dashboard, clique em **"New +"** → **"Blueprint"**.
3. Conecte seu repositório GitHub (autorize o acesso se necessário).
4. Selecione o repositório `teorical-questions-detran`.
5. O Render vai ler o `render.yaml` e mostrar os serviços que serão criados:
   - `detran-api` — API Node.js
   - `detran-frontend` — site estático React
6. Na tela de configuração, preencha as variáveis obrigatórias:
   - **`DATABASE_URL`** → cole a Connection String do Neon (Passo 1)
   - **`VITE_API_URL`** → cole `https://detran-api.onrender.com`
     _(o Render forma a URL como `https://<nome-do-serviço>.onrender.com`)_
7. Clique em **"Apply"** para iniciar o deploy.

---

## Passo 3 — Aguardar o deploy e rodar as migrations

O Render executa `npm run migrate && npm start` automaticamente no startup da API.
Isso cria todas as tabelas no banco do Neon na primeira vez que o serviço iniciar.

Acompanhe os logs em **Render dashboard → detran-api → Logs**.
Você verá mensagens como:
```
Running migrations...
Migration applied: 001_create_questions.sql
Server running on port 10000
```

---

## Passo 4 — Importar as questões

Após a API estar online, importe o banco de questões via script. Você precisa rodar isso uma vez localmente apontando para o banco do Neon.

1. Crie um arquivo `.env` local (copie do `.env.example`) e ajuste:
   ```env
   DATABASE_URL=postgresql://usuario:senha@host.neon.tech/dbname?sslmode=require
   ```
2. Rode o script de importação:
   ```bash
   npm run import:questions
   ```

---

## Passo 5 — Verificar as URLs

Após o deploy concluir, o Render exibirá as URLs públicas:

| Serviço | URL |
|---------|-----|
| API | `https://detran-api.onrender.com` |
| Frontend | `https://detran-frontend.onrender.com` |

Acesse o frontend no browser e teste um simulado para confirmar que está tudo funcionando.

---

## Limitações do plano gratuito

| Limitação | Impacto |
|-----------|---------|
| API "dorme" após 15 min sem requisições | A primeira requisição após inatividade demora ~30 s |
| 750 h/mês de CPU para a API | Suficiente para uso contínuo num único serviço |
| Neon: 0,5 GB de armazenamento | Suficiente para o banco de questões |
| Frontend estático: sem limitação prática | — |

Para eliminar o "sleep" da API gratuitamente, use um serviço de ping como
**UptimeRobot** (https://uptimerobot.com) configurado para chamar
`https://detran-api.onrender.com/health` a cada 5 minutos.

---

## Variáveis de ambiente (referência)

| Variável | Onde configurar | Valor |
|----------|----------------|-------|
| `DATABASE_URL` | Render → detran-api → Environment | Connection string do Neon |
| `ADMIN_API_KEY` | Gerado automaticamente pelo Render | — |
| `VITE_API_URL` | Injetado automaticamente pelo render.yaml | URL da detran-api |
| `NODE_ENV` | render.yaml | `production` |

---

## Re-deploy após mudanças no código

O Render faz deploy automático a cada push para a branch `main` do repositório.
Basta fazer `git push origin main` — nenhuma ação manual é necessária.
