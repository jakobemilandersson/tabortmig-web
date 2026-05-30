import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { SITES } from '../data/sites'
import { useAuth } from '../features/auth/useAuth'
import { useOptOuts } from '../features/optOuts/useOptOuts'
import { useSaveOptOuts } from '../features/optOuts/useSaveOptOuts'
import { computeExpiryDate } from '../features/optOuts/computeExpiryDate'
import { SiteCard } from '../components/SiteCard'
import type { SiteCardEntry } from '../components/SiteCard'
import type { OptOutEntry } from '../features/optOuts/types'

/** Convert a Firestore Timestamp to the ISO-8601 date string SiteCard expects. */
function timestampToDateString(ts: Timestamp): string {
  return ts.toDate().toISOString().slice(0, 10)
}

/** Convert a plain-TS SiteCardEntry + siteId into a Firestore-ready OptOutEntry. */
function toOptOutEntry(siteId: string, cardEntry: SiteCardEntry): OptOutEntry {
  const site = SITES.find((s) => s.id === siteId)!
  const optOutDate = new Date(cardEntry.optOutDate)
  const expiryDate = computeExpiryDate(optOutDate, site.defaultDurationMonths)
  return {
    siteId,
    optOutDate: Timestamp.fromDate(optOutDate),
    expiryDate: Timestamp.fromDate(expiryDate),
  }
}

export default function HomePage() {
  const { currentUser, loading: authLoading } = useAuth()
  const uid = currentUser?.uid ?? null
  const { entries: savedEntries, loading: entriesLoading } = useOptOuts(uid)
  const { saving, error: saveError, saveOptOuts } = useSaveOptOuts(uid)

  // Local plain-TS state for the form; keyed by siteId
  const [localEntries, setLocalEntries] = useState<Record<string, SiteCardEntry>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Hydrate local state when saved entries arrive from Firestore
  useEffect(() => {
    const hydrated: Record<string, SiteCardEntry> = {}
    for (const [siteId, entry] of Object.entries(savedEntries)) {
      hydrated[siteId] = { optOutDate: timestampToDateString(entry.optOutDate) }
    }
    setLocalEntries(hydrated)
  }, [savedEntries])

  function handleChange(siteId: string, partial: Partial<SiteCardEntry>) {
    setLocalEntries((prev) => ({
      ...prev,
      [siteId]: { ...prev[siteId], ...partial },
    }))
    setSaveSuccess(false)
  }

  function handleClear(siteId: string) {
    setLocalEntries((prev) => {
      const next = { ...prev }
      delete next[siteId]
      return next
    })
    setSaveSuccess(false)
  }

  async function handleSave() {
    const firestoreEntries: Record<string, OptOutEntry> = {}
    for (const [siteId, cardEntry] of Object.entries(localEntries)) {
      firestoreEntries[siteId] = toOptOutEntry(siteId, cardEntry)
    }
    const ok = await saveOptOuts(firestoreEntries)
    if (ok) setSaveSuccess(true)
  }

  const isAuthenticated = !authLoading && currentUser !== null
  const isLoading = authLoading || entriesLoading

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">TaBortMig</h1>
      <p className="mb-8 text-gray-600">
        Håll koll på när du behöver förnya dina avanmälningar från svenska personsöktjänster.
      </p>

      {!authLoading && !isAuthenticated && (
        <p className="mb-6 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Link to="/auth" className="font-semibold underline">
            Logga in för att spåra dina avanmälningar
          </Link>{' '}
          och få påminnelser via e-post.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Laddar…</p>
      ) : (
        <>
          {SITES.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              entry={localEntries[site.id] ?? null}
              disabled={!isAuthenticated}
              onChange={(partial) => handleChange(site.id, partial)}
              onClear={() => handleClear(site.id)}
            />
          ))}

          {isAuthenticated && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Sparar…' : 'Spara'}
              </button>

              {saveSuccess && (
                <p role="status" className="text-sm text-green-700">
                  Dina avanmälningar har sparats.
                </p>
              )}
              {saveError && (
                <p role="alert" className="text-sm text-red-600">
                  {saveError}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
