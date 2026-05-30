import type { SiteConfig } from '../data/sites'

/**
 * A lightweight date-string representation used in SiteCard's onChange
 * callback. The page/feature layer is responsible for converting to/from
 * Firebase Timestamps. This keeps SiteCard free of any Firebase imports.
 */
export interface SiteCardEntry {
  optOutDate: string // ISO date string, e.g. "2025-03-01"
}

export interface SiteCardProps {
  site: SiteConfig
  /** Current entry for this site, or null if the user has not opted out yet. */
  entry: SiteCardEntry | null
  /** Pass true for unauthenticated visitors to disable interactive controls. */
  disabled?: boolean
  /** Called whenever the user toggles the checkbox or changes the date. */
  onChange: (partial: Partial<SiteCardEntry>) => void
}

export function SiteCard({ site, entry, disabled = false, onChange }: SiteCardProps) {
  const isChecked = entry !== null
  const dateValue = entry?.optOutDate ?? ''

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      // Provide today's date as a sensible default when first checked
      const today = new Date().toISOString().slice(0, 10)
      onChange({ optOutDate: today })
    } else {
      // Unchecking clears the entry; signal with an empty partial
      onChange({})
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ optOutDate: e.target.value })
  }

  const checkboxId = `opted-out-${site.id}`
  const dateId = `opt-out-date-${site.id}`

  return (
    <article aria-label={site.name} style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
          <a
            href={site.optOutUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Gå till avanmälningssidan för ${site.name}`}
          >
            {site.name}
          </a>
        </h2>
      </div>

      <p style={{ margin: '0.25rem 0 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
        {site.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor={dateId} style={{ fontSize: '0.875rem' }}>
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
        <p
          id={`disabled-hint-${site.id}`}
          style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}
        >
          Logga in för att spåra din avanmälan.
        </p>
      )}

      <p
        style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: '#9ca3af',
          fontStyle: 'italic',
        }}
      >
        Vi påminner dig baserat på vår uppskattade intervall ({site.defaultDurationMonths} månader).
        Sajten kan ha ett annat faktiskt beteende.
      </p>
    </article>
  )
}
