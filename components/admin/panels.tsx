"use client"

import { useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import { Button, Field, ImageField, TextArea, TextInput } from "./ui"
import { PROJECT_STATUSES, type Certification, type JourneyItem, type Project, type ProjectStatus } from "@/lib/types"
import { useTable } from "./use-table"
import { sortCertifications, sortJourney, sortProjects } from "@/lib/sort"
import { seedCertifications, seedJourney, seedProjects } from "@/lib/seed"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  production: "En production",
  in_progress: "En cours",
  completed: "Terminé",
  academic: "Projet académique",
  security: "Cybersécurité",
}

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean)
const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean)

function Shell({
  title,
  count,
  onAdd,
  error,
  loading,
  children,
}: {
  title: string
  count: number
  onAdd: () => void
  error: string | null
  loading: boolean
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-3xl">
          {title} <span className="label align-middle">({count})</span>
        </h2>
        <Button onClick={onAdd}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </span>
        </Button>
      </div>
      {error && <p className="mt-4 border-l-2 border-red-700 pl-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-sm text-muted">Chargement…</p>}
      <div className="mt-6">{children}</div>
    </div>
  )
}

function Row({
  title,
  meta,
  onEdit,
  onDelete,
  onUp,
  onDown,
}: {
  title: string
  meta: string
  onEdit: () => void
  onDelete: () => void
  onUp?: () => void
  onDown?: () => void
}) {
  return (
    <li className="flex items-center gap-3 border-t border-line py-4 last:border-b">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="label mt-1 truncate">{meta}</p>
      </div>
      <button type="button" onClick={onUp} disabled={!onUp} aria-label="Monter" className="p-2 text-muted hover:text-fg disabled:opacity-25">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDown} disabled={!onDown} aria-label="Descendre" className="p-2 text-muted hover:text-fg disabled:opacity-25">
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onEdit} aria-label="Modifier" className="p-2 text-muted hover:text-fg">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Supprimer cet élément ?")) onDelete()
        }}
        aria-label="Supprimer"
        className="p-2 text-muted hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

function Editor({
  title,
  onCancel,
  onSave,
  saving,
  error,
  children,
}: {
  title: string
  onCancel: () => void
  onSave: () => void
  saving: boolean
  error: string | null
  children: ReactNode
}) {
  return (
    <div className="border border-fg bg-card p-5 sm:p-8">
      <h3 className="font-serif text-2xl">{title}</h3>
      <div className="mt-6 space-y-6">{children}</div>
      {error && <p className="mt-6 border-l-2 border-red-700 pl-3 text-sm text-red-700">{error}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
      </div>
    </div>
  )
}

function SeedBanner({ onImport }: { onImport: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="mb-10 border border-accent p-5">
      <p className="font-medium">Base vide</p>
      <p className="mt-1 text-sm text-muted">
        Importez vos projets, certifications et étapes de parcours actuels pour les modifier ensuite depuis cette interface.
      </p>
      <Button
        className="mt-4"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          await onImport()
          setBusy(false)
        }}
      >
        {busy ? "Import en cours…" : "Importer les données de départ"}
      </Button>
    </div>
  )
}

/* ---------- Projets ---------- */

type ProjectDraft = {
  id?: string
  title: string
  description_fr: string
  description_en: string
  features_fr: string
  features_en: string
  stack: string
  status: ProjectStatus
  images: string[]
  demo_url: string
  code_url: string
}

const emptyProject: ProjectDraft = {
  title: "",
  description_fr: "",
  description_en: "",
  features_fr: "",
  features_en: "",
  stack: "",
  status: "in_progress",
  images: [],
  demo_url: "",
  code_url: "",
}

export function ProjectsPanel({ token }: { token: string | undefined }) {
  const t = useTable<Project>("projects", sortProjects, token)
  const [draft, setDraft] = useState<ProjectDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const edit = (p: Project) =>
    setDraft({
      id: p.id,
      title: p.title,
      description_fr: p.description_fr,
      description_en: p.description_en,
      features_fr: (p.features_fr ?? []).join("\n"),
      features_en: (p.features_en ?? []).join("\n"),
      stack: (p.stack ?? []).join(", "),
      status: p.status,
      images: p.images ?? [],
      demo_url: p.demo_url ?? "",
      code_url: p.code_url ?? "",
    })

  const submit = async () => {
    if (!draft) return
    if (!draft.title.trim()) return setErr("Le titre est obligatoire.")
    if (!draft.description_fr.trim() && !draft.description_en.trim()) return setErr("Ajoutez une description.")
    setSaving(true)
    setErr(null)
    const message = await t.save({
      id: draft.id,
      title: draft.title.trim(),
      description_fr: draft.description_fr.trim(),
      description_en: draft.description_en.trim(),
      features_fr: lines(draft.features_fr),
      features_en: lines(draft.features_en),
      stack: csv(draft.stack),
      status: draft.status,
      images: draft.images,
      demo_url: draft.demo_url.trim() || null,
      code_url: draft.code_url.trim() || null,
    })
    setSaving(false)
    if (message) setErr(message)
    else setDraft(null)
  }

  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))

  if (draft) {
    return (
      <Editor
        title={draft.id ? "Modifier le projet" : "Nouveau projet"}
        onCancel={() => {
          setDraft(null)
          setErr(null)
        }}
        onSave={submit}
        saving={saving}
        error={err}
      >
        <Field label="Titre">
          <TextInput value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Description (français)">
            <TextArea rows={5} value={draft.description_fr} onChange={(e) => set("description_fr", e.target.value)} />
          </Field>
          <Field label="Description (anglais)">
            <TextArea rows={5} value={draft.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </Field>
          <Field label="Fonctionnalités (français)" hint="Une par ligne">
            <TextArea rows={4} value={draft.features_fr} onChange={(e) => set("features_fr", e.target.value)} />
          </Field>
          <Field label="Fonctionnalités (anglais)" hint="Une par ligne">
            <TextArea rows={4} value={draft.features_en} onChange={(e) => set("features_en", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Technologies" hint="Séparées par des virgules">
            <TextInput value={draft.stack} onChange={(e) => set("stack", e.target.value)} placeholder="Next.js, Supabase, Vercel" />
          </Field>
          <Field label="Statut">
            <select
              value={draft.status}
              onChange={(e) => set("status", e.target.value as ProjectStatus)}
              className="field bg-card"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lien du site">
            <TextInput value={draft.demo_url} onChange={(e) => set("demo_url", e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Lien du code">
            <TextInput value={draft.code_url} onChange={(e) => set("code_url", e.target.value)} placeholder="https://github.com/" />
          </Field>
        </div>
        <ImageField label="Captures d'écran" folder="projects" multiple images={draft.images} onChange={(v) => set("images", v)} />
      </Editor>
    )
  }

  return (
    <Shell title="Projets" count={t.rows.length} onAdd={() => setDraft({ ...emptyProject })} error={t.error} loading={t.loading}>
      {!t.loading && t.rows.length === 0 && (
        <SeedBanner onImport={() => t.importRows(seedProjects)} />
      )}
      <ul>
        {t.rows.map((p, i) => (
          <Row
            key={p.id}
            title={p.title}
            meta={`${STATUS_LABELS[p.status] ?? p.status} · ${(p.stack ?? []).join(", ")}`}
            onEdit={() => edit(p)}
            onDelete={() => t.remove(p.id)}
            onUp={i > 0 ? () => t.swap(p, t.rows[i - 1]) : undefined}
            onDown={i < t.rows.length - 1 ? () => t.swap(p, t.rows[i + 1]) : undefined}
          />
        ))}
      </ul>
    </Shell>
  )
}

/* ---------- Certifications ---------- */

type CertDraft = { id?: string; title_fr: string; title_en: string; year: string; images: string[] }

export function CertificationsPanel({ token }: { token: string | undefined }) {
  const t = useTable<Certification>("certifications", sortCertifications, token)
  const [draft, setDraft] = useState<CertDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof CertDraft>(k: K, v: CertDraft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))

  const submit = async () => {
    if (!draft) return
    if (!draft.title_fr.trim() && !draft.title_en.trim()) return setErr("Le titre est obligatoire.")
    if (!draft.year.trim()) return setErr("L'année est obligatoire.")
    setSaving(true)
    setErr(null)
    const message = await t.save({
      id: draft.id,
      title_fr: draft.title_fr.trim(),
      title_en: draft.title_en.trim(),
      year: draft.year.trim(),
      image_url: draft.images[0] ?? null,
    })
    setSaving(false)
    if (message) setErr(message)
    else setDraft(null)
  }

  if (draft) {
    return (
      <Editor
        title={draft.id ? "Modifier la certification" : "Nouvelle certification"}
        onCancel={() => {
          setDraft(null)
          setErr(null)
        }}
        onSave={submit}
        saving={saving}
        error={err}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Titre (français)">
            <TextInput value={draft.title_fr} onChange={(e) => set("title_fr", e.target.value)} />
          </Field>
          <Field label="Titre (anglais)">
            <TextInput value={draft.title_en} onChange={(e) => set("title_en", e.target.value)} />
          </Field>
          <Field label="Année">
            <TextInput value={draft.year} onChange={(e) => set("year", e.target.value)} placeholder="2026" inputMode="numeric" />
          </Field>
        </div>
        <ImageField label="Image du certificat" folder="certifications" images={draft.images} onChange={(v) => set("images", v)} />
      </Editor>
    )
  }

  return (
    <Shell
      title="Certifications"
      count={t.rows.length}
      onAdd={() => setDraft({ title_fr: "", title_en: "", year: String(new Date().getFullYear()), images: [] })}
      error={t.error}
      loading={t.loading}
    >
      {!t.loading && t.rows.length === 0 && <SeedBanner onImport={() => t.importRows(seedCertifications)} />}
      <ul>
        {t.rows.map((c, i) => (
          <Row
            key={c.id}
            title={c.title_fr || c.title_en}
            meta={c.year}
            onEdit={() =>
              setDraft({
                id: c.id,
                title_fr: c.title_fr,
                title_en: c.title_en,
                year: c.year,
                images: c.image_url ? [c.image_url] : [],
              })
            }
            onDelete={() => t.remove(c.id)}
            onUp={i > 0 ? () => t.swap(c, t.rows[i - 1]) : undefined}
            onDown={i < t.rows.length - 1 ? () => t.swap(c, t.rows[i + 1]) : undefined}
          />
        ))}
      </ul>
    </Shell>
  )
}

/* ---------- Parcours ---------- */

type JourneyDraft = {
  id?: string
  year: string
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
}

export function JourneyPanel({ token }: { token: string | undefined }) {
  const t = useTable<JourneyItem>("journey", sortJourney, token)
  const [draft, setDraft] = useState<JourneyDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof JourneyDraft>(k: K, v: JourneyDraft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))

  const submit = async () => {
    if (!draft) return
    if (!draft.title_fr.trim() && !draft.title_en.trim()) return setErr("Le titre est obligatoire.")
    if (!draft.year.trim()) return setErr("L'année est obligatoire.")
    setSaving(true)
    setErr(null)
    const message = await t.save({
      id: draft.id,
      year: draft.year.trim(),
      title_fr: draft.title_fr.trim(),
      title_en: draft.title_en.trim(),
      description_fr: draft.description_fr.trim(),
      description_en: draft.description_en.trim(),
    })
    setSaving(false)
    if (message) setErr(message)
    else setDraft(null)
  }

  if (draft) {
    return (
      <Editor
        title={draft.id ? "Modifier l'étape" : "Nouvelle étape"}
        onCancel={() => {
          setDraft(null)
          setErr(null)
        }}
        onSave={submit}
        saving={saving}
        error={err}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Année">
            <TextInput value={draft.year} onChange={(e) => set("year", e.target.value)} placeholder="2026" inputMode="numeric" />
          </Field>
          <span className="hidden md:block" />
          <Field label="Titre (français)">
            <TextInput value={draft.title_fr} onChange={(e) => set("title_fr", e.target.value)} />
          </Field>
          <Field label="Titre (anglais)">
            <TextInput value={draft.title_en} onChange={(e) => set("title_en", e.target.value)} />
          </Field>
          <Field label="Description (français)">
            <TextArea value={draft.description_fr} onChange={(e) => set("description_fr", e.target.value)} />
          </Field>
          <Field label="Description (anglais)">
            <TextArea value={draft.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </Field>
        </div>
      </Editor>
    )
  }

  return (
    <Shell
      title="Parcours"
      count={t.rows.length}
      onAdd={() =>
        setDraft({
          year: String(new Date().getFullYear()),
          title_fr: "",
          title_en: "",
          description_fr: "",
          description_en: "",
        })
      }
      error={t.error}
      loading={t.loading}
    >
      {!t.loading && t.rows.length === 0 && <SeedBanner onImport={() => t.importRows(seedJourney)} />}
      <p className="mb-4 text-xs text-muted">
        Le site affiche les étapes de la plus récente à la plus ancienne. Les flèches réordonnent les étapes d'une même année.
      </p>
      <ul>
        {t.rows.map((j, i) => {
          const prev = t.rows[i - 1]
          const next = t.rows[i + 1]
          return (
            <Row
              key={j.id}
              title={j.title_fr || j.title_en}
              meta={`${j.year} · ${j.description_fr || j.description_en}`}
              onEdit={() =>
                setDraft({
                  id: j.id,
                  year: j.year,
                  title_fr: j.title_fr,
                  title_en: j.title_en,
                  description_fr: j.description_fr,
                  description_en: j.description_en,
                })
              }
              onDelete={() => t.remove(j.id)}
              onUp={prev && prev.year === j.year ? () => t.swap(j, prev) : undefined}
              onDown={next && next.year === j.year ? () => t.swap(j, next) : undefined}
            />
          )
        })}
      </ul>
    </Shell>
  )
}
