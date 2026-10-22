const API = process.env.GITHUB_API_URL || "https://api.github.com"

export class NotConfiguredError extends Error {}

export function githubConfig() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || "main"
  if (!token || !repo) throw new NotConfiguredError("GITHUB_TOKEN et GITHUB_REPO sont requis")
  return { token, repo, branch }
}

async function gh(path: string, init?: RequestInit) {
  const { token, repo } = githubConfig()
  return fetch(`${API}/repos/${repo}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
}

export async function readJsonFile<T>(path: string): Promise<T> {
  const { branch } = githubConfig()
  const res = await gh(`contents/${path}?ref=${encodeURIComponent(branch)}`)
  if (!res.ok) throw new Error(`Lecture de ${path} impossible (${res.status})`)
  const json = (await res.json()) as { content: string }
  return JSON.parse(Buffer.from(json.content, "base64").toString("utf-8")) as T
}

async function getSha(path: string): Promise<string | undefined> {
  const { branch } = githubConfig()
  const res = await gh(`contents/${path}?ref=${encodeURIComponent(branch)}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Lecture de ${path} impossible (${res.status})`)
  return ((await res.json()) as { sha: string }).sha
}

export async function writeFile(path: string, contentBase64: string, message: string) {
  const { branch } = githubConfig()
  const sha = await getSha(path)
  const res = await gh(`contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: contentBase64, branch, ...(sha ? { sha } : {}) }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Écriture de ${path} impossible (${res.status}) ${detail.slice(0, 200)}`)
  }
}

export async function writeJsonFile(path: string, value: unknown, message: string) {
  const content = Buffer.from(JSON.stringify(value, null, 2) + "\n", "utf-8").toString("base64")
  await writeFile(path, content, message)
}
