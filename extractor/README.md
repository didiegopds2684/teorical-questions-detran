# autocurso-2000 — Banco Nacional de Questões (extração)

Este repositório contém o PDF **Banco Nacional de Questões** (CNH) e um script que extrai as questões para arquivos estruturados (JSON, JSONL e CSV), prontos para uso em uma API REST ou import em banco de dados.

## Requisitos

- Python 3.10+ (recomendado)

## Instalação

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Extração

Na raiz do projeto (onde está `Banco Nacional de Questões.pdf`):

```bash
.venv/bin/python scripts/extract_questions.py
```

Opções:

```bash
.venv/bin/python scripts/extract_questions.py /caminho/para/o.pdf --out-dir ./data
```

## Saídas (`data/`)

| Arquivo | Descrição |
|--------|-----------|
| `questions.json` | Lista de questões (array JSON) |
| `questions.jsonl` | Uma questão por linha (NDJSON) |
| `questions.csv` | Mesmo conteúdo em CSV; incorretas em `incorreta_1` … `incorreta_3` |
| `extraction_report.json` | Total extraído, avisos de parse e problemas de validação |

## Modelo de cada questão

- `id`: identificador estável `p{parte}-m{modulo}-q{numero}` (ex.: `p1-m2-q10`)
- `parte`: `1` = banco principal; `2` = “Teste seus conhecimentos” (segunda seção do PDF)
- `modulo_numero`, `modulo_titulo`: módulo atual no PDF
- `numero`: número da questão **dentro do módulo**
- `dificuldade`: `facil` \| `intermediario` \| `dificil`
- `enunciado`, `alternativa_correta`, `comentario`
- `codigo_placa`: preenchido quando existir a linha “Código da placa:”
- `alternativas_incorretas`: lista com exatamente 3 strings
- `fonte`: caminho absoluto do PDF usado na extração

## Próximos passos (API REST)

1. Importar `data/questions.json` ou `questions.jsonl` em SQLite/Postgres.
2. Expor endpoints, por exemplo: `GET /questoes`, `GET /questoes/{id}`, `GET /questoes?modulo=1&parte=1`.
3. Para simulados, sortear N questões sem revelar a correta até `POST /respostas` (ou equivalente).

O parser foi ajustado ao texto extraído pelo `pypdf` (marcadores `●`, `✓`, `✗` no PDF original).
