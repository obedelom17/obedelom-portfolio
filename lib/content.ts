import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import projectsSeed from "@/data/projects.json"
import certificationsSeed from "@/data/certifications.json"
import journeySeed from "@/data/journey.json"

export const COLLECTIONS = ["projects", "certifications", "journey"] as const
export type CollectionName = (typeof COLLECTIONS)[number]

const SEEDS: Record<CollectionName, unknown[]> = {
  projects: projectsSeed,
  certifications: certificationsSeed,
  journey: journeySeed,
}

type Item = { id: string; sort_order?: number }
type Sql = NeonQueryFunction<false, false>

export function dbEnabled() {
  return Boolean(process.env.DATABASE_URL)
}

let client: Sql | null = null
function sql(): Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL manquant")
  if (!client) client = neon(url)
  return client
}

let schemaReady: Promise<void> | null = null
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const q = sql()
      await q`create table if not exists content (
        collection text not null,
        id text not null,
        sort_order integer not null default 0,
        data jsonb not null,
        primary key (collection, id)
      )`
      await q`create table if not exists images (
        id text primary key,
        content_type text not null,
        data bytea not null,
        created_at timestamptz not null default now()
      )`
      await q`create table if not exists meta (key text primary key, value text not null)`
    })().catch((e) => {
      schemaReady = null
      throw e
    })
  }
  return schemaReady
}

export async function readCollection<T>(name: CollectionName): Promise<T[]> {
  await ensureSchema()
  const rows = await sql()`select data from content where collection = ${name}`
  return rows.map((r) => r.data as T)
}

export async function writeCollection(name: CollectionName, items: Item[]) {
  await ensureSchema()
  const q = sql()
  await q.transaction([
    q`delete from content where collection = ${name}`,
    ...items.map(
      (it) =>
        q`insert into content (collection, id, sort_order, data)
          values (${name}, ${it.id}, ${it.sort_order ?? 0}, ${JSON.stringify(it)}::jsonb)`,
    ),
  ])
}

/** Charge les données de départ une seule fois, à la première ouverture de l'administration. */
export async function seedOnce() {
  await ensureSchema()
  const q = sql()
  const flag = await q`select value from meta where key = 'seeded'`
  if (flag.length) return
  for (const name of COLLECTIONS) {
    const existing = await q`select 1 from content where collection = ${name} limit 1`
    if (existing.length === 0) await writeCollection(name, SEEDS[name] as Item[])
  }
  await q`insert into meta (key, value) values ('seeded', 'true') on conflict (key) do nothing`
}

export async function saveImage(base64: string) {
  await ensureSchema()
  const id = crypto.randomUUID()
  await sql()`insert into images (id, content_type, data) values (${id}, 'image/webp', decode(${base64}, 'base64'))`
  return id
}

export async function loadImage(id: string) {
  await ensureSchema()
  const rows = await sql()`select content_type, encode(data, 'base64') as b64 from images where id = ${id}`
  if (!rows.length) return null
  return { contentType: rows[0].content_type as string, bytes: Buffer.from(rows[0].b64 as string, "base64") }
}
