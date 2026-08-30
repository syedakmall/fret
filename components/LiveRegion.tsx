'use client'

export function LiveRegion({ message }: { message: string }) {
  return (
    <div className="sr-only-live" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  )
}
