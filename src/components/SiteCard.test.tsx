import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SiteCard } from './SiteCard'
import type { SiteConfig } from '../data/sites'

const site: SiteConfig = {
  id: 'ratsit',
  name: 'Ratsit',
  optOutUrl: 'https://www.ratsit.se/ratsit/avreg',
  defaultDurationMonths: 12,
  description: 'Ratsit publicerar personuppgifter.',
}

describe('SiteCard', () => {
  describe('checkbox', () => {
    it('calls onChange when checkbox is toggled on (entry is null)', async () => {
      const onChange = vi.fn()
      render(<SiteCard site={site} entry={null} onChange={onChange} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledOnce()
      const arg = onChange.mock.calls[0][0] as Record<string, unknown>
      expect(typeof arg.optOutDate).toBe('string')
      expect(arg.optOutDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('calls onChange with empty object when checkbox is toggled off', async () => {
      const onChange = vi.fn()
      render(<SiteCard site={site} entry={{ optOutDate: '2025-01-01' }} onChange={onChange} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith({})
    })
  })

  describe('date input', () => {
    it('calls onChange with updated optOutDate when date changes', async () => {
      const onChange = vi.fn()
      render(<SiteCard site={site} entry={{ optOutDate: '2025-01-01' }} onChange={onChange} />)
      const dateInput = screen.getByLabelText(/datum för avanmälan från ratsit/i)
      await userEvent.clear(dateInput)
      await userEvent.type(dateInput, '2025-06-15')
      // Last onChange call should carry the new date string
      const lastCall = onChange.mock.calls.at(-1)?.[0] as Record<string, unknown>
      expect(lastCall.optOutDate).toBe('2025-06-15')
    })

    it('is disabled when no entry exists (checkbox unchecked)', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} />)
      expect(screen.getByLabelText(/datum för avanmälan från ratsit/i)).toBeDisabled()
    })
  })

  describe('disabled state', () => {
    it('disables checkbox and date input when disabled prop is true', () => {
      render(<SiteCard site={site} entry={null} disabled onChange={vi.fn()} />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
      expect(screen.getByLabelText(/datum för avanmälan från ratsit/i)).toBeDisabled()
    })

    it('shows a sign-in message when disabled', () => {
      render(<SiteCard site={site} entry={null} disabled onChange={vi.fn()} />)
      expect(screen.getByText(/logga in för att spåra/i)).toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders site name as a link to the opt-out URL', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} />)
      const link = screen.getByRole('link', { name: /avanmälningssidan för ratsit/i })
      expect(link).toHaveAttribute('href', site.optOutUrl)
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders the disclaimer mentioning defaultDurationMonths', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} />)
      expect(screen.getByText(/12 månader/i)).toBeInTheDocument()
    })
  })
})
