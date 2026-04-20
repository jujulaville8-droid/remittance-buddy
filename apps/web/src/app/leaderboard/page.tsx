import { Trophy } from 'lucide-react'

interface LeaderboardEntry {
  readonly rank: number
  readonly name: string
  readonly from: string
  readonly fromFlag: string
  readonly to: string
  readonly amountPhp: number
  readonly provider: string
  readonly providerSlug: string
}

// Seeded community leaderboard for the demo. In production this reads
// from a Supabase view backed by anonymized aggregates of opted-in users.
const ENTRIES: readonly LeaderboardEntry[] = [
  { rank: 1, name: 'Ate Maria',  from: 'Singapore', fromFlag: '🇸🇬', to: 'Manila',  amountPhp: 142800, provider: 'Wise',          providerSlug: 'wise' },
  { rank: 2, name: 'Kuya Ben',   from: 'Dubai',     fromFlag: '🇦🇪', to: 'Cebu',    amountPhp: 118400, provider: 'Remitly',       providerSlug: 'remitly' },
  { rank: 3, name: 'Lola Rosa',  from: 'London',    fromFlag: '🇬🇧', to: 'Davao',   amountPhp:  92200, provider: 'WorldRemit',    providerSlug: 'worldremit' },
  { rank: 4, name: 'Tito Noel',  from: 'Tokyo',     fromFlag: '🇯🇵', to: 'Iloilo',  amountPhp:  78900, provider: 'Instarem',      providerSlug: 'instarem' },
  { rank: 5, name: 'Ate Jen',    from: 'Hong Kong', fromFlag: '🇭🇰', to: 'Bacolod', amountPhp:  71200, provider: 'Remitly',       providerSlug: 'remitly' },
  { rank: 6, name: 'Kuya Randy', from: 'Sydney',    fromFlag: '🇦🇺', to: 'Baguio',  amountPhp:  65400, provider: 'Wise',          providerSlug: 'wise' },
  { rank: 7, name: 'Tita Susan', from: 'Riyadh',    fromFlag: '🇸🇦', to: 'Pangasinan', amountPhp: 58200, provider: 'MoneyGram',   providerSlug: 'moneygram' },
  { rank: 8, name: 'Paolo',      from: 'Toronto',   fromFlag: '🇨🇦', to: 'Quezon City', amountPhp: 52300, provider: 'Xoom',       providerSlug: 'xoom' },
  { rank: 9, name: 'Ate Liza',   from: 'New York',  fromFlag: '🇺🇸', to: 'Cavite',  amountPhp:  48700, provider: 'Remitly',       providerSlug: 'remitly' },
  { rank: 10, name: 'Jomar',     from: 'Milan',     fromFlag: '🇮🇹', to: 'Leyte',   amountPhp:  41900, provider: 'WorldRemit',    providerSlug: 'worldremit' },
]

function rankStyle(rank: number): string {
  if (rank === 1) return 'bg-[#E6A93A] text-[#5A3C06] border-[#E6A93A]' // gold
  if (rank === 2) return 'bg-[#C0C0C0]/30 text-foreground border-[#C0C0C0]/40' // silver
  if (rank === 3) return 'bg-[#CD7F32]/25 text-[#5A3C06] border-[#CD7F32]/40' // bronze
  return 'bg-muted text-muted-foreground border-border'
}

export default function LeaderboardPage() {
  const total = ENTRIES.reduce((s, e) => s + e.amountPhp, 0)

  return (
    <main className="min-h-screen bg-background pb-28 pt-8">
      <div className="container max-w-lg">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
            <Trophy className="h-3 w-3" />
            This week
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl leading-tight text-foreground">
            Top padala home.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Kabayans who sent the most this week, and which provider they used.
            All figures anonymised, opted in.
          </p>
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Community total this week
            </div>
            <div className="mt-1 font-display text-3xl text-coral tabular-nums">
              ₱{total.toLocaleString()}
            </div>
          </div>
        </header>

        <ul className="space-y-2">
          {ENTRIES.map((e) => (
            <li
              key={e.rank}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${rankStyle(e.rank)}`}
              >
                {e.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{e.name}</span>
                  <span className="text-base leading-none">{e.fromFlag}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                  {e.from} → {e.to} · <span className="font-medium text-foreground/80">{e.provider}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display text-lg text-foreground tabular-nums">
                  ₱{e.amountPhp.toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Numbers are self-reported by opted-in users. Join the leaderboard from Menu → Account.
        </p>
      </div>
    </main>
  )
}
