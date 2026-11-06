import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import projectsSeed from "@/data/projects.json"
import certificationsSeed from "@/data/certifications.json"
import journeySeed from "@/data/journey.json"
import internshipsSeed from "@/data/internships.json"

export const COLLECTIONS = ["projects", "certifications", "journey", "internships"] as const
export type CollectionName = (typeof COLLECTIONS)[number]

const SEEDS: Record<CollectionName, unknown[]> = {
  projects: projectsSeed,
  certifications: certificationsSeed,
  journey: journeySeed,
  internships: internshipsSeed,
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
      await q`create table if not exists videos (
        id text primary key,
        content_type text not null,
        size bigint not null,
        chunks integer not null,
        complete boolean not null default false,
        created_at timestamptz not null default now()
      )`
      await q`create table if not exists video_chunks (
        video_id text not null,
        idx integer not null,
        data bytea not null,
        primary key (video_id, idx)
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

/* ------------------------------------------------------------------ */
/* Vidéos importées depuis l'ordinateur (stockées en morceaux de 2 Mo)  */
/* ------------------------------------------------------------------ */

export async function startVideo(contentType: string, size: number, chunks: number) {
  await ensureSchema()
  const q = sql()
  // Ménage : les imports abandonnés depuis plus d'un jour sont supprimés.
  await q`delete from video_chunks where video_id in (select id from videos where complete = false and created_at < now() - interval '1 day')`
  await q`delete from videos where complete = false and created_at < now() - interval '1 day'`
  const id = crypto.randomUUID()
  await q`insert into videos (id, content_type, size, chunks) values (${id}, ${contentType}, ${size}, ${chunks})`
  return id
}

export async function saveVideoChunk(id: string, index: number, base64: string) {
  await ensureSchema()
  const q = sql()
  const rows = await q`select chunks, complete from videos where id = ${id}`
  if (!rows.length || rows[0].complete || index < 0 || index >= (rows[0].chunks as number)) return false
  await q`insert into video_chunks (video_id, idx, data) values (${id}, ${index}, decode(${base64}, 'base64'))
    on conflict (video_id, idx) do update set data = excluded.data`
  return true
}

export async function finishVideo(id: string) {
  await ensureSchema()
  const q = sql()
  const rows = await q`select chunks from videos where id = ${id}`
  if (!rows.length) return false
  const got = await q`select count(*)::int as n from video_chunks where video_id = ${id}`
  if ((got[0].n as number) !== (rows[0].chunks as number)) return false
  await q`update videos set complete = true where id = ${id}`
  return true
}

export async function abortVideo(id: string) {
  await ensureSchema()
  const q = sql()
  await q`delete from video_chunks where video_id = ${id}`
  await q`delete from videos where id = ${id} and complete = false`
}

export async function loadVideoMeta(id: string) {
  await ensureSchema()
  const rows = await sql()`select content_type, size from videos where id = ${id} and complete = true`
  if (!rows.length) return null
  return { contentType: rows[0].content_type as string, size: Number(rows[0].size) }
}

/** Lit les octets [start, end] d'une vidéo (jamais plus de deux morceaux à la fois). */
export async function loadVideoBytes(id: string, start: number, end: number, chunkSize: number) {
  await ensureSchema()
  const first = Math.floor(start / chunkSize)
  const last = Math.floor(end / chunkSize)
  const rows = await sql()`select idx, encode(data, 'base64') as b64 from video_chunks where video_id = ${id} and idx >= ${first} and idx <= ${last} order by idx`
  const parts = rows.map((r) => Buffer.from(r.b64 as string, "base64"))
  const all = Buffer.concat(parts)
  const offset = start - first * chunkSize
  return all.subarray(offset, offset + (end - start + 1))
}
