import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { RenderErrorBoundary } from './RenderErrorBoundary'

it('shows an accessible fallback and retries a transient render failure', () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  let fail = true
  function View() {
    if (fail) throw new Error('Test render failure')
    return <p>Recovered view</p>
  }
  try {
    render(
      <RenderErrorBoundary>
        <View />
      </RenderErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('לא ניתן להציג')
    fail = false
    fireEvent.click(screen.getByRole('button', { name: 'נסה שוב' }))
    expect(screen.getByText('Recovered view')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  } finally {
    report.mockRestore()
  }
})
