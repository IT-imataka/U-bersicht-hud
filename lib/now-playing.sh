#!/bin/bash
# Übersicht から1秒ごとに呼ばれる。
# 曲が変わったときだけアートワークを書き出し、前回の曲IDを cache/stamp に覚えておく。

DIR="$(cd "$(dirname "$0")" && pwd)"
CACHE="$DIR/../cache"
ART="$CACHE/artwork.jpg"
STAMP="$CACHE/stamp"
US=$'\x1f'

mkdir -p "$CACHE"

LAST_ID=""
LAST_ART="0"
if [ -f "$STAMP" ]; then
  LAST_ID="$(sed -n 1p "$STAMP")"
  LAST_ART="$(sed -n 2p "$STAMP")"
fi

OUT="$(osascript "$DIR/now-playing.applescript" "$ART" "$LAST_ID" 2>/dev/null)"

if [ -z "$OUT" ] || [ "$OUT" = "stopped" ]; then
  echo "stopped"
  exit 0
fi

FLAG="${OUT##*$US}"      # 最後のフィールド(artFlag)
BODY="${OUT%$US*}"       # それ以外
PID="$(printf '%s' "$OUT" | awk -F "$US" '{print $7}')"

if [ "$FLAG" = "same" ]; then
  HAS_ART="$LAST_ART"
else
  HAS_ART="$FLAG"
  printf '%s\n%s\n' "$PID" "$FLAG" > "$STAMP"
fi

printf '%s%s%s\n' "$BODY" "$US" "$HAS_ART"
