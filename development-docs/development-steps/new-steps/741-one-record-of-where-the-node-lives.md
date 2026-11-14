# 741 — one record of where the node lives: the computer or a server, and every strategy that differs (queued)

The owner, 2026-11-14 (verbatim): «решил ли ты на фундаментальном уровне проблема разделения например это точно приложение запущенные на
локальном компьютере поэтому его надо отметить и как приложение запущен на локальном компьютере. А это точно приложение запущенное на
удалённом сервере поэтому его надо отметить как приложение запущенные на удалённом сервере потому что нам нужнов зависимости от этого
строить абсолютно разные стратегии во многих вещах». Order: «739 → 741 → 740».

## Measured today (2026-11-14)
- A server knows it by a written mark (`data/node/server.json`, launch.sh stage mark); its readers: `lib/agent-kit/mount.cjs`, the agent
  kit's `telegram.cjs`, `/api/node/server/domain`, `/api/node/launch`, `scripts/server.mjs` (nginx). The computer has NO mark: the indicator
  measures it (`lib/hosting/place.mjs`: macOS/Windows → computer, Linux with a public IPv4 → server) — a Linux computer with a public IP
  reads «server»; a server installed by hand with `npm run launch` has no mark.
- Strategies branch implicitly elsewhere: the quick tunnel (`logs/tunnel.json` unpublished), the owner at the keyboard (the nginx edge
  mark), updates and the fork sync through Chrome, the closed lid, the survival rule, the Cloudflare page copies.

## To plan
- One record written by the installation itself (`npm run launch` → computer, `launch.sh` → server), measured only as a check; one reader
  module every strategy uses; the map of every behaviour that differs, each moved onto that reader, each with a proof on both sides.
