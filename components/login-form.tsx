'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { LockKeyhole, Mail } from 'lucide-react'

export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('')
    const data = new FormData(e.currentTarget)
    const credentials = { email: String(data.get('email')), password: String(data.get('password')) }
    let result = await authClient.signIn.email(credentials)
    if (result.error) {
      const init = await fetch('/api/owner/init', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(credentials) })
      if (init.ok) result = await authClient.signIn.email(credentials)
    }
    if (result.error) { setError('Email atau kata laluan tidak sah.'); setBusy(false); return }
    router.push('/dashboard'); router.refresh()
  }
  return <form onSubmit={submit} className="flex w-full flex-col gap-5">
    <label className="flex flex-col gap-2 text-sm font-medium">Email<div className="flex items-center gap-3 rounded-xl border bg-card px-4"><Mail className="size-4 text-muted-foreground"/><input name="email" type="email" required className="h-12 flex-1 bg-transparent outline-none" /></div></label>
    <label className="flex flex-col gap-2 text-sm font-medium">Kata laluan<div className="flex items-center gap-3 rounded-xl border bg-card px-4"><LockKeyhole className="size-4 text-muted-foreground"/><input name="password" type="password" required className="h-12 flex-1 bg-transparent outline-none" /></div></label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <button disabled={busy} className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-50">{busy ? 'Menyemak...' : 'Log masuk'}</button>
  </form>
}
