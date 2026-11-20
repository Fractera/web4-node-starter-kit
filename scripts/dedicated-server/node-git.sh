#!/usr/bin/env bash
# GIT OF THE NODE ON A WALLED SERVER (node step 811-4b). Installed as /usr/local/lib/fractera/node-bin/git, first on the PATH of the node's
# processes (ecosystem.config.cjs, install.sh, start.sh). The node's own git inside a custom element's folder runs as that element's user.
# 🔒 WHY: the element writes its own .git/config and .gitattributes — core.fsmonitor, a filter's clean command, a hook run even on
# `git status`; run by the NODE's user that is the element's code with the node's keys. `-c` overrides cannot cover every filter, so the
# git itself becomes the element's: `sudo -n fractera-element run <id> -- /usr/bin/git …` (the element's user, its folder).
# Anywhere else — the core, the natives, an element whose user is not made yet (root's record /etc/fractera/elements/<id> says) — the
# real git, untouched. Another user (an element, root) always gets the real git.
set -u
REAL=/usr/bin/git
NODE_ENV_FILE=${FRACTERA_GIT_TEST_ENV:-/etc/fractera/node.env}
RECORDS=${FRACTERA_GIT_TEST_RECORDS:-/etc/fractera/elements}
HELPER=/usr/local/sbin/fractera-element
NODE_USER="" NODE_DIR=""
. "$NODE_ENV_FILE" 2>/dev/null
[ -n "$NODE_USER" ] && [ -n "$NODE_DIR" ] && [ "$(id -un)" = "$NODE_USER" ] || exec "$REAL" "$@"

real() { (cd -P -- "$1" 2>/dev/null && pwd -P); }
abs() { case "$1" in /*) printf '%s' "$1";; *) printf '%s/%s' "$2" "$1";; esac; }

# Where this git works: every -C before the subcommand (relative ones from the previous), --git-dir / --work-tree, GIT_DIR / GIT_WORK_TREE.
here="$PWD"; places=(); out=()
args=("$@"); i=0; n=${#args[@]}
while [ "$i" -lt "$n" ]; do
  a="${args[$i]}"
  case "$a" in
    -C) here="$(abs "${args[$((i + 1))]:-}" "$here")"; out+=(-C "$here"); i=$((i + 2)); continue ;;
    --git-dir|--work-tree) places+=("$(abs "${args[$((i + 1))]:-}" "$here")"); out+=("$a" "$(abs "${args[$((i + 1))]:-}" "$here")"); i=$((i + 2)); continue ;;
    --git-dir=*|--work-tree=*) v="${a#*=}"; places+=("$(abs "$v" "$here")"); out+=("${a%%=*}=$(abs "$v" "$here")"); i=$((i + 1)); continue ;;
    -c|--namespace|--exec-path) out+=("$a" "${args[$((i + 1))]:-}"); i=$((i + 2)); continue ;;
    -*) out+=("$a"); i=$((i + 1)); continue ;;
  esac
  break
done
while [ "$i" -lt "$n" ]; do out+=("${args[$i]}"); i=$((i + 1)); done
places+=("$here")
[ -n "${GIT_DIR:-}" ] && places+=("$(abs "$GIT_DIR" "$PWD")")
[ -n "${GIT_WORK_TREE:-}" ] && places+=("$(abs "$GIT_WORK_TREE" "$PWD")")

base="$(real "$NODE_DIR")/WEB4-ITEMS/user/"
id=""; sub=""
for p in "${places[@]}"; do
  r="$(real "$p")"; [ -n "$r" ] || r="$p"
  case "$r/" in "$base"*) ;; *) continue ;; esac
  rest="${r#"$base"}"; folder="WEB4-ITEMS/user/${rest%%/*}"
  for f in "$RECORDS"/*; do
    [ -f "$f" ] && grep -qx "FOLDER=$folder" "$f" 2>/dev/null && { id="$(basename -- "$f")"; break; }
  done
  [ -n "$id" ] && { [ "$p" = "$here" ] && [[ "$rest" == */* ]] && sub="${rest#*/}"; break; }
done
[ -n "$id" ] || exec "$REAL" "$@"

envs=()
for k in GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_TERMINAL_PROMPT GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL; do
  v="${!k:-}"; [ -n "$v" ] || continue
  case "$k" in GIT_DIR|GIT_WORK_TREE|GIT_INDEX_FILE) v="$(abs "$v" "$PWD")" ;; esac
  envs+=("$k=$v")
done
exec ${FRACTERA_GIT_TEST_SUDO:-sudo -n} "$HELPER" run "$id" ${sub:+--in "$sub"} "${envs[@]+"${envs[@]}"}" -- "$REAL" "${out[@]+"${out[@]}"}"
