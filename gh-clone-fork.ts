#!/usr/bin/env -S deno run -RWE --allow-run
import $ from "@david/dax"
import { Command } from "@cliffy/command"
import { parseRepo } from "./_util.ts"

const { args: [input, alias] } = await new Command()
  .description("Clone or Fork with best defaults")
  .arguments("<repo:string> [alias:string]")
  .example("Clone a fork", "gh-clone-fork.ts <owner>/<repo>")
  .example("Clone a fork with alias", "gh-clone-fork.ts <owner>/<repo> my-alias")
  .parse(Deno.args)

const { owner, repo } = parseRepo(input)
const clonePath = alias || repo

const upstream = owner ? [owner, repo].join("/") : repo
if (owner) {
  const forkArgs = alias ? ["--fork-name", alias] : []
  await $`gh repo fork --clone=false ${upstream} ${forkArgs}`.printCommand()
}
const cloneSource = owner ? clonePath : repo
await $`gh repo clone ${cloneSource} ${clonePath} -- --filter=blob:none`.printCommand()

const defaultBranch =
  await $`gh repo view ${upstream} --json defaultBranchRef --jq '.defaultBranchRef.name'`
    .printCommand()
    .text()

// TODO: get upstream for cloning somehow
await $`gh repo set-default ${upstream}`
  .cwd(clonePath)
  .printCommand()

await $`git branch ${defaultBranch} --set-upstream-to=upstream/${defaultBranch}`
  .cwd(clonePath)
  .printCommand()
