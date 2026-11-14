#!/usr/bin/env bash
# 744 probe 1 — does sshd itself refuse a key after its `expiry-time` (the 24-hour limit held by the SERVER, not by the browser)?
# A throwaway sshd as the current user on a high port, its own host key and authorized_keys in a scratch folder; nothing system-wide.
#   A: key with expiry-time one minute in the FUTURE        → login accepted
#   B: the same key with expiry-time one minute in the PAST → login refused (negative control of A: the only difference is the time)
#   C: no expiry-time at all (today's persistent node key)  → accepted, forever
#   D: a future time with the UTC suffix Z                  → refused where sshd predates Z (8.6 here): a bad option drops the line
# Usage: expiry-time.sh <scratch folder>
set -u
S="$1"; rm -rf "$S/sshd"; mkdir -p "$S/sshd"; D="$S/sshd"; chmod 700 "$D"
PORT=$((20000 + RANDOM % 20000))
ssh-keygen -q -t ed25519 -N '' -f "$D/host" -C host
ssh-keygen -q -t ed25519 -N '' -f "$D/visit" -C fractera-visit
cat > "$D/sshd_config" <<EOF
Port $PORT
ListenAddress 127.0.0.1
HostKey $D/host
AuthorizedKeysFile $D/authorized_keys
PidFile $D/sshd.pid
StrictModes no
UsePAM no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
LogLevel VERBOSE
EOF
stamp() { date -v"$1" +%Y%m%d%H%M 2>/dev/null || date -d "$1" +%Y%m%d%H%M; }  # the SERVER's own clock and time zone (BSD or GNU date)
try() { # $1 = label, $2 = authorized_keys line options
  printf '%s%s\n' "$2" "$(cat "$D/visit.pub")" > "$D/authorized_keys"
  ssh -q -p "$PORT" -i "$D/visit" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -o ConnectTimeout=5 "$(whoami)@127.0.0.1" 'echo LOGIN-OK' 2>/dev/null | grep -q LOGIN-OK && r=accepted || r=refused
  echo "$1: $r   (line options: ${2:-none})"
}
/usr/sbin/sshd -f "$D/sshd_config" -E "$D/sshd.log" || { echo "sshd did not start"; exit 1; }
sleep 1
FUT="$(stamp +1M)"; PAST="$(stamp -1M)"; ZFUT="$(date -u -v+1M +%Y%m%d%H%M 2>/dev/null || date -u -d +1min +%Y%m%d%H%M)Z"
try "A future expiry" "expiry-time=\"$FUT\" "
try "B past expiry  " "expiry-time=\"$PAST\" "
try "C no expiry    " ""
try "D future, Z     " "expiry-time=\"$ZFUT\" "   # the UTC suffix: only where this sshd documents it
grep -m1 -i "expir" "$D/sshd.log" | sed 's/^/sshd log: /' | cut -c1-160
kill "$(cat "$D/sshd.pid")" 2>/dev/null
echo "OpenSSH here: $(ssh -V 2>&1)"
