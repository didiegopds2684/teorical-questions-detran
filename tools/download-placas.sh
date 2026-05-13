#!/usr/bin/env bash
# Baixa SVGs das placas de trânsito brasileiras do Wikimedia Commons.
# Uso: bash tools/download-placas.sh
# Os arquivos vão para frontend/public/placas/

set -euo pipefail

DEST="$(dirname "$0")/../frontend/public/placas"
BASE="https://commons.wikimedia.org/wiki/Special:FilePath"

# Códigos CONTRAN presentes no banco de questões
CODIGOS=(
  A-1a A-1b A-2a A-2b A-3a A-4b A-5a A-6 A-7a A-8 A-9
  A-11a A-12 A-14 A-15 A-17 A-18 A-19 A-20a A-20b
  A-31 A-32a A-32b A-33a A-35 A-39 A-40 A-41 A-42a A-42b A-42c A-45
  R-1 R-2 R-3 R-4a R-4b R-5a R-5b R-6a R-6b R-6c R-7 R-8a R-8b R-9 R-10
  R-14 R-15 R-16 R-19 R-20 R-23 R-24a R-24b R-25a R-25b R-25c R-25d
  R-26 R-27 R-28 R-29 R-30 R-31 R-32 R-33 R-34 R-35 R-37 R-38 R-39 R-44
)

mkdir -p "$DEST"

for codigo in "${CODIGOS[@]}"; do
  # A-33a → Brasil_A-33a.svg
  filename="Brasil_${codigo}.svg"
  dest_file="$DEST/$codigo.svg"

  if [[ -f "$dest_file" ]]; then
    echo "✓ $codigo (já existe)"
    continue
  fi

  echo -n "↓ $codigo ... "
  if curl -fsSL \
    -H "User-Agent: detran-simulado-downloader/1.0 (https://github.com/didiegopds2684/teorical-questions-detran)" \
    "$BASE/$filename" -o "$dest_file"; then
    echo "ok"
  else
    echo "não encontrado (pulando)"
    rm -f "$dest_file"
  fi

  sleep 1  # respeitar rate limit do Wikimedia
done

echo ""
echo "Concluído. Arquivos em $DEST"
