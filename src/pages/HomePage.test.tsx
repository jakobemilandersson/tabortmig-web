import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

test('renders the app heading', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
  expect(screen.getByRole('heading', { name: /tabortmig/i })).toBeInTheDocument()
})
