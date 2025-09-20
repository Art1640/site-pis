import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    const customMessage = 'Chargement des données...'
    render(<LoadingSpinner message={customMessage} />)
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('has the correct CSS classes for styling', () => {
    render(<LoadingSpinner />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-scouts-green')
  })
})
