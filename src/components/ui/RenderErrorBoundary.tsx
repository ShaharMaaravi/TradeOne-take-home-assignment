import { Component } from 'react'
import type { ReactNode } from 'react'
import { RecoveryMessage } from './RecoveryMessage'

/** Retrying remounts the view, while the provider above keeps the user's session. */
export class RenderErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main tabIndex={-1} aria-label="שגיאת תצוגה">
          <RecoveryMessage
            title="לא ניתן להציג את המסך כרגע"
            description="אירעה שגיאה בתצוגה. אפשר לנסות לפתוח את המסך מחדש."
            onRetry={() => this.setState({ failed: false })}
          />
        </main>
      )
    return this.props.children
  }
}
