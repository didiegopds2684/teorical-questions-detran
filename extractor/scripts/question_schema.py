"""Schema e tipos para questões extraídas do Banco Nacional de Questões (PDF)."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

Difficulty = Literal["facil", "intermediario", "dificil"]


@dataclass
class QuestionRecord:
    """Uma questão do banco, pronta para JSON/CSV/API."""

    id: str
    parte: int
    modulo_numero: int
    modulo_titulo: str
    numero: int
    dificuldade: Difficulty
    enunciado: str
    codigo_placa: str | None
    alternativa_correta: str
    comentario: str
    alternativas_incorretas: list[str] = field(default_factory=list)
    fonte: str = ""

    def to_json_dict(self) -> dict[str, Any]:
        d = asdict(self)
        return d


def difficulty_from_pdf(label: str) -> Difficulty:
    m = {
        "Fácil": "facil",
        "Intermediário": "intermediario",
        "Difícil": "dificil",
    }
    if label not in m:
        raise ValueError(f"Dificuldade desconhecida: {label!r}")
    return m[label]  # type: ignore[return-value]
