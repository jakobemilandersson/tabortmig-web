export interface AuthFormProps {
  mode: 'signUp' | 'signIn'
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string
  loading?: boolean
}

export function AuthForm({ mode, onSubmit, error, loading = false }: AuthFormProps) {
  // Uncontrolled inputs: values are read from the DOM on submit rather than
  // held in React state. This keeps the component free of unnecessary
  // re-renders; RTL's fireEvent.change sets the DOM .value correctly in tests.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    await onSubmit(email, password)
  }

  const submitLabel = mode === 'signUp' ? 'Skapa konto' : 'Logga in'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Lösenord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          required
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Laddar…' : submitLabel}
      </button>
    </form>
  )
}
