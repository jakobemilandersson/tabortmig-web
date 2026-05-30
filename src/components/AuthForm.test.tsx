import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  // Shared no-op used in tests that don't assert on onSubmit calls.
  // Cleared before each test so call counts don't bleed between tests.
  const noop = vi.fn(() => Promise.resolve())
  beforeEach(() => noop.mockClear())

  it('renders email and password fields with labels', () => {
    render(<AuthForm mode="signIn" onSubmit={noop} />)
    expect(screen.getByLabelText(/e-post/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lösenord/i)).toBeInTheDocument()
  })

  it('calls onSubmit with the entered email and password', async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    render(<AuthForm mode="signIn" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/e-post/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/lösenord/i), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /logga in/i }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'secret123')
    )
  })

  it('disables the submit button while loading', () => {
    render(<AuthForm mode="signIn" onSubmit={noop} loading />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('displays the error message when error prop is set', () => {
    render(<AuthForm mode="signIn" onSubmit={noop} error="Felaktigt lösenord" />)
    expect(screen.getByText('Felaktigt lösenord')).toBeInTheDocument()
  })

  it('shows "Skapa konto" button label in signUp mode', () => {
    render(<AuthForm mode="signUp" onSubmit={noop} />)
    expect(screen.getByRole('button', { name: /skapa konto/i })).toBeInTheDocument()
  })
})
