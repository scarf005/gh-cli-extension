import $ from "@david/dax"

/**
 * @param repo @example "scarf005/gh-cli-extension"
 */
export const getDefaultBranch = async (repo: string) =>
  await $`gh repo view ${repo} --json defaultBranchRef --jq '.defaultBranchRef.name'`
    .printCommand()
    .text()
