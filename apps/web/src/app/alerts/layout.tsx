export default function AlertsLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container max-w-lg pt-5 pb-24">{children}</div>
    </main>
  )
}
