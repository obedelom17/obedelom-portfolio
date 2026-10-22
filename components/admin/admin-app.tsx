"use client"

import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { ExternalLink, LogOut } from "lucide-react"
import { ADMIN_EMAIL, getBrowserSupabase, supabaseEnabled } from "@/lib/supabase"
import { Button, Field, TextInput } from "./ui"
import { CertificationsPanel, JourneyPanel, ProjectsPanel } from "./panels"

type Tab = "projects" | "certifications" | "journey"

const tabs: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projets" },
  { id: "certifications", label: "Certifications" },
  { id: "journey", label: "Parcours" },
]

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-4xl px-5 py-10 sm:px-8">{children}</div>
}

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = getBrowserSupabase()
    if (!supabase) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError("Identifiants incorrects.")
    setBusy(false)
  }

  return (
    <Frame>
      <div className="mx-auto mt-16 max-w-sm">
        <p className="label">Administration</p>
        <h1 className="mt-3 font-serif text-4xl">Connexion</h1>
        <form onSubmit={submit} className="mt-10 space-y-6">
          <Field label="Email">
            <TextInput type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Mot de passe">
            <TextInput
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <p className="border-l-2 border-accent pl-3 text-sm text-accent">{error}</p>}
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

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>("projects")

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabaseEnabled) {
    return (
      <Frame>
        <h1 className="font-serif text-4xl">Supabase non configuré</h1>
        <p className="mt-4 max-w-xl text-muted">
          Définissez NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et NEXT_PUBLIC_ADMIN_EMAIL dans les variables
          d'environnement, puis redéployez. Voir le README.
        </p>
      </Frame>
    )
  }

  if (!ready) return <Frame>
    <p className="text-muted">Chargement…</p>
  </Frame>

  if (!session) return <Login />

  const email = session.user.email?.toLowerCase() ?? ""
  if (ADMIN_EMAIL && email !== ADMIN_EMAIL) {
    return (
      <Frame>
        <h1 className="font-serif text-4xl">Accès refusé</h1>
        <p className="mt-4 text-muted">Ce compte n'est pas autorisé à administrer le site.</p>
        <Button className="mt-6" variant="outline" onClick={() => getBrowserSupabase()?.auth.signOut()}>
          Se déconnecter
        </Button>
      </Frame>
    )
  }

  const token = session.access_token

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
          <Button variant="outline" onClick={() => getBrowserSupabase()?.auth.signOut()}>
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
        {tab === "projects" && <ProjectsPanel token={token} />}
        {tab === "certifications" && <CertificationsPanel token={token} />}
        {tab === "journey" && <JourneyPanel token={token} />}
      </div>

      <p className="mt-16 text-xs text-muted">
        Les modifications apparaissent sur le site en quelques secondes.
      </p>
    </Frame>
  )
}
