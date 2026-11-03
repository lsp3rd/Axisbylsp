#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
FONT="$PREFIX/share/fonts/TTF/DejaVuSans.ttf"
PREVIEW="PACIFIC_SHADOW_OFFLINE_TECHNICAL_PREVIEW.mp4"
OUTPUT="PACIFIC_SHADOW_180S_TECHNICAL_CUT.mp4"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
titles=(
"01  EVIDENCE BEFORE AUTHORITY"
"02  CRYPTO THEFT AND ACCESS TOKENS"
"03  SYNTHETIC ON-CHAIN TRACING"
"04  SCAM SHIELD AND WALLET GUARDS"
"05  RYAN HOLDS ON CONFLICT"
"06  FEACINTH INDEPENDENT REVIEW"
"07  SIMULATED GRID OUTAGE"
"08  577 DELIVERY NOT CLAIMED"
"09  CRYPTO TO STOCK BRIDGE"
"10  STOCK TO CRYPTO BRIDGE"
)
details=(
"Human approval required. No automated retaliation."
"Funds and session credentials are separate evidence classes."
"Test fixtures only. No real wallet or exchange access."
"Local rule-based checker. No real victim information."
"UNKNOWN or conflicting evidence means HOLD."
"Independent audit role is simulated, not production attested."
"No actual grid commands, jamming or satellite access."
"Queued fictional packets are not delivered emergency messages."
"Sale, eligible buying power and purchase are separate steps."
"Failed destination purchase leaves proceeds recorded as cash."
)
for i in "${!titles[@]}"; do
  n="$(printf '%02d' "$i")"
  t="${titles[$i]}"; d="${details[$i]}"
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=0x091522:s=1280x720:r=10:d=10" \
    -vf "drawtext=fontfile=$FONT:text='AXIS GHOSTGRID  /  PACIFIC SHADOW':fontcolor=0x64e0cd:fontsize=31:x=65:y=115,drawtext=fontfile=$FONT:text='$t':fontcolor=white:fontsize=42:x=65:y=285,drawtext=fontfile=$FONT:text='$d':fontcolor=0xbad0df:fontsize=24:x=65:y=375,drawtext=fontfile=$FONT:text='FICTIONAL TECHNICAL DEMO - NO PRODUCTION ACTION':fontcolor=0xffc680:fontsize=22:x=65:y=605" \
    -c:v libx264 -preset ultrafast -crf 29 -pix_fmt yuv420p -an "$WORK/card_$n.mp4"
  echo "file '$WORK/card_$n.mp4'" >> "$WORK/cards.txt"
done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$WORK/cards.txt" -c copy "$WORK/cards.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$PREVIEW" -i "$WORK/cards.mp4" \
  -filter_complex "[0:v]fps=10,scale=1280:720,setsar=1[v0];[1:v]fps=10,scale=1280:720,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset ultrafast -crf 27 -pix_fmt yuv420p -movflags +faststart "$OUTPUT"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUTPUT"
echo "TECHNICAL_180S_CUT=BUILT"
