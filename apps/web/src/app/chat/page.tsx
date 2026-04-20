import { MessageCircle } from 'lucide-react'

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-lg pt-20 pb-24 flex flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-coral/10 text-coral">
          <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 font-display text-2xl sm:text-3xl text-foreground">
          Chat support
        </h1>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          Coming soon.
        </p>
      </div>
    </main>
  )
}
