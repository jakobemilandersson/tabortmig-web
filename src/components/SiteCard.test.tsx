import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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
      render(<SiteCard site={site} entry={null} onChange={onChange} onClear={vi.fn()} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledOnce()
      const arg = onChange.mock.calls[0][0] as Record<string, unknown>
      expect(typeof arg.optOutDate).toBe('string')
      expect(arg.optOutDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('calls onClear when checkbox is toggled off', async () => {
      const onClear = vi.fn()
      render(<SiteCard site={site} entry={{ optOutDate: '2025-01-01' }} onChange={vi.fn()} onClear={onClear} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onClear).toHaveBeenCalledOnce()
    })
  })

  describe('date input', () => {
    it('calls onChange with updated optOutDate when date changes', () => {
      const onChange = vi.fn()
      render(<SiteCard site={site} entry={{ optOutDate: '2025-01-01' }} onChange={onChange} onClear={vi.fn()} />)
      const dateInput = screen.getByLabelText(/datum för avanmälan från ratsit/i)
      fireEvent.change(dateInput, { target: { value: '2025-06-15' } })
      expect(onChange).toHaveBeenLastCalledWith({ optOutDate: '2025-06-15' })
    })

    it('is disabled when no entry exists (checkbox unchecked)', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} onClear={vi.fn()} />)
      expect(screen.getByLabelText(/datum för avanmälan från ratsit/i)).toBeDisabled()
    })
  })

  describe('disabled state', () => {
    it('disables checkbox and date input when disabled prop is true', () => {
      render(<SiteCard site={site} entry={null} disabled onChange={vi.fn()} onClear={vi.fn()} />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
      expect(screen.getByLabelText(/datum för avanmälan från ratsit/i)).toBeDisabled()
    })

    it('shows a sign-in message when disabled', () => {
      render(<SiteCard site={site} entry={null} disabled onChange={vi.fn()} onClear={vi.fn()} />)
      expect(screen.getByText(/logga in för att spåra/i)).toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders site name as a link to the opt-out URL', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} onClear={vi.fn()} />)
      const link = screen.getByRole('link', { name: /avanmälningssidan för ratsit/i })
      expect(link).toHaveAttribute('href', site.optOutUrl)
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders the disclaimer mentioning defaultDurationMonths', () => {
      render(<SiteCard site={site} entry={null} onChange={vi.fn()} onClear={vi.fn()} />)
      expect(screen.getByText(/12 månader/i)).toBeInTheDocument()
    })
  })
})
