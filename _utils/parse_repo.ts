export interface Repo {
  owner: string | undefined
  repo: string
}

export const parseRepo = (text: string): Repo =>
  (text.match(regex))!.groups! as unknown as Repo

// Regex breakdown:
// (?:(?:https?:\/\/|git@)?github\.com[/:])? : Optional prefix like https://github.com/, git@github.com:
// (?:(?<owner>[^/:]+)[/:])?                 : Named capture group: optional owner with separator
// (?<repo>[^/\s]+?)                         : Named capture group: repo name (required)
// (?:\.git)?                                : Optional .git suffix
// $                                         : End of string
const regex =
  /^(?:(?:https?:\/\/|git@)?github\.com[/:])?(?:(?<owner>[^/:]+)[/:])?(?<repo>[^/\s]+?)(?:\.git)?$/
