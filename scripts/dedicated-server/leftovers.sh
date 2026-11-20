#!/usr/bin/env bash
# WHAT EARLIER INSTALLERS LEFT ON A SERVER, ERASED (node step 806-8). Run as root over SSH after the person's confirm on the page.
# The owner, 2026-11-19, to «Easy Starter in /opt/fractera* (11 GB) and Docker in /var/lib/containerd (9 GB) — erase them for good?»:
# «yes of course 100%». Measured that day on his test server after a clean of the node: 74 of 145 GB used, the node itself 3.
# ERASED: the Fractera Easy Starter's own trees (its wipe list, Fractera/fractera-easy-starter lib/wipe-script.ts: /opt/fractera,
# /opt/fractera-main, /opt/hermes-webui, /usr/local/lib/hermes-agent, root's ~/.hermes, ~/.bun, uv's share and cache), root's caches
# (~/.cache, npm's _cacache), and Docker's unused images, containers, networks and volumes (`docker system prune -af --volumes` — a
# running container and what it uses stay).
# 🔒 NEVER TOUCHED: this node (/home/fractera), /etc/fractera (the node's own settings and certificates — prepare.sh), /etc/letsencrypt,
# /root/.ssh, the swap file, the system's journals. Works beside a running install: nothing of the node is named here.
# Prints ONE JSON line: { erased, docker, purged, pm2Killed, foreignListening, freedGb, freeGb }. Test roots: LEFT_ROOT (default /),
# LEFT_TEST=1 runs no docker, purges nothing, kills nothing.
set -u
R="${LEFT_ROOT:-}"
free_kb() { df -Pk "${R:-/}" 2>/dev/null | awk 'NR==2 {print $4}'; }
BEFORE="$(free_kb)"
ERASED=()
erase() { [ -e "$1" ] || [ -L "$1" ] || return 0; rm -rf -- "$1" && ERASED+=("$1"); }
for p in /opt/fractera /opt/fractera-main /opt/hermes-webui /usr/local/lib/hermes-agent /root/.hermes /root/.bun /root/.local/share/uv /root/.cache /root/.npm/_cacache; do
  erase "$R$p"
done
DOCKER="none"
if [ "${LEFT_TEST:-0}" != 1 ] && command -v docker >/dev/null 2>&1; then
  if docker system prune -af --volumes >/dev/null 2>&1; then DOCKER="pruned"; else DOCKER="failed"; fi
fi
# 818-1 — EVERYTHING FOREIGN GOES (the owner, 2026-11-20, Telegram 261/271: «Чужой сервисы безусловно убрать я об этом тебе уже много раз
# говорил» · «лучше конечно чтобы на кнопку очистить сервер было более правильное стирание сервера … третий раз прошу»). Measured by the
# red team 817 on 109.199.105.213: Docker containers RUNNING (OSRM on 127.0.0.1:5000, another on :8080) survived `prune`, Postgres, Apache
# and root's own pm2 lived beside the node — every one an open door for an element. Now: every container stopped and removed, Docker
# itself purged with its data, the foreign servers and databases purged with theirs, every pm2 that is not the node user's killed.
# 🔒 THE NODE'S OWN STAY: the packages of prepare.sh (git curl ca-certificates rsync nginx ufw build-essential python3 python3-venv openssl
# psmisc acl), nodejs, certbot, /var/www/fractera-* and everything named NEVER TOUCHED above.
FOREIGN_PKGS=()
PM2_KILLED=()
LIVE=1; [ "${LEFT_TEST:-0}" = 1 ] && LIVE=0   # the test erases files under LEFT_ROOT only: no docker, no apt, no signals
if [ "$LIVE" = 1 ] && command -v docker >/dev/null 2>&1; then
  ids="$(docker ps -aq 2>/dev/null)"; [ -n "$ids" ] && docker rm -f $ids >/dev/null 2>&1
  docker system prune -af --volumes >/dev/null 2>&1 && DOCKER="removed"
  systemctl stop docker docker.socket containerd >/dev/null 2>&1
fi
# every pm2 that is not the node user's (root's own, an old project's user): its daemon killed, its folder erased
for home in "$R/root" "$R"/home/*; do
  [ -d "$home/.pm2" ] || continue
  [ "$(basename "$home")" = "${NODE_USER:-fractera}" ] && continue
  u="$(basename "$home")"
  [ "$LIVE" = 1 ] && { pkill -u "$u" -f 'PM2 v' >/dev/null 2>&1; pkill -u "$u" -f 'pm2' >/dev/null 2>&1; }
  erase "$home/.pm2"; PM2_KILLED+=("$u")
done
# the foreign servers and databases, with their packages
if [ "$LIVE" = 1 ]; then
  mapfile -t FOREIGN_PKGS < <(dpkg-query -W -f='${Package} ${Status}\n' 2>/dev/null | awk '$NF=="installed"{print $1}' | grep -E \
    '^(docker-ce|docker-ce-cli|docker-ce-rootless-extras|docker\.io|docker-compose|docker-compose-plugin|docker-buildx-plugin|containerd|containerd\.io|runc|apache2|apache2-bin|apache2-data|apache2-utils|libapache2-mod-.*|postgresql|postgresql-[0-9]+|postgresql-client-[0-9]+|postgresql-common|mysql-server|mysql-server-.*|mysql-client-.*|mariadb-server|mariadb-server-.*|mariadb-client.*|mongodb-org.*|redis-server|redis-tools|lighttpd|caddy|haproxy|php[0-9.]*-fpm|tomcat[0-9]*)$')
  if [ "${#FOREIGN_PKGS[@]}" -gt 0 ]; then
    systemctl stop apache2 postgresql mysql mariadb mongod redis-server lighttpd caddy haproxy >/dev/null 2>&1
    DEBIAN_FRONTEND=noninteractive apt-get purge -y -qq "${FOREIGN_PKGS[@]}" >/dev/null 2>&1
    DEBIAN_FRONTEND=noninteractive apt-get autoremove -y -qq --purge >/dev/null 2>&1
  fi
fi
for p in /var/lib/docker /var/lib/containerd /etc/docker /var/lib/postgresql /etc/postgresql /var/lib/mysql /etc/mysql /etc/apache2 \
         /var/lib/mongodb /var/lib/redis /etc/redis; do erase "$R$p"; done
for p in "$R"/var/www/*; do [ -e "$p" ] || continue; case "$(basename "$p")" in fractera-*) ;; *) erase "$p" ;; esac; done
# What still listens and is not the node's: named, never silent (the owner: «ты третий раз говоришь мне что-то остается»).
FOREIGN_LISTEN=""
[ "$LIVE" = 1 ] && FOREIGN_LISTEN="$(ss -ltnpH 2>/dev/null | awk '{print $4, $6}' | grep -vE 'users:\(\("(nginx|sshd|systemd-resolve|node|next-server|cloudflared|PM2)' \
  | grep -vE '^(127\.0\.0\.(53|54)|\[::1\]):|%lo:53 ' | sed -E 's/users:\(\("([^"]+)".*/\1/' | sort -u | tr '\n' ';')"
AFTER="$(free_kb)"
python3 - "$DOCKER" "${BEFORE:-0}" "${AFTER:-0}" "$(IFS=,; echo "${FOREIGN_PKGS[*]+"${FOREIGN_PKGS[*]}"}")" "$(IFS=,; echo "${PM2_KILLED[*]+"${PM2_KILLED[*]}"}")" "$FOREIGN_LISTEN" "${ERASED[@]+"${ERASED[@]}"}" <<'PY'
import json, sys
docker, before, after, pkgs, pm2, listen, *erased = sys.argv[1:]
gb = lambda kb: round(int(kb or 0) / 1048576, 1)
print(json.dumps({"erased": erased, "docker": docker, "purged": [p for p in pkgs.split(",") if p], "pm2Killed": [u for u in pm2.split(",") if u],
                  "foreignListening": [x.strip() for x in listen.split(";") if x.strip()],
                  "freedGb": max(0.0, round(gb(after) - gb(before), 1)), "freeGb": gb(after)}))
PY
