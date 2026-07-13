import { LoginForm } from '@/components/login-form'
import { Heart } from 'lucide-react'

export default function LoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background p-5"><section className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-sm"><div className="mb-8 flex flex-col items-center gap-3 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Heart className="size-5" fill="currentColor"/></span><div><p className="font-serif text-3xl">Ruang Kasih</p><p className="mt-2 text-sm text-muted-foreground">Portal pemilik jemputan digital</p></div></div><LoginForm/><p className="mt-6 text-center text-xs text-muted-foreground">Akses terhad kepada pemilik. Pendaftaran awam tidak tersedia.</p></section></main>
}
