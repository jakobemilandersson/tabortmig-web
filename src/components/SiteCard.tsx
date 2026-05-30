import type { SiteConfig } from '../data/sites'

/**
 * A plain-TS entry shape used in SiteCard props.
 *
 * `optOutDate` is an ISO-8601 date string ("YYYY-MM-DD"). The page/feature
 * layer is responsible for converting this to/from a Firebase `Timestamp`
 * before reading from or persisting to Firestore. This keeps SiteCard free
 * of any Firebase imports.
 */
export interface SiteCardEntry {
  optOutDate: string
}

export interface SiteCardProps {
  site: SiteConfig
  /** Current entry for this site, or null if the user has not opted out yet. */
  entry: SiteCardEntry | null
  /** Pass true for unauthenticated visitors to disable interactive controls. */
  disabled?: boolean
  /** Called when the user edits the opt-out date. */
  onChange: (partial: Partial<SiteCardEntry>) => void
  /**
   * Called when the user unchecks the "I have opted out" checkbox.
   * The parent should treat this as a request to delete the entry.
   */
  onClear: () => void
}

export function SiteCard({ site, entry, disabled = false, onChange, onClear }: SiteCardProps) {
  const isChecked = entry !== null
  const dateValue = entry?.optOutDate ?? ''

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      const today = new Date().toISOString().slice(0, 10)
      onChange({ optOutDate: today })
    } else {
      onClear()
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ optOutDate: e.target.value })
  }

  const checkboxId = `opted-out-${site.id}`
  const dateId = `opt-out-date-${site.id}`

  return (
    <article aria-label={site.name} className="border-b border-gray-200 py-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold">
          <a
            href={site.optOutUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Gå till avanmälningssidan för ${site.name}`}
            className="underline hover:text-gray-600"
          >
            {site.name}
          </a>
        </h2>
      </div>

      <p className="mt-1 mb-3 text-sm text-gray-500">
        {site.description}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            onChange={handleCheckboxChange}
            aria-describedby={disabled ? `disabled-hint-${site.id}` : undefined}
          />
          <label htmlFor={checkboxId}>Jag har avanmält mig</label>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={dateId} className="text-sm">
            Datum för avanmälan:
          </label>
          <input
            id={dateId}
            type="date"
            value={dateValue}
            disabled={disabled || !isChecked}
            onChange={handleDateChange}
            aria-label={`Datum för avanmälan från ${site.name}`}
          />
        </div>
      </div>

      {disabled && (
        <p id={`disabled-hint-${site.id}`} className="mt-2 text-xs text-gray-400">
          Logga in för att spåra din avanmälan.
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400 italic">
        Vi påminner dig baserat på vår uppskattade intervall ({site.defaultDurationMonths} månader).
        Sajten kan ha ett annat faktiskt beteende.
      </p>
    </article>
  )
}
