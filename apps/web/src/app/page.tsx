import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Remittance Buddy</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          AI-powered international money transfers. Fast, transparent, and secure.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/sign-up"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/sign-in"
          className="border-border bg-background hover:bg-accent rounded-md border px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
