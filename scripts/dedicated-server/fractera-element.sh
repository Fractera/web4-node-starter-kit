#!/usr/bin/env bash
# THE WALL BETWEEN ELEMENTS ON A DEDICATED SERVER (node step 811-2). Installed as /usr/local/sbin/fractera-element (root:root 0755) by
# prepare.sh; the same sudoers file as fractera-root lets the node's user run it and nothing else. A home computer never has it: one
# person, one user (the owner, Telegram 76, 2026-11-20: «На Mac это в принципе не может быть нужно потому что на Mac всегда один
# пользователь»).
# 🔒 THE SHAPE (new-steps/811-a-wall-per-element-on-a-server.md): every custom element gets its own Linux user `fe-<id>` (no login, no
# sudo, primary group fractera-el, home /var/lib/fractera-el/<id>). Its folder and its `data/services/<id>` keep the node's owner and get
# POSIX ACLs — fe-<id> and the node's group rwX, «other» nothing, the same as defaults for every new file — so the core still builds and
# deploys the element, the element works in its folder, and a neighbour (another «other») reads nothing. The node's folder is 0711 and the
# core's files lose every «other» right (`walls`), except the list of files element users must read (`element-readable.txt`).
# 🔒 ROOT NEVER RECURSES INTO A TREE AN ELEMENT USER CAN WRITE WHILE IT RUNS: the ACLs are set at `add` (physical walk, -P), the chown back
# at `remove` after every process of the user is killed — a planted symlink is never followed (setfacl -P, chown -P -h, find ! -type l).
# 🔒 Every argument is checked against a pattern; the element's folder is read from root's own record (/etc/fractera/elements/<id>),
# written at `add`, never from an argument of a later verb (readable by all since 811-4b: an id and a folder, no secret). The node's folder is read from /etc/fractera/node.env.
# DRY: FRACTERA_ELEMENT_DRY=1 prints the acts instead of running them, with FRACTERA_ELEMENT_ETC / FRACTERA_ELEMENT_ROOT as test roots
# (scripts/element-wall.test.mjs). sudo's env_reset strips both, so through sudo they never reach this script.
set -u
DRY="${FRACTERA_ELEMENT_DRY:-0}"
if [ "$DRY" = 1 ]; then ETC="${FRACTERA_ELEMENT_ETC:?}"; R="${FRACTERA_ELEMENT_ROOT:-}"; else ETC=/etc/fractera; R=""; fi
. "$ETC/node.env" || { echo "no $ETC/node.env" >&2; exit 2; }
: "${NODE_USER:?}" "${NODE_DIR:?}"
GROUP=fractera-el
HOMES="$R/var/lib/fractera-el"
RECORDS="$ETC/elements"
SHARED_BIN="$R/usr/local/lib/fractera/bin"
LOGS="$R/var/log/fractera-el"
ID_RE='^[a-z0-9][a-z0-9-]{0,27}[a-z0-9]$'      # fe-<id> stays within useradd's 32 characters
FOLDER_RE='^WEB4-ITEMS/[a-z0-9-]+/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$'
KEY_RE='^[A-Za-z_][A-Za-z0-9_]{0,63}$'
PATH_RE='^[][A-Za-z0-9_.@()-][][A-Za-z0-9_./@()-]*$'   # a path of the node: letters, digits, _ . @ ( ) [ ] - and /
act() { if [ "$DRY" = 1 ]; then printf 'DRY:'; printf ' %q' "$@"; printf '\n'; else "$@"; fi; }
die() { echo "$1" >&2; exit "${2:-2}"; }
id_arg() { [[ "${1:-}" =~ $ID_RE ]] || die "bad element id"; }
# A real directory under the node's folder, no symlink on the way (cd -P resolves; the result must equal the joined path).
real_dir() { local p="$1"; [ -d "$p" ] && [ ! -L "$p" ] || return 1; [ "$(cd -P -- "$p" 2>/dev/null && pwd -P)" = "$p" ]; }
record_of() { [ -f "$RECORDS/$1" ] || die "no element $1 here" 3; sed -n 's/^FOLDER=//p' "$RECORDS/$1" | head -1; }
# 811-6 (measured live 2026-11-20 14:34 and 15:00 on the server: «git: failed to stat …/WEB4-ITEMS/user/root: Permission denied»): Ubuntu
# makes a home 0750 and `walls` runs only at the node's start — the element's user could not even reach its own folder during the install
# (the node's git shim runs git as it BEFORE the installer's `add`). Every verb that acts as the user opens the way first: pass-through
# only (o+x, never o+r) on each folder above its folder and its data folder.
open_way() {
  local p
  for p in "$(dirname -- "$NODE_DIR")" "$NODE_DIR" "$NODE_DIR/WEB4-ITEMS" "$NODE_DIR/$(dirname -- "$1")" "$NODE_DIR/data" "$NODE_DIR/data/services"; do
    [ -d "$p" ] && [ ! -L "$p" ] && act chmod o+x "$p"
  done
  return 0
}
acl_of() { echo "u:fe-$1:rwX,g:$NODE_USER:rwX,o::---,d:u:fe-$1:rwX,d:g:$NODE_USER:rwX,d:o::---"; }

verb="${1:-}"; shift || true
case "$verb" in
  add)
    # add <id> <folder> — the element's user, its home, its record, its folder and its data folder opened to it
    id_arg "${1:-}"; id="$1"; folder="${2:-}"
    [[ "$folder" =~ $FOLDER_RE ]] && [[ "$folder" != *..* ]] || die "bad element folder"
    dir="$NODE_DIR/$folder"; data="$NODE_DIR/data/services/$id"
    real_dir "$dir" || die "the element folder is not a real folder of the node"
    [ ! -e "$data" ] || real_dir "$data" || die "the element data folder is not a real folder of the node"
    # 🔒 a NEW user only gets the recursive walk: once fe-<id> exists it may write in its folder while root walks it (a component swapped
    # for a symlink between the walk and the act); a repeat `add` touches the two top folders only — new files inherit the defaults
    fresh=0
    if ! id -u "fe-$id" >/dev/null 2>&1; then
      fresh=1
      act useradd --system --gid "$GROUP" --home-dir "$HOMES/$id" --create-home --shell /usr/sbin/nologin "fe-$id"
    fi
    act install -d -m 0700 -o "fe-$id" -g "$GROUP" "$HOMES/$id"
    # its own git trusts its own folder (owned by the node: git refuses a repository of another owner) — written AS the user, so root
    # never writes into a home the user controls
    # ✗ 2026-11-20 15:55 live: run from the caller's folder (the node's, closed to the user) git could not read its cwd and wrote nothing
    # — so it runs from the user's own home now, and every `run` also names the folder safe for that one call (below)
    [ "$fresh" = 1 ] && ( cd -- "$HOMES/$id" 2>/dev/null || cd /; act setpriv --no-new-privs --reuid="fe-$id" --regid="$GROUP" --init-groups -- env -i HOME="$HOMES/$id" \
      git config --global safe.directory "$dir" )
    [ -e "$data" ] || act install -d -m 2770 -o "$NODE_USER" -g "$NODE_USER" "$data"
    # root's record: readable by everyone (an id and a folder, no secret) — the node's git shim maps a folder to its element by it (811-4b)
    act install -d -m 0755 "$RECORDS"
    if [ "$DRY" = 1 ]; then echo "DRY: record $RECORDS/$id FOLDER=$folder"; else printf 'FOLDER=%s\n' "$folder" > "$RECORDS/$id"; chmod 0644 "$RECORDS/$id"; fi
    open_way "$folder"
    for d in "$dir" "$data"; do
      act chmod 2770 "$d"
      if [ "$fresh" = 1 ]; then act setfacl -R -P -m "$(acl_of "$id")" "$d"; else act setfacl -m "$(acl_of "$id")" "$d"; fi
    done
    echo "ELEMENT_ADDED $id" ;;
  remove)
    # remove <id> — every process of the user ends, its files go back to the node, the user and its home go
    id_arg "${1:-}"; id="$1"
    act systemctl stop "fractera-el-$id-*" >/dev/null 2>&1
    if id -u "fe-$id" >/dev/null 2>&1; then
      act pkill -KILL -u "fe-$id"
      for d in "$NODE_DIR/$(record_of "$id" 2>/dev/null)" "$NODE_DIR/data/services/$id"; do
        [ "$d" != "$NODE_DIR/" ] && real_dir "$d" || continue
        act chown -R -P -h "$NODE_USER:$NODE_USER" "$d"
        act setfacl -R -P -b "$d"
      done
      act userdel "fe-$id"
    fi
    act rm -rf -- "$HOMES/$id"
    act rm -f -- "$RECORDS/$id" "$LOGS/$id"-*.log
    echo "ELEMENT_REMOVED $id" ;;
  run|unit-start|agent)
    # run <id> [--in <sub>] [KEY=VALUE …] -- <program> [args …] — a SHORT program as fe-<id> (npm ci, a build, git): in its folder, a clean
    # environment, umask 007; the caller waits for it.
    # unit-start <id> [--unit <tag>] [--in <sub>] [KEY=VALUE …] -- <program> … — a LONG one (its server, a preview, a warm-up) as a
    # transient systemd unit fractera-el-<id>-<tag> (default tag serve) with User=fe-<id>: the node's user cannot signal a root sudo,
    # systemd stops the whole group (KillMode=control-group), so no element process outlives its stop on a port. Its output goes to
    # /var/log/fractera-el/<id>-<tag>.log (root's folder; the node reads it). A unit of that name still running is stopped first.
    # agent <id> [--unit <tag>] [--in <sub>] [KEY=VALUE …] -- <program> … — the element's AGENT (811-5b: claude, its login shell) as the unit
    # fractera-el-<id>-<tag> (default tag agent) on the caller's terminal (`systemd-run --pty`, it waits for the unit): the same walls as a
    # long program — ProtectProc=invisible hides every other user's process (a token in another process's arguments), the whole group
    # ends with the unit; the node stops it with unit-stop when the session closes.
    id_arg "${1:-}"; id="$1"; shift
    tag=serve; [ "$verb" = agent ] && tag=agent
    if [ "$verb" != run ] && [ "${1:-}" = "--unit" ]; then
      tag="${2:-}"; [[ "$tag" =~ ^[a-z]{1,12}$ ]] || die "bad unit tag"; shift 2
    fi
    folder="$(record_of "$id")" || exit 3
    dir="$NODE_DIR/$folder"; real_dir "$dir" || die "the element folder is gone"
    open_way "$folder" >/dev/null
    # --in <subfolder> — a folder inside the element's own (a standalone build starts in .next/standalone), never outside it
    if [ "${1:-}" = "--in" ]; then
      sub="${2:-}"; [[ "$sub" =~ $PATH_RE ]] && [[ "$sub" != *..* ]] && real_dir "$dir/$sub" || die "bad --in folder"
      dir="$dir/$sub"; shift 2
    fi
    envs=()
    while [ $# -gt 0 ] && [ "$1" != "--" ]; do
      key="${1%%=*}"
      [[ "$1" == *=* ]] && [[ "$key" =~ $KEY_RE ]] || die "bad environment entry"
      case "$key" in LD_*|BASH_ENV|ENV|BASH_FUNC_*|PATH|HOME|USER|LOGNAME|SHELL|NODE_OPTIONS) die "environment entry $key is not allowed";; esac
      envs+=("$1"); shift
    done
    [ "${1:-}" = "--" ] && [ -n "${2:-}" ] || die "$verb <id> [KEY=VALUE …] -- <program> [args …]"
    shift
    base=(HOME="$HOMES/$id" USER="fe-$id" LOGNAME="fe-$id" SHELL=/bin/bash LANG=C.UTF-8 TERM="${TERM:-xterm-256color}"
      PATH="$SHARED_BIN:/usr/local/bin:/usr/bin:/bin" DISABLE_AUTOUPDATER=1
      # 811-6 (live 15:55: «git config --global --add safe.directory …/WEB4-ITEMS/user/root»): the element's folder belongs to the node, so
      # the user's git refuses it as «dubious ownership»; git respects safe.directory given in the command scope (git-config, SCOPES —
      # protected configuration), so every call names its own element's folder as safe, whatever its home's .gitconfig holds
      GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0="$NODE_DIR/$folder")
    if [ "$verb" = agent ]; then
      unit="fractera-el-$id-$tag"
      act systemctl stop "$unit" >/dev/null 2>&1; act systemctl reset-failed "$unit" >/dev/null 2>&1
      sets=(); for e in "${base[@]}" "${envs[@]+"${envs[@]}"}"; do sets+=("--setenv=$e"); done
      if [ "$DRY" = 1 ]; then act systemd-run --quiet --collect --pty --unit="$unit" --uid="fe-$id" --gid="$GROUP" -p WorkingDirectory="$dir" -p UMask=0007 \
        -p NoNewPrivileges=yes -p ProtectProc=invisible -p KillMode=control-group -p TimeoutStopSec=10 "${sets[@]}" -- "$@"; exit 0; fi
      exec systemd-run --quiet --collect --pty --unit="$unit" --uid="fe-$id" --gid="$GROUP" -p WorkingDirectory="$dir" -p UMask=0007 \
        -p NoNewPrivileges=yes -p ProtectProc=invisible -p KillMode=control-group -p TimeoutStopSec=10 "${sets[@]}" -- "$@"
    fi
    if [ "$verb" = unit-start ]; then
      unit="fractera-el-$id-$tag"; log="$LOGS/$id-$tag.log"
      act install -d -m 0750 -o root -g "$NODE_USER" "$LOGS"
      act systemctl stop "$unit" >/dev/null 2>&1; act systemctl reset-failed "$unit" >/dev/null 2>&1
      act install -m 0640 -o root -g "$NODE_USER" /dev/null "$log"
      sets=(); for e in "${base[@]}" "${envs[@]+"${envs[@]}"}"; do sets+=("--setenv=$e"); done
      act systemd-run --quiet --collect --unit="$unit" --uid="fe-$id" --gid="$GROUP" -p WorkingDirectory="$dir" -p UMask=0007 \
        -p NoNewPrivileges=yes -p ProtectProc=invisible -p KillMode=control-group -p TimeoutStopSec=10 -p StandardOutput="append:$log" -p StandardError="append:$log" \
        "${sets[@]}" -- "$@"
      echo "UNIT_STARTED $unit"; exit 0
    fi
    umask 007
    cd -- "$dir" || exit 1
    if [ "$DRY" = 1 ]; then act setpriv --no-new-privs --reuid="fe-$id" --regid="$GROUP" --init-groups -- env -i "${base[@]}" "${envs[@]+"${envs[@]}"}" "$@"; exit 0; fi
    exec setpriv --no-new-privs --reuid="fe-$id" --regid="$GROUP" --init-groups -- env -i "${base[@]}" "${envs[@]+"${envs[@]}"}" "$@" ;;
  unit-stop)
    # unit-stop <id> [--unit <tag>] — that unit of the element stops (its whole process group)
    id_arg "${1:-}"; id="$1"; tag=serve
    if [ "${2:-}" = "--unit" ]; then tag="${3:-}"; [[ "$tag" =~ ^[a-z]{1,12}$ ]] || die "bad unit tag"; fi
    act systemctl stop "fractera-el-$id-$tag"; echo "UNIT_STOPPED fractera-el-$id-$tag" ;;
  signal)
    # signal <id> <pid> <TERM|INT|HUP|KILL> — only a process of that element's user
    id_arg "${1:-}"; id="$1"; pid="${2:-}"; sig="${3:-}"
    [[ "$pid" =~ ^[0-9]{1,9}$ ]] || die "bad pid"
    case "$sig" in TERM|INT|HUP|KILL) ;; *) die "bad signal";; esac
    # by uid: procps prints a name longer than 8 characters as a number (fe-<id> always is)
    owner="$(ps -o uid= -p "$pid" 2>/dev/null | tr -d ' ')"; want="$(id -u "fe-$id" 2>/dev/null)"
    [ -n "$owner" ] && [ -n "$want" ] && [ "$owner" = "$want" ] || die "process $pid is not element $id's" 3
    act kill -s "$sig" "$pid" ;;
  stop)
    # stop <id> — every process of the element's user gets TERM
    id_arg "${1:-}"; id="$1"; id -u "fe-$id" >/dev/null 2>&1 || die "no element $id here" 3
    act systemctl stop "fractera-el-$id-*"; act pkill -TERM -u "fe-$id"; echo "ELEMENT_STOPPED $id" ;;
  claude-share)
    # The node user's Claude Code (install.sh → ensure-claude → ~/.local/bin/claude, a link into ~/.local/share/claude/versions) is copied
    # where every element user can run it and none can change it. Only a file inside that folder, only a Linux program (ELF).
    link="$R/home/$NODE_USER/.local/bin/claude"
    store="$(cd -P -- "$R/home/$NODE_USER/.local/share/claude" 2>/dev/null && pwd -P)/" || die "the node has no claude yet" 3
    [ -L "$link" ] || [ -f "$link" ] || die "the node has no claude yet" 3
    t="$link"; [ -L "$link" ] && { t="$(readlink -- "$link")"; [[ "$t" == /* ]] || t="$(dirname -- "$link")/$t"; }
    target="$(cd -P -- "$(dirname -- "$t")" 2>/dev/null && pwd -P)/$(basename -- "$t")"
    case "$target" in "$store"*) ;; *) die "claude is not where the official installer puts it";; esac
    [ -f "$target" ] && [ ! -L "$target" ] || die "claude is not a file"
    [ "$(head -c 4 -- "$target" | od -An -c | tr -d ' ')" = '177ELF' ] || die "claude is not a Linux program"
    act install -d -m 0755 -o root -g root "$SHARED_BIN"
    act install -m 0755 -o root -g root "$target" "$SHARED_BIN/claude"
    # 811-5e: bun runs the Telegram plugin's server inside the element's session — the node's ~/.bun/bin/bun (Bun's installer), a real
    # Linux program file, copied the same way; no bun yet → the element's bot waits for the next start of the node.
    bun="$R/home/$NODE_USER/.bun/bin/bun"
    if [ -f "$bun" ] && [ ! -L "$bun" ] && [ "$(head -c 4 -- "$bun" | od -An -c | tr -d ' ')" = '177ELF' ]; then
      act install -m 0755 -o root -g root "$bun" "$SHARED_BIN/bun"; echo "BUN_SHARED $bun"
    fi
    echo "CLAUDE_SHARED $target" ;;
  walls)
    # The node's folder: pass-through only for others, its files without «other» rights; the element folders keep their own ACLs; the
    # files element users must read (scripts/dedicated-server/element-readable.txt, one path of the node per line) get o+r and their
    # folders o+x. Run at every start of the node on its server (start.sh) — an update brings new files with the default umask.
    real_dir "$NODE_DIR" || die "the node folder is not a real folder"
    list="$NODE_DIR/scripts/dedicated-server/element-readable.txt"
    allow=()
    if [ -f "$list" ]; then
      while IFS= read -r line || [ -n "$line" ]; do
        line="${line%%#*}"; line="$(printf '%s' "$line" | tr -d '[:space:]')"
        [ -n "$line" ] || continue
        [[ "$line" =~ $PATH_RE ]] && [[ "$line" != *..* ]] && [[ "$line" != /* ]] || die "bad readable path: $line"
        f="$NODE_DIR/$line"
        [ -f "$f" ] && [ ! -L "$f" ] && real_dir "$(dirname -- "$f")" || die "readable path is not a file of the node: $line"
        allow+=("$line")
      done < "$list"
    fi
    act chmod 0711 "$(dirname -- "$NODE_DIR")" "$NODE_DIR"
    # every file and folder of the core, the native elements' included (their env files hold keys), except the folders of elements
    # with their own user (their ACLs; root never walks a tree an element user can write) and symlinks (never followed)
    prune=()
    for f in "$RECORDS"/*; do
      [ -f "$f" ] || continue
      e="$(basename -- "$f")"; fo="$(sed -n 's/^FOLDER=//p' "$f" | head -1)"
      [[ "$e" =~ $ID_RE ]] && [[ "$fo" =~ $FOLDER_RE ]] || continue
      prune+=(-path "$NODE_DIR/$fo" -o -path "$NODE_DIR/data/services/$e" -o)
    done
    if [ "$DRY" = 1 ]; then echo "DRY: find $NODE_DIR -mindepth 1 ( ${prune[*]+"${prune[*]}"} -false ) -prune -o ! -type l -exec chmod o-rwx {} +"
    else find "$NODE_DIR" -mindepth 1 \( "${prune[@]+"${prune[@]}"}" -false \) -prune -o ! -type l -exec chmod o-rwx {} +; fi
    for d in WEB4-ITEMS data data/services; do [ -d "$NODE_DIR/$d" ] && act chmod o+x "$NODE_DIR/$d"; done
    for k in "$NODE_DIR"/WEB4-ITEMS/*/; do [ -d "$k" ] && [ ! -L "${k%/}" ] && act chmod o+x "${k%/}"; done
    # the node's own data folders that are no element's: closed
    for s in "$NODE_DIR"/data/services/*; do
      [ -d "$s" ] && [ ! -L "$s" ] || continue
      [ -f "$RECORDS/$(basename -- "$s")" ] || act chmod o-rwx "$s"
    done
    for line in "${allow[@]+"${allow[@]}"}"; do
      act chmod o+r "$NODE_DIR/$line"
      p="$(dirname -- "$line")"
      while [ "$p" != "." ]; do act chmod o+x "$NODE_DIR/$p"; p="$(dirname -- "$p")"; done
    done
    for e in "$NODE_DIR"/.env*; do [ -f "$e" ] && [ ! -L "$e" ] && act chmod 0600 "$e"; done
    # 818-4 (the red team 817 H5, measured 2026-11-20: an element listed ~/.pm2 and read pm2's dump and log — every process, path and port —
    # read ~/.claude/settings.json, ~/.gitconfig and the nginx site): the node user's home is only a way to the node's folder; everything
    # else in it is closed to others, links never followed; the nginx sites are root's (nginx's master reads them as root).
    home_dir="$(dirname -- "$NODE_DIR")"
    for e in "$home_dir"/.[!.]* "$home_dir"/*; do
      [ -e "$e" ] && [ ! -L "$e" ] && [ "$e" != "$NODE_DIR" ] || continue
      act chmod o-rwx "$e"
    done
    for n in /etc/nginx/sites-available/* /etc/nginx/conf.d/*.conf; do [ -f "$n" ] && [ ! -L "$n" ] && act chmod 0640 "$n"; done
    echo "WALLS_APPLIED ${#allow[@]}" ;;
  list)
    for f in "$RECORDS"/*; do [ -f "$f" ] && printf '%s %s\n' "$(basename -- "$f")" "$(sed -n 's/^FOLDER=//p' "$f")"; done; true ;;
  *)
    echo "verbs: add <id> <folder> · remove <id> · run|unit-start|agent <id> [--unit <tag>] [--in <sub>] [KEY=VALUE …] -- <program> … · unit-stop <id> [--unit <tag>] · signal <id> <pid> <sig> · stop <id> · claude-share · walls · list" >&2
    exit 2 ;;
esac
