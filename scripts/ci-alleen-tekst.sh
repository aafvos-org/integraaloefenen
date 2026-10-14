#!/usr/bin/env bash
# Zegt of de controle echt moet draaien.
# Alleen Markdown of bestanden onder docs/ veranderen de site niet.
# Schrijft draaien=ja of draaien=nee naar $GITHUB_OUTPUT.
set -euo pipefail

if [ -z "${GITHUB_OUTPUT:-}" ]; then
  echo "GITHUB_OUTPUT ontbreekt." >&2
  exit 1
fi

if [ "${GEBEURTENIS:-}" != "pull_request" ]; then
  echo "Geen pull request: altijd nalopen."
  echo "draaien=ja" >> "$GITHUB_OUTPUT"
  exit 0
fi

if [ -z "${BASIS:-}" ]; then
  echo "Geen basiscommit: voor de zekerheid toch nalopen."
  echo "draaien=ja" >> "$GITHUB_OUTPUT"
  exit 0
fi

git fetch --no-tags --depth=1 origin "$BASIS"
gewijzigd=$(git diff --name-only "$BASIS" HEAD)
echo "Gewijzigde bestanden:"
echo "$gewijzigd"

if [ -z "$gewijzigd" ]; then
  echo "Geen lijst met wijzigingen: voor de zekerheid toch nalopen."
  echo "draaien=ja" >> "$GITHUB_OUTPUT"
  exit 0
fi

# Blijft er na de tekstbestanden iets over, dan moet de controle draaien.
rest=$(printf '%s\n' "$gewijzigd" | grep -vE '(\.md$|^docs/)' || true)
if [ -n "$rest" ]; then
  echo "draaien=ja" >> "$GITHUB_OUTPUT"
else
  echo "draaien=nee" >> "$GITHUB_OUTPUT"
fi
