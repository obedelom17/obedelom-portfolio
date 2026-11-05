import { neon } from "@neondatabase/serverless"
import projectsSeed from "../../data/projects.json"
import certificationsSeed from "../../data/certifications.json"
import journeySeed from "../../data/journey.json"
import internshipsSeed from "../../data/internships.json"

export const COLLECTIONS = ["projects", "certifications", "journey", "internships"]

const SEEDS = {
  projects: projectsSeed,
  certifications: certificationsSeed,
  journey: journeySeed,
  internships: internshipsSeed,
}

export function dbEnabled(env) {
  return Boolean(env.DATABASE_URL)
}

function sql(env) {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL manquant")
  return neon(env.DATABASE_URL)
}

let schemaReady = null
function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = (async () => {
      const q = sql(env)
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

export async function readCollection(env, name) {
  await ensureSchema(env)
  const rows = await sql(env)`select data from content where collection = ${name}`
  return rows.map((r) => r.data)
}

export async function writeCollection(env, name, items) {
  await ensureSchema(env)
  const q = sql(env)
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
export async function seedOnce(env) {
  await ensureSchema(env)
  const q = sql(env)
  const flag = await q`select value from meta where key = 'seeded'`
  if (flag.length) return
  for (const name of COLLECTIONS) {
    const existing = await q`select 1 from content where collection = ${name} limit 1`
    if (existing.length === 0) await writeCollection(env, name, SEEDS[name])
  }
  await q`insert into meta (key, value) values ('seeded', 'true') on conflict (key) do nothing`
}

export async function saveImage(env, base64) {
  await ensureSchema(env)
  const id = crypto.randomUUID()
  await sql(env)`insert into images (id, content_type, data) values (${id}, 'image/webp', decode(${base64}, 'base64'))`
  return id
}

export async function loadImage(env, id) {
  await ensureSchema(env)
  const rows = await sql(env)`select content_type, encode(data, 'base64') as b64 from images where id = ${id}`
  if (!rows.length) return null
  const bin = atob(rows[0].b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { contentType: rows[0].content_type, bytes }
}
