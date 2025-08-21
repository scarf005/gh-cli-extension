import { assertEquals } from "@std/assert"
import { parseRepo } from "../_utils/parse_repo.ts"

const expected = { owner: "owner", repo: "repo" }
Deno.test("parseRepo() parses GitHub repos", () => {
  assertEquals(parseRepo("owner/repo"), expected)
  assertEquals(parseRepo("owner/repo.git"), expected)
  assertEquals(parseRepo("github.com/owner/repo.git"), expected)
  assertEquals(parseRepo("https://github.com/owner/repo.git"), expected)
  assertEquals(parseRepo("git@github.com:owner/repo.git"), expected)
})

Deno.test("parseRepo() handles missing owner", () => {
  const expected = { owner: undefined, repo: "repo" }

  assertEquals(parseRepo("repo"), expected)
})

Deno.test("parseRepo() ignores paths after repo", () => {
  assertEquals(
    parseRepo(
      "https://github.com/owner/repo/issues/123#issuecomment-12345678",
    ),
    expected,
  )
})
