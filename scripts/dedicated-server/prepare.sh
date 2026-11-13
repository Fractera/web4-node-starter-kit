#!/usr/bin/env bash
# THE SERVER IS PREPARED FOR A FRACTERA NODE (node step 737-4). Run as root, detached (`setsid … &`), idempotent: a second run only
# finishes what the first did not. Uploaded by the node with stages.sh and fractera-root.sh into /root/.fractera/.
# Arguments: <node user> <node folder name> <ssh port> <the node's public key line>
# Lessons carried from the Fractera easy starter (lib/bootstrap.sh) are named at their stage.
set -u
NODE_USER="${1:?user}" FOLDER="${2:?folder}" SSH_PORT="${3:?ssh port}" PUBKEY="${4:?public key}"
HERE="$(cd "$(dirname "$0")" && pwd)"
export PROGRESS="$HERE/prepare.progress.jsonl" LOG="$HERE/prepare.log"
. "$HERE/stages.sh"
NODE_DIR="/home/$NODE_USER/$FOLDER"
export DEBIAN_FRONTEND=noninteractive
[[ "$NODE_USER" =~ ^[a-z][a-z0-9-]{1,30}$ ]] || { emit args failed "bad user name"; exit 1; }
[[ "$FOLDER" =~ ^[A-Za-z0-9._-]{1,100}$ ]] || { emit args failed "bad folder name"; exit 1; }
[[ "$SSH_PORT" =~ ^[0-9]{1,5}$ ]] || { emit args failed "bad ssh port"; exit 1; }
[[ "$PUBKEY" =~ ^ssh-ed25519\ [A-Za-z0-9+/]+=*\ fractera-node$ ]] || { emit args failed "bad public key"; exit 1; }
emit prepare running

# apt waits for the provider's own first-boot upgrades instead of failing on their lock (easy starter: DPkg::Lock::Timeout + fuser).
stage apt-lock "mkdir -p /etc/apt/apt.conf.d && printf 'DPkg::Lock::Timeout \"600\";\\n' > /etc/apt/apt.conf.d/99fractera-lock-timeout"

# Swap before anything heavy: ✗ easy starter 2026-08-23, 956 MB and no swap — `npm install` was killed (137) at 33 %.
# ✗ Paid again 2026-11-13 on the owner's 8 GB test server: the core is ONE Next app (126 pages, 1671 source files) and its Turbopack build
# peaks at ≈7.7 GB resident + ≈5.9 GB swapped (measured: `/usr/bin/time -v`, exit 0 in 9:37 with 10 GB of swap; killed twice with 4 GB).
# The old Fractera survived the same server because it was many SMALL apps built one by one. Rule: memory + swap ≥ 16 GB; the missing
# part becomes /swapfile-fractera (the probe counts its disk). swappiness 10 keeps the running node in memory.
stage swap 'mem=$(awk "/MemTotal/ {print int(\$2/1024)}" /proc/meminfo); sw=$(awk "/SwapTotal/ {print int(\$2/1024)}" /proc/meminfo);
  add=$(( (16384 - mem - sw + 1023) / 1024 ));
  if [ "$add" -gt 0 ] && [ ! -f /swapfile-fractera ]; then
    fallocate -l ${add}G /swapfile-fractera || dd if=/dev/zero of=/swapfile-fractera bs=1M count=$((add * 1024)); chmod 600 /swapfile-fractera;
    mkswap /swapfile-fractera; swapon /swapfile-fractera;
    grep -q "^/swapfile-fractera" /etc/fstab || echo "/swapfile-fractera none swap sw 0 0" >> /etc/fstab; sysctl -w vm.swappiness=10;
  fi; swapon --show=NAME,SIZE --noheadings'
stage apt 'wait_for_apt; apt-get update -qq && apt-get install -y -qq git curl ca-certificates rsync nginx ufw build-essential python3 python3-venv openssl psmisc'
# Node 22 — the major the node runs on everywhere (macOS 22.19 measured); NodeSource as the easy starter did.
stage node 'v=$(node --version 2>/dev/null | cut -d. -f1); if [ "$v" != "v22" ]; then wait_for_apt; curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y -qq nodejs; fi; node --version'
stage pm2 'command -v pm2 >/dev/null || npm install -g pm2@latest; pm2 --version'
# certbot from the snap — the current release (5.x; Ubuntu 24.04 apt has 2.9): IP certificates and profiles need ≥ 5.4. apt is the
# fallback where snapd cannot run (a container).
soft_stage certbot 'command -v certbot >/dev/null || { snap install --classic certbot && ln -sf /snap/bin/certbot /usr/bin/certbot; } || { wait_for_apt; apt-get install -y -qq certbot; }; certbot --version'
stage user "id -u $NODE_USER >/dev/null 2>&1 || useradd -m -s /bin/bash $NODE_USER;
  install -d -m 0700 -o $NODE_USER -g $NODE_USER /home/$NODE_USER/.ssh;
  touch /home/$NODE_USER/.ssh/authorized_keys; grep -qxF '$PUBKEY' /home/$NODE_USER/.ssh/authorized_keys || printf '%s\n' '$PUBKEY' >> /home/$NODE_USER/.ssh/authorized_keys;
  chown $NODE_USER:$NODE_USER /home/$NODE_USER/.ssh/authorized_keys; chmod 600 /home/$NODE_USER/.ssh/authorized_keys"
# git over HTTP/1.1: ✗ measured by the easy starter 2026-09-02 — «expected flush after ref listing» over HTTP/2 on one provider's network.
stage git "su - $NODE_USER -c 'git config --global http.version HTTP/1.1'"
stage helper "install -d -m 0755 /etc/fractera; printf 'NODE_USER=%s\nNODE_DIR=%s\n' '$NODE_USER' '$NODE_DIR' > /etc/fractera/node.env;
  install -m 0755 -o root -g root '$HERE/fractera-root.sh' /usr/local/sbin/fractera-root;
  printf '%s ALL=(root) NOPASSWD: /usr/local/sbin/fractera-root\n' '$NODE_USER' > /etc/sudoers.d/fractera; chmod 0440 /etc/sudoers.d/fractera;
  visudo -cf /etc/sudoers.d/fractera"
stage nginx 'install -d -m 0755 /var/www/fractera-acme; rm -f /etc/nginx/sites-enabled/default; systemctl enable --now nginx'
# The firewall from the first minute: only SSH, 80 and 443. The node's own ports (24680–25679) answer on loopback for nginx and are
# never reached from outside. SSH first, so enabling can never lock the node out (the easy starter's order).
stage firewall "ufw allow $SSH_PORT/tcp; ufw allow 80/tcp; ufw allow 443/tcp; ufw default deny incoming; ufw default allow outgoing; ufw --force enable; ufw status"
# A resolver that sees fresh records: ✗ easy starter — Contabo's resolver answered NXDOMAIN for new records and broke certbot.
soft_stage resolver 'systemctl is-active --quiet systemd-resolved && { mkdir -p /etc/systemd/resolved.conf.d; printf "[Resolve]\nDNS=1.1.1.1 8.8.8.8\nFallbackDNS=9.9.9.9 1.0.0.1\n" > /etc/systemd/resolved.conf.d/fractera-dns.conf; systemctl restart systemd-resolved; }'
stage pm2-startup "env PATH=\$PATH:/usr/bin pm2 startup systemd -u $NODE_USER --hp /home/$NODE_USER"
emit prepare done
