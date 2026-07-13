import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, LayoutGrid } from 'lucide-react'
import { signOut } from '@/app/actions/invitations'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) redirect('/login')
  return <div className="min-h-screen bg-background"><header className="border-b bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="flex items-center gap-3 font-serif text-xl"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Heart className="size-4" fill="currentColor"/></span>Ruang Kasih</Link><nav className="flex items-center gap-3"><Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground"><LayoutGrid className="size-4"/>Jemputan</Link><form action={signOut}><button className="rounded-lg border px-3 py-2 text-sm">Log keluar</button></form></nav></div></header>{children}</div>
}
