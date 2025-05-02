#!/usr/bin/env -S deno run -RWE --allow-run --allow-net
import $ from "@david/dax"
import { Octokit } from "octokit"

const getRefs = () =>
  $`git for-each-ref refs/heads --format '%(refname)'`.lines()

const deleteBranches = (branches: string[]) =>
  $`git branch -D ${branches}`.printCommand()

const getRemote = ({ remote }: { remote: string }) =>
  $`git remote get-url ${remote}`.text().then((url) => {
    const groups = /github\.com[:\/](?<owner>.*)\/(?<repo>.*)\.git/
      .exec(url)?.groups
    if (!groups) throw new Error("Not a GitHub repository")
    return groups as { owner: string; repo: string }
  })

const getMerged = (
  { octokit, owner, repo, branches }: {
    octokit: Octokit
    owner: string
    repo: string
    branches: string[]
  },
) =>
  octokit.graphql<{
    search: {
      edges: Array<{
        node: {
          title: string
          url: string
          headRefName: string
        }
      }>
    }
  }>(
    `
        query GetClosedPullRequestsWithHeadRef($searchQuery: String!, $first: Int!) {
            search(query: $searchQuery, type: ISSUE_ADVANCED, first: $first) {
                edges {
                    node {
                        ... on PullRequest {
                            headRefName
                            title
                            url
                        }
                    }
                }
            }
        }
    `,
    {
      first: Math.min(100, branches.length),
      searchQuery: [
        `org:${owner}`,
        `repo:${repo}`,
        "type:pr",
        "state:merged",
        `(${branches.map((x) => `head:${x}`).join(" OR ")})`,
      ].join(" AND "),
    },
  ).then((x) => x.search.edges.flatMap((y) => y.node))

const [refs, { owner: origin, repo }, { owner: upstream }, auth, ..._] =
  await Promise
    .all([
      getRefs(),
      getRemote({ remote: "origin" }),
      getRemote({ remote: "upstream" }),
      $`gh auth token`.text().catch(() => undefined),
    ])

const branches = refs
  .map((x) => x.replace("refs/heads/", ""))
  .filter((x) => x !== "main" && x !== "master")

const octokit = new Octokit({ auth })

const merged = await getMerged({
  octokit,
  owner: upstream ?? origin,
  repo: repo,
  branches,
})

if (merged.length === 0) {
  console.log("No merged branches found")
  Deno.exit(0)
}

console.table(merged, ["title", "url", "headRefName"])
await Deno.writeTextFile("merged.json", JSON.stringify(merged, null, 2))

const doDelete = await $.confirm("Delete following merged branches?")
if (!doDelete) Deno.exit(0)

await deleteBranches(merged.map((x) => x.headRefName))
