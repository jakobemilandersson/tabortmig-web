import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HomePage from './HomePage'

// ── mock feature hooks ────────────────────────────────────────────────────────

const mockSaveOptOuts = vi.fn().mockResolvedValue(true)

vi.mock('../features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../features/optOuts/useOptOuts', () => ({
  useOptOuts: vi.fn(() => ({ entries: {}, loading: false, error: null })),
}))

vi.mock('../features/optOuts/useSaveOptOuts', () => ({
  useSaveOptOuts: vi.fn(() => ({ saving: false, error: null, saveOptOuts: mockSaveOptOuts })),
}))

// ── firebase/firestore must be stubbed so Timestamp import doesn't blow up ───
vi.mock('firebase/firestore', () => ({
  Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
}))

import { useAuth } from '../features/auth/useAuth'
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

// ── helpers ───────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('HomePage — unauthenticated', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: false })
  })

  it('renders the app heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /tabortmig/i })).toBeInTheDocument()
  })

  it('shows a sign-in call-to-action linking to /auth', () => {
    renderPage()
    const cta = screen.getByRole('link', { name: /logga in/i })
    expect(cta).toHaveAttribute('href', '/auth')
  })

  it('renders a card for every site in SITES', async () => {
    renderPage()
    const cards = await screen.findAllByRole('article')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('does not render the Save button', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: /spara/i })).toBeNull()
  })
})

describe('HomePage — authenticated', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ currentUser: { uid: 'user-1' }, loading: false })
    mockSaveOptOuts.mockResolvedValue(true)
  })

  it('renders the Save button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /spara/i })).toBeInTheDocument()
  })

  it('does not show the sign-in CTA', () => {
    renderPage()
    expect(screen.queryByRole('link', { name: /logga in/i })).toBeNull()
  })

  it('shows success feedback after a successful save', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /spara/i }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/sparats/i)
    )
  })

  it('shows error feedback when save fails', async () => {
    mockSaveOptOuts.mockResolvedValue(false)
    const { useSaveOptOuts } = await import('../features/optOuts/useSaveOptOuts')
    ;(useSaveOptOuts as ReturnType<typeof vi.fn>).mockReturnValue({
      saving: false,
      error: 'Kunde inte spara dina avanmälningar.',
      saveOptOuts: mockSaveOptOuts,
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /spara/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    )
  })
})
