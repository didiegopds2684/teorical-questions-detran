#!/usr/bin/env python3
"""
Extrai o Banco Nacional de Questões (PDF) para JSON/JSONL/CSV com relatório de validação.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from pypdf import PdfReader

from question_schema import QuestionRecord, difficulty_from_pdf

# -----------------------------------------------------------------------------
# PDF → texto
# -----------------------------------------------------------------------------


def extract_text_from_pdf(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            parts.append(t)
    return "\n".join(parts)


# -----------------------------------------------------------------------------
# Pré-processamento de linhas
# -----------------------------------------------------------------------------

RE_PAGE_MARKER = re.compile(r"^--\s*\d+\s+of\s+\d+\s*--\s*$")
RE_CNH_HEADER = re.compile(
    r"^CNH do Brasil - Ministério dos Transportes - Secretaria Nacional de Trânsito\s*$"
)
RE_PARTE = re.compile(r"^PARTE\s+(\d+)\s*-\s*(.+)$")
RE_MODULO = re.compile(r"^MÓDULO\s+(\d+)\s*-\s*(.+)$")
# PDF real: bullet "●"; algumas extrações/OCR usam "l"; incorretas "✗" ou "7"
RE_QUESTION_START = re.compile(
    r"^\s*(?:[●•]\s*|l\s*)?\((Fácil|Intermediário|Difícil)\)\s+(\d+)\.\s*(.*)$"
)
RE_CODIGO_PLACA = re.compile(r"^Código da placa:\s*(.+)$", re.IGNORECASE)
RE_ALTERNATIVA_CORRETA = re.compile(r"^Alternativa correta:\s*(.*)$")
RE_COMENTARIO = re.compile(r"^Comentário:\s*(.*)$")
RE_RESPOSTAS_INCORRETAS = re.compile(r"^Respostas incorretas:\s*(.*)$")
RE_WRONG = re.compile(r"^\s*(?:✗|7)\s+(.+)$")


def normalize_spaces(s: str) -> str:
    s = s.replace("\r", "").strip()
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def strip_trailing_checkmark_artifact(text: str) -> str:
    """Remove artefatos de marcação (✓ ou ' 3' no fim da alternativa correta)."""
    t = text.strip()
    t = re.sub(r"\s*✓\s*$", "", t)
    if t.endswith(" 3") and len(t) > 2:
        t = t[:-2].rstrip()
    # Linha isolada "3" após quebra de página (OCR)
    t = re.sub(r"(?m)^3\s*$", "", t)
    t = normalize_spaces(t)
    return t


def preprocess_lines(raw: str) -> list[str]:
    lines: list[str] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            lines.append("")
            continue
        if RE_PAGE_MARKER.match(line):
            continue
        if RE_CNH_HEADER.match(line):
            continue
        if line in ("BANCO NACIONAL DE", "QUESTÕES", "Versão 1.0"):
            continue
        if line == "PARTE 1 - Banco Nacional de Questões":
            continue
        lines.append(line)
    return lines


# -----------------------------------------------------------------------------
# Parser (máquina de estados)
# -----------------------------------------------------------------------------

State = str  # "seek" | "stem" | "correct" | "comment" | "wrong"


def flush_question(
    *,
    parte: int,
    modulo_num: int,
    modulo_title: str,
    diff_label: str,
    num: int,
    stem_parts: list[str],
    codigo_placa: str | None,
    correct_parts: list[str],
    comment_parts: list[str],
    wrongs: list[str],
    fonte: str,
) -> QuestionRecord | None:
    stem = normalize_spaces("\n".join(stem_parts))
    correct = normalize_spaces("\n".join(correct_parts))
    correct = strip_trailing_checkmark_artifact(correct)
    comment = normalize_spaces("\n".join(comment_parts))

    qid = f"p{parte}-m{modulo_num}-q{num}"
    return QuestionRecord(
        id=qid,
        parte=parte,
        modulo_numero=modulo_num,
        modulo_titulo=modulo_title.strip(),
        numero=num,
        dificuldade=difficulty_from_pdf(diff_label),
        enunciado=stem,
        codigo_placa=codigo_placa.strip() if codigo_placa else None,
        alternativa_correta=correct,
        comentario=comment,
        alternativas_incorretas=wrongs,
        fonte=fonte,
    )


def parse_questions(lines: list[str], fonte: str) -> tuple[list[QuestionRecord], list[dict]]:
    """
    Retorna (questões, avisos).
    """
    questions: list[QuestionRecord] = []
    warnings: list[dict] = []

    parte = 1
    modulo_num = 0
    modulo_title = ""

    state: State = "seek"
    diff_label = ""
    qnum = 0
    stem_parts: list[str] = []
    codigo_placa: str | None = None
    correct_parts: list[str] = []
    comment_parts: list[str] = []
    wrongs: list[str] = []

    def push_warning(code: str, message: str, line: int | None = None, extra: dict | None = None):
        w: dict = {"code": code, "message": message}
        if line is not None:
            w["line"] = line
        if extra:
            w.update(extra)
        warnings.append(w)

    def finalize_current_question() -> None:
        nonlocal state, stem_parts, codigo_placa, correct_parts, comment_parts, wrongs, diff_label, qnum
        if state == "seek":
            return
        if not stem_parts and state != "stem":
            push_warning("empty_stem", "Questão sem enunciado ao finalizar")
        if len(wrongs) != 3:
            push_warning(
                "wrong_count",
                f"Esperadas 3 incorretas, obtidas {len(wrongs)}",
                extra={"numero": qnum, "modulo": modulo_num, "parte": parte},
            )
        rec = flush_question(
            parte=parte,
            modulo_num=modulo_num,
            modulo_title=modulo_title,
            diff_label=diff_label,
            num=qnum,
            stem_parts=stem_parts,
            codigo_placa=codigo_placa,
            correct_parts=correct_parts,
            comment_parts=comment_parts,
            wrongs=wrongs[:3],
            fonte=fonte,
        )
        if rec is not None:
            questions.append(rec)
        stem_parts = []
        codigo_placa = None
        correct_parts = []
        comment_parts = []
        wrongs = []
        state = "seek"

    # Índice de linha para debug
    for i, line in enumerate(lines):
        m_parte = RE_PARTE.match(line)
        if m_parte:
            parte = int(m_parte.group(1))
            finalize_current_question()
            continue

        m_mod = RE_MODULO.match(line)
        if m_mod:
            finalize_current_question()
            modulo_num = int(m_mod.group(1))
            modulo_title = m_mod.group(2).strip()
            continue

        m_q = RE_QUESTION_START.match(line)
        if m_q:
            if state in ("stem", "correct", "comment", "wrong"):
                finalize_current_question()
            diff_label = m_q.group(1)
            qnum = int(m_q.group(2))
            stem_first = m_q.group(3).strip()
            stem_parts = [stem_first] if stem_first else []
            codigo_placa = None
            correct_parts = []
            comment_parts = []
            wrongs = []
            state = "stem"
            continue

        if state == "seek":
            if line == "":
                continue
            push_warning("skip_line_seek", f"Linha ignorada fora de questão: {line[:80]!r}", line=i + 1)
            continue

        if state == "stem":
            if RE_CODIGO_PLACA.match(line):
                codigo_placa = RE_CODIGO_PLACA.match(line).group(1).strip()
                continue
            m_alt = RE_ALTERNATIVA_CORRETA.match(line)
            if m_alt:
                first = m_alt.group(1).strip()
                correct_parts = [first] if first else []
                state = "correct"
                continue
            if line == "":
                continue
            if RE_QUESTION_START.match(line):
                push_warning(
                    "nested_question_in_stem",
                    "Possível início de questão dentro do enunciado",
                    line=i + 1,
                )
            stem_parts.append(line)
            continue

        if state == "correct":
            m_com = RE_COMENTARIO.match(line)
            if m_com:
                first = m_com.group(1).strip()
                comment_parts = [first] if first else []
                state = "comment"
                continue
            if line == "":
                continue
            if line.strip() in ("3", "✓"):
                continue
            if RE_ALTERNATIVA_CORRETA.match(line):
                push_warning("dup_alt", "Alternativa correta repetida?", line=i + 1)
                continue
            correct_parts.append(line)
            continue

        if state == "comment":
            m_res = RE_RESPOSTAS_INCORRETAS.match(line)
            if m_res:
                tail = m_res.group(1).strip()
                if tail:
                    tail_m = RE_WRONG.match(tail)
                    if tail_m:
                        wrongs.append(tail_m.group(1).strip())
                    else:
                        push_warning(
                            "respostas_same_line",
                            "Texto após Respostas incorretas: não começa com 7",
                            line=i + 1,
                        )
                state = "wrong"
                continue
            if line == "":
                continue
            comment_parts.append(line)
            continue

        if state == "wrong":
            if RE_QUESTION_START.match(line):
                finalize_current_question()
                m_q = RE_QUESTION_START.match(line)
                diff_label = m_q.group(1)
                qnum = int(m_q.group(2))
                stem_first = m_q.group(3).strip()
                stem_parts = [stem_first] if stem_first else []
                codigo_placa = None
                correct_parts = []
                comment_parts = []
                wrongs = []
                state = "stem"
                continue
            m_mod = RE_MODULO.match(line)
            if m_mod:
                finalize_current_question()
                modulo_num = int(m_mod.group(1))
                modulo_title = m_mod.group(2).strip()
                continue
            m_parte2 = RE_PARTE.match(line)
            if m_parte2:
                finalize_current_question()
                parte = int(m_parte2.group(1))
                continue

            m_w = RE_WRONG.match(line)
            if m_w:
                wrongs.append(m_w.group(1).strip())
                continue
            if line == "":
                continue
            if wrongs:
                wrongs[-1] = (wrongs[-1] + " " + line.strip()).strip()
                continue
            push_warning("wrong_unexpected", f"Linha inesperada em incorretas: {line[:80]!r}", line=i + 1)
            continue

    finalize_current_question()

    return questions, warnings


# -----------------------------------------------------------------------------
# Validação
# -----------------------------------------------------------------------------


def validate_questions(questions: list[QuestionRecord]) -> list[dict]:
    issues: list[dict] = []
    seen_ids: set[str] = set()
    for q in questions:
        if q.id in seen_ids:
            issues.append({"code": "duplicate_id", "id": q.id})
        seen_ids.add(q.id)
        if not q.enunciado.strip():
            issues.append({"code": "empty_enunciado", "id": q.id})
        if not q.alternativa_correta.strip():
            issues.append({"code": "empty_correta", "id": q.id})
        if len(q.alternativas_incorretas) != 3:
            issues.append(
                {
                    "code": "wrong_len",
                    "id": q.id,
                    "got": len(q.alternativas_incorretas),
                }
            )
        else:
            for j, w in enumerate(q.alternativas_incorretas, 1):
                if not w.strip():
                    issues.append({"code": "empty_incorreta", "id": q.id, "slot": j})
    return issues


# -----------------------------------------------------------------------------
# Exportação
# -----------------------------------------------------------------------------


CSV_FIELDS = [
    "id",
    "parte",
    "modulo_numero",
    "modulo_titulo",
    "numero",
    "dificuldade",
    "enunciado",
    "codigo_placa",
    "alternativa_correta",
    "comentario",
    "incorreta_1",
    "incorreta_2",
    "incorreta_3",
    "fonte",
]


def write_json(path: Path, questions: list[QuestionRecord]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = [q.to_json_dict() for q in questions]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_jsonl(path: Path, questions: list[QuestionRecord]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for q in questions:
            f.write(json.dumps(q.to_json_dict(), ensure_ascii=False) + "\n")


def write_csv(path: Path, questions: list[QuestionRecord]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        for q in questions:
            d = q.to_json_dict()
            inc = d.get("alternativas_incorretas") or []
            row = {k: d.get(k, "") for k in CSV_FIELDS if k not in ("incorreta_1", "incorreta_2", "incorreta_3")}
            row["incorreta_1"] = inc[0] if len(inc) > 0 else ""
            row["incorreta_2"] = inc[1] if len(inc) > 1 else ""
            row["incorreta_3"] = inc[2] if len(inc) > 2 else ""
            w.writerow(row)


def write_report(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrai questões do PDF para JSON/CSV.")
    parser.add_argument(
        "pdf",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "Banco Nacional de Questões.pdf",
        help="Caminho do PDF",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "data",
        help="Diretório de saída",
    )
    args = parser.parse_args()
    pdf_path = args.pdf.resolve()
    if not pdf_path.is_file():
        print(f"ERROR: PDF não encontrado: {pdf_path}", file=sys.stderr)
        return 1

    fonte = str(pdf_path)
    print(f"Extraindo texto de {pdf_path}...")
    raw_text = extract_text_from_pdf(pdf_path)
    lines = preprocess_lines(raw_text)
    print(f"Linhas após pré-processamento: {len(lines)}")

    questions, parse_warnings = parse_questions(lines, fonte=fonte)
    validation_issues = validate_questions(questions)

    out_dir = args.out_dir.resolve()
    write_json(out_dir / "questions.json", questions)
    write_jsonl(out_dir / "questions.jsonl", questions)
    write_csv(out_dir / "questions.csv", questions)

    report = {
        "pdf": fonte,
        "total_questions": len(questions),
        "outputs": {
            "json": str(out_dir / "questions.json"),
            "jsonl": str(out_dir / "questions.jsonl"),
            "csv": str(out_dir / "questions.csv"),
        },
        "parse_warnings": parse_warnings,
        "validation_issues": validation_issues,
        "parse_warnings_count": len(parse_warnings),
        "validation_issues_count": len(validation_issues),
    }
    write_report(out_dir / "extraction_report.json", report)

    print(f"Questões extraídas: {len(questions)}")
    print(f"Avisos de parse: {len(parse_warnings)}")
    print(f"Problemas de validação: {len(validation_issues)}")
    print(f"Saída em: {out_dir}/")

    if validation_issues or any(w.get("code") == "wrong_count" for w in parse_warnings):
        return 2 if validation_issues else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
