#!/usr/bin/env -S deno run -RWE --allow-run
import $ from "@david/dax"
import { Command } from "@cliffy/command"
import { getDefaultBranch, parseRepo } from "./_utils/mod.ts"

const { args: [input] } = await new Command()
  .description("Fork with best defaults")
  .arguments("<repo:string>")
  .example("Clone a fork", "gh-clone-fork.ts <owner>/<repo>")
  .parse(Deno.args)

const { owner, repo } = parseRepo(input)
if (!owner) {
  console.error("No owner found")
  Deno.exit(1)
}

const upstream = [owner, repo].join("/")

await $`gh repo fork --clone=false ${upstream}`.printCommand()

await $`gh repo clone ${repo} -- --filter=blob:none`.printCommand()

const defaultBranch = await getDefaultBranch(upstream)

await $`gh repo set-default ${upstream}`
  .cwd(repo)
  .printCommand()

await $`git branch ${defaultBranch} --set-upstream-to=upstream/${defaultBranch}`
  .cwd(repo)
  .printCommand()
