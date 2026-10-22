"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, LogOut } from "lucide-react"
import { sortCertifications, sortJourney, sortProjects } from "@/lib/sort"
import type { Certification, JourneyItem, Project } from "@/lib/types"
import { Button, Field, TextInput } from "./ui"
import { CertificationsPanel, JourneyPanel, ProjectsPanel } from "./panels"
import { useCollection } from "./use-collection"

type Tab = "projects" | "certifications" | "journey"

type AdminData = {
  projects: Project[]
  certifications: Certification[]
  journey: JourneyItem[]
  repo: string
  branch: string
}

const tabs: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projets" },
  { id: "certifications", label: "Certifications" },
  { id: "journey", label: "Parcours" },
]

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-4xl px-5 py-10 sm:px-8">{children}</div>
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    setBusy(false)
    if (res.ok) onDone()
    else setError("Mot de passe incorrect.")
  }

  return (
    <Frame>
      <div className="mx-auto mt-16 max-w-sm">
        <p className="label">Administration</p>
        <h1 className="mt-3 font-serif text-4xl">Connexion</h1>
        <form onSubmit={submit} className="mt-10 space-y-6">
          <Field label="Mot de passe">
            <TextInput
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <p className="border-l-2 border-red-700 pl-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
        <a href="/" className="label link-underline mt-10 inline-block pb-0.5">
          Retour au site
        </a>
      </div>
    </Frame>
  )
}

function Dashboard({ data, onLogout }: { data: AdminData; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("projects")
  const projects = useCollection<Project>("projects", data.projects, sortProjects)
  const certifications = useCollection<Certification>("certifications", data.certifications, sortCertifications)
  const journey = useCollection<JourneyItem>("journey", data.journey, sortJourney)

  return (
    <Frame>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label">Administration</p>
          <h1 className="mt-2 font-serif text-4xl">Portfolio</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="label link-underline inline-flex items-center gap-1 pb-0.5">
            Voir le site <ExternalLink className="h-3 w-3" />
          </a>
          <Button variant="outline" onClick={onLogout}>
            <span className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </span>
          </Button>
        </div>
      </header>

      <nav className="mt-10 flex gap-6 border-b border-line" aria-label="Sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              tab === t.id ? "border-accent font-medium text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "projects" && <ProjectsPanel col={projects} />}
        {tab === "certifications" && <CertificationsPanel col={certifications} />}
        {tab === "journey" && <JourneyPanel col={journey} />}
      </div>

      <p className="mt-16 text-xs text-muted">
        Chaque enregistrement crée un commit dans {data.repo} ({data.branch}). Vercel redéploie ensuite le site automatiquement.
      </p>
    </Frame>
  )
}

export function AdminApp() {
  const [state, setState] = useState<"loading" | "out" | "in" | "no_password" | "no_github" | "error">("loading")
  const [data, setData] = useState<AdminData | null>(null)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    setState("loading")
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" })
      const json = (await res.json().catch(() => ({}))) as Partial<AdminData> & { error?: string }
      if (res.status === 401) return setState("out")
      if (json.error === "not_configured") return setState("no_password")
      if (json.error === "github_not_configured") return setState("no_github")
      if (!res.ok) {
        setMessage(json.error ?? `Erreur ${res.status}`)
        return setState("error")
      }
      setData(json as AdminData)
      setState("in")
    } catch {
      setMessage("Connexion impossible.")
      setState("error")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    setData(null)
    setState("out")
  }

  if (state === "loading") {
    return (
      <Frame>
        <p className="text-muted">Chargement…</p>
      </Frame>
    )
  }

  if (state === "no_password" || state === "no_github") {
    return (
      <Frame>
        <h1 className="font-serif text-4xl">Administration non configurée</h1>
        <p className="mt-4 max-w-xl text-muted">
          {state === "no_password"
            ? "Définissez ADMIN_PASSWORD dans les variables d'environnement, puis redéployez."
            : "Définissez GITHUB_TOKEN et GITHUB_REPO dans les variables d'environnement, puis redéployez."}{" "}
          Voir le README.
        </p>
      </Frame>
    )
  }

  if (state === "error") {
    return (
      <Frame>
        <h1 className="font-serif text-4xl">Erreur</h1>
        <p className="mt-4 max-w-xl text-muted">{message}</p>
        <Button className="mt-6" variant="outline" onClick={load}>
          Réessayer
        </Button>
      </Frame>
    )
  }

  if (state === "out" || !data) return <Login onDone={load} />

  return <Dashboard data={data} onLogout={logout} />
}
