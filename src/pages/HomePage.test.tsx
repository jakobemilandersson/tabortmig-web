import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Block the entire Firebase initialisation chain ────────────────────────────
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

// ── Mock feature hooks ───────────────────────────────────────────────────────────
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

// ── Import component after mocks are in place ────────────────────────────────
import HomePage from './HomePage'
import { useAuth } from '../features/auth/useAuth'
import { useSaveOptOuts } from '../features/optOuts/useSaveOptOuts'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockUseSaveOptOuts = useSaveOptOuts as ReturnType<typeof vi.fn>

// ── Helpers ─────────────────────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('HomePage — unauthenticated', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ currentUser: null, loading: false })
    mockUseSaveOptOuts.mockReturnValue({ saving: false, error: null, saveOptOuts: mockSaveOptOuts })
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

  it('renders a card for every site in SITES', () => {
    renderPage()
    const cards = screen.getAllByRole('article')
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
    mockUseSaveOptOuts.mockReturnValue({ saving: false, error: null, saveOptOuts: mockSaveOptOuts })
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
    mockUseSaveOptOuts.mockReturnValue({
      saving: false,
      error: 'Kunde inte spara dina avanmälningar.',
      saveOptOuts: mockSaveOptOuts,
    })
    renderPage()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
