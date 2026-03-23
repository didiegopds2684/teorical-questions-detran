# Autocurso API

API REST em **Node 20**, **Express**, **TypeScript** e **PostgreSQL** para servir o banco de questões extraído em [`tools/extractor/data/questions.json`](tools/extractor/data/questions.json).

- Contrato HTTP: **OpenAPI 3.0** em [`openapi/openapi.yaml`](openapi/openapi.yaml) (também servido em `GET /openapi.json`).
- Documentação interativa: `GET /docs` (Swagger UI), exceto se `ENABLE_SWAGGER=false`.

## Requisitos

- Node.js >= 20
- PostgreSQL 16+ (local ou Docker)

## Desenvolvimento local

### 1. Banco de dados

Na raiz do repositório:

```bash
docker compose up -d
```

Isso sobe Postgres em `localhost:5432` com:

- Banco `autocurso` (desenvolvimento)
- Banco `autocurso_test` (testes de integração)

Credenciais padrão: `postgres` / `postgres` (veja [`docker-compose.yml`](docker-compose.yml)).

### 2. Variáveis de ambiente

```bash
cp .env.example .env
# Ajuste DATABASE_URL se necessário
```

### 3. Instalar dependências e migrar

```bash
npm install
npm run migrate
```

### 4. Importar questões (uma vez ou após atualizar o JSON)

```bash
npm run import:questions
```

Por padrão o script lê `tools/extractor/data/questions.json`. Use `QUESTIONS_JSON_PATH` para outro caminho.

### 5. Subir a API

```bash
npm run dev
```

- API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/docs>
- Health: <http://localhost:3000/health>

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor com hot reload (`tsx`) |
| `npm run build` | Compila para `dist/` |
| `npm start` | Produção: `node dist/server.js` (migrações rodam na subida) |
| `npm run migrate` | Executa migrações SQL em `migrations/` |
| `npm run import:questions` | Importa/atualiza questões a partir do JSON (upsert por `id`) |
| `npm test` | Testes (Vitest) |
| `npm run test:coverage` | Testes + cobertura |
| `npm run ci` | `build` + `test:coverage` |
| `npm run lint:openapi` | Valida `openapi/openapi.yaml` (Redocly) |

## Endpoints principais

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/health` | Saúde do serviço |
| GET | `/openapi.json` | Especificação OpenAPI (JSON) |
| GET | `/docs` | Swagger UI |
| GET | `/questions` | Lista paginada (`page`, `limit`, `parte`, `modulo_numero`, `dificuldade`, `q`) |
| GET | `/questions/random` | Uma questão aleatória (filtros opcionais) |
| GET | `/questions/:id` | Detalhe |
| GET | `/modules` | Módulos com contagem de questões |

Erros seguem o schema `ErrorResponse` no OpenAPI (`error.code`, `error.message`, `error.details`).

## Testes

Requer Postgres com o banco `autocurso_test` (gerado pelo `docker compose` da raiz).

```bash
# Na raiz do repo
docker compose up -d

npm run test:coverage
```

`src/test/setup-env.ts` define `TEST_DATABASE_URL` (sobrescrevível). A suíte de integração aplica migrações e insere dados de teste.

## Docker (imagem de produção)

Na raiz do repositório:

```bash
docker build -t autocurso-api .
docker run --rm -p 3000:3000 -e DATABASE_URL=postgresql://... autocurso-api
```

A imagem não inclui dados: use `import:questions` uma vez no ambiente (job manual ou release) após o primeiro deploy.

## Deploy no Railway

1. Crie um projeto e conecte o repositório (a API está na **raiz** do repo).
2. Adicione o plugin **PostgreSQL**; o Railway define `DATABASE_URL`.
3. **Build**: use o `Dockerfile` (veja [`railway.toml`](railway.toml)) ou build Nixpacks com `npm run build` e `npm start`.
4. **Variáveis**: `PORT` é injetado; não fixe manualmente em produção.
5. **Primeiro deploy**: após o banco vazio, rode **uma vez** o import das questões, por exemplo:

   ```bash
   railway run --service <seu-serviço> npm run import:questions
   ```

   (ou job one-off no dashboard), com `QUESTIONS_JSON_PATH` apontando para o JSON se necessário.

6. **Migrações**: o servidor executa `npm run migrate` implicitamente? **Atualmente as migrações rodam no startup** em `dist/server.js` via `runMigrations()` antes de escutar a porta.

7. **Release command** (opcional): você pode configurar no Railway `npm run migrate` como release step e remover migrações do startup no futuro para deploys mais controlados.

## Estrutura

```
openapi/openapi.yaml     # Contrato OpenAPI
migrations/              # SQL versionado
src/
  app.ts                 # Express + rotas + Swagger
  server.ts              # Entrada + migrações + HTTP server
  config/                # Env (Zod)
  db/                    # Pool + migrações
  modules/questions/     # Rotas, serviço, repositório
  scripts/               # import-questions
  test/                  # setup Vitest
tools/extractor/         # Extração PDF → JSON (Python), opcional
```
