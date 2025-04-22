#!/usr/bin/env -S deno run -RWE --allow-run
import $ from "@david/dax"

const getRefs = () =>
  $`git for-each-ref refs/heads --format '%(refname)'`.lines()

const getUser = () =>
  $`gh api user`.json<{ login: string }>().then((x) => x.login)

const checkMerged = ({ user, branch }: { user: string; branch: string }) =>
  $`gh pr view ${user}:${branch} --json state`.quiet("stderr")
    .json<{ state: string }>()
    .then((x) => x.state === "MERGED")
    .catch(() => false)

const [refs, user, ..._] = await Promise.all([
  getRefs(),
  getUser(),
  $`git switch main`.printCommand(),
])

await Promise.all(
  refs
    .map((x) => x.replace("refs/heads/", ""))
    .filter((x) => x != "main")
    .map(async (branch) => {
      if (!await checkMerged({ user, branch })) return
      await $`git branch -D ${branch}`.printCommand()
    }),
)
await $`git switch -`.printCommand()
