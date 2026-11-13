#!/usr/bin/env bash
# THE ROOT HELPER OF A FRACTERA NODE ON ITS SERVER (node step 737-4). Installed as /usr/local/sbin/fractera-root (root:root 0755);
# one sudoers line lets the node's user run it and nothing else: `fractera ALL=(root) NOPASSWD: /usr/local/sbin/fractera-root`.
# 🔒 WHY A HELPER: the node runs as an ordinary user (Claude Code refuses bypass mode as root — code.claude.com/docs/en/permission-modes;
# the browser terminal must not be a root shell), yet nginx, certificates and the firewall belong to root. Every verb is fixed, every
# argument is checked against a pattern, nothing is evaluated — the node can ask for exactly these acts and no other.
# 🔒 THE NODE'S FOLDER IS READ FROM /etc/fractera/node.env (written by prepare.sh), never from an argument.
set -u
. /etc/fractera/node.env || { echo "no /etc/fractera/node.env" >&2; exit 2; }
: "${NODE_USER:?}" "${NODE_DIR:?}"
ACME_ROOT=/var/www/fractera-acme
SITE=/etc/nginx/sites-available/fractera
OWN=/etc/fractera/certs
HOST_RE='^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
verb="${1:-}"
host_arg() { [[ "${1:-}" =~ $HOST_RE ]] && [ "${#1}" -le 253 ] || { echo "bad host name" >&2; exit 2; }; }

case "$verb" in
  nginx-apply)
    # The node writes its generated site into its own folder; this verb checks it with nginx before it goes live, and keeps the
    # previous file when the new one fails — a broken file never reaches a running nginx.
    src="$NODE_DIR/data/node/server-side/nginx/fractera.conf"
    [ -f "$src" ] || { echo "no generated site at $src" >&2; exit 2; }
    [ "$(stat -c %s "$src")" -lt 2000000 ] || { echo "site file too large" >&2; exit 2; }
    mkdir -p "$ACME_ROOT"
    [ -f "$SITE" ] && cp -a "$SITE" "$SITE.previous"
    install -m 0644 -o root -g root "$src" "$SITE"
    ln -sf "$SITE" /etc/nginx/sites-enabled/fractera
    rm -f /etc/nginx/sites-enabled/default
    if nginx -t 2>&1; then systemctl reload nginx || systemctl restart nginx; echo NGINX_APPLIED
    else
      if [ -f "$SITE.previous" ]; then cp -a "$SITE.previous" "$SITE"; else rm -f "$SITE" /etc/nginx/sites-enabled/fractera; fi
      echo "NGINX_REFUSED — the previous site stays" >&2; exit 1
    fi ;;
  cert-issue)
    host_arg "${2:-}"; host="$2"; mkdir -p "$ACME_ROOT"
    # certbot holds one global lock: a renewal run in progress is a wait, not a failure (✗ paid 2026-08-02, core b5641206).
    for attempt in 1 2 3 4 5 6 7 8 9 10; do
      out="$(certbot certonly --webroot -w "$ACME_ROOT" --cert-name "$host" -d "$host" --keep-until-expiring --non-interactive \
        --agree-tos --register-unsafely-without-email 2>&1)" && { echo "$out" | tail -5; echo "CERT_OK $host"; exit 0; }
      echo "$out" | grep -qi "Another instance of Certbot is already running" || { echo "$out" | tail -12 >&2; exit 1; }
      sleep 90
    done
    echo "certbot stayed busy for 15 minutes" >&2; exit 1 ;;
  cert-list)
    # One JSON line per certificate the node can use: Let's Encrypt lineages and uploaded ones.
    for f in /etc/letsencrypt/live/*/fullchain.pem "$OWN"/*/fullchain.pem; do
      [ -f "$f" ] || continue
      dir="$(dirname "$f")"; source="letsencrypt"; [[ "$dir" == "$OWN"/* ]] && source="own"
      end="$(openssl x509 -enddate -noout -in "$f" | cut -d= -f2)"
      sans="$(openssl x509 -noout -ext subjectAltName -in "$f" 2>/dev/null | tail -n +2 | tr -d ' ' | tr ',' '\n' | sed -n 's/^DNS://p' | paste -sd, -)"
      printf '{"name":"%s","source":"%s","fullchain":"%s","privkey":"%s","notAfter":"%s","sans":"%s"}\n' \
        "$(basename "$dir")" "$source" "$f" "$dir/privkey.pem" "$end" "$sans"
    done ;;
  cert-delete)
    host_arg "${2:-}"; certbot delete --cert-name "$2" --non-interactive && echo "CERT_DELETED $2" ;;
  cert-upload)
    # The person's own certificate (regions where Let's Encrypt is unreachable, an OV/EV certificate): the node leaves the pair in its
    # folder, this verb checks that the key matches the certificate and moves both where only root reads them.
    host_arg "${2:-}"; host="$2"; up="$NODE_DIR/data/node/server-side/upload/$host"
    [ -f "$up/fullchain.pem" ] && [ -f "$up/privkey.pem" ] || { echo "no uploaded pair" >&2; exit 2; }
    a="$(openssl x509 -noout -pubkey -in "$up/fullchain.pem" | openssl sha256)"; b="$(openssl pkey -pubout -in "$up/privkey.pem" | openssl sha256)"
    [ -n "$a" ] && [ "$a" = "$b" ] || { rm -rf "$up"; echo "the key does not match the certificate" >&2; exit 1; }
    install -d -m 0700 "$OWN/$host"; install -m 0600 "$up/fullchain.pem" "$OWN/$host/fullchain.pem"; install -m 0600 "$up/privkey.pem" "$OWN/$host/privkey.pem"
    rm -rf "$up"; echo "CERT_UPLOADED $host" ;;
  playwright-deps)
    cd "$NODE_DIR" && npx --yes playwright install-deps chromium && echo PLAYWRIGHT_DEPS_OK ;;
  pm2-startup)
    env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$NODE_USER" --hp "/home/$NODE_USER" && echo PM2_STARTUP_OK ;;
  firewall-status)
    ufw status verbose ;;
  *)
    echo "verbs: nginx-apply · cert-issue <host> · cert-list · cert-delete <host> · cert-upload <host> · playwright-deps · pm2-startup · firewall-status" >&2
    exit 2 ;;
esac
