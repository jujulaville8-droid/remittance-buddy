import { auth } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId } = await auth()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">Welcome back, {userId}</p>
      {/* Transfer history, quick send, and AI assistant will be added in subsequent tasks */}
    </main>
  )
}
