# 842 — An element takes its GitHub commits by a button

The owner, 2026-11-23 (Telegram 1154): «Разве не логично было бы на этой вкладке иметь такой же баннер который существует на главной
странице которая анализирует наличие доступных версий? Как-то не очень логично действует только через искусственный интеллект?»;
1157: «Да ты строишь баннер, привозишь его и одновременно очень строго и всегда читаешь инструкцию чтобы не сломать то что уже работает
… Гарантируй мне что любое другое обновление не будет ломать эту стену».

Why: an element's repository is the meeting point (the core's main agent writes in a workshop, the element's agent on a server writes
there too), but the node could only push to it; taking commits back needed the element's agent (a model session). Measured 13:05 UTC:
the marketplace (lidt5) on fractera.ai stayed on 9b5c671 while fe9d4d7 waited on GitHub.

## Plan (agreed: 1155 → 1157)

1. `lib/web4-items/element-pull.mjs` — pure verdict `pullVerdict({ behind, ahead, dirty })` → none | ready | dirty | diverged; `fetchRemote`
   (the node's user, the token as a one-time URL like the push, into `refs/remotes/github/main`, never `origin`), `counts`, and
   `fastForward` — `git merge --ff-only` run AS THE ELEMENT behind the wall (`asElement`, helper `run`; 811-6), `-c safe.directory=<dir>`
   on every call. Static require of the wall (837-0f).
2. `lib/web4-items/element-github.ts` — `checkElementRemote(id, { fetch })`, `pullElement(id)`: the repository and the token as the push
   has them, the uncommitted list as the push counts it (build trace and node files excluded).
3. Door `app/api/architect/items/[id]/github/pull/route.ts` — GET (`?check=1` asks GitHub, otherwise the last fetched state), POST takes;
   architect/admin, the temporary address refused, git's output never returned.
4. Banner `app/[lang]/(architectLayer)/_components/element-pull.client.tsx` above the deploy panel of «Предпросмотр и развёртывание»:
   «В GitHub новая версия: N» · «Проверить снова» · «Забрать»; refusals in words (uncommitted work, diverged history, no repository);
   words in `_i18n/element-pull.i18n.ts` (en, ru). Only when the element has a repository.
5. Proofs: `scripts/element-pull.test.mjs` — real git with a local bare repository as GitHub (behind → ready → taken; dirty refused,
   diverged refused, nothing new), the wall stub in its REAL shape (`asElement` returns `{ cmd, args, wrapped }`) proving the merge goes
   through the helper and the fetch does not (negative: the merge as the node fails the test); prebuild RC=0; core build on the Mac,
   eyes of the banner; after the server update — the marketplace behind the wall: check → take fe9d4d7 → preview builds.

Rides along: 1ce046ec (a finished install is the latest — no «Установить» after it), 99ad22d7, 0b1e26b5 batch.

## State

- 2026-11-23 13:15 UTC — plan written; code next.
