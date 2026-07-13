'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, Save } from 'lucide-react'
import { updateInvitation, type UpdateInvitationState } from '@/app/actions/invitations'
import type { InvitationConfig } from '@/lib/db/schema'
import { MediaManager } from '@/components/media-manager'

const Field = ({ label, name, value, type = 'text' }: { label: string; name: string; value: string; type?: string }) => <label className="flex flex-col gap-2 text-sm font-medium">{label}<input name={name} type={type} defaultValue={value} required={['title','bride','groom','date','time'].includes(name)} className="h-11 rounded-xl border bg-background px-3 font-normal" /></label>

function SaveButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60"><Save className="size-4" />{pending ? 'Menyimpan...' : 'Simpan perubahan'}</button>
}

export function InvitationEditor({ id, slug, status, title, config: c }: { id: string; slug: string; status: string; title: string; config: InvitationConfig }) {
  const initial: UpdateInvitationState = { status: 'idle' }
  const [state, action] = useActionState(updateInvitation.bind(null, id), initial)
  return <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 font-serif text-2xl">Kisah pasangan</h2><div className="grid gap-4 md:grid-cols-2"><Field label="Nama jemputan" name="title" value={title} /><Field label="Nama pengantin perempuan" name="bride" value={c.couple.bride} /><Field label="Nama pengantin lelaki" name="groom" value={c.couple.groom} /><label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">Ayat pembuka<textarea name="tagline" defaultValue={c.couple.tagline} className="min-h-24 rounded-xl border bg-background p-3 font-normal" /></label></div></section>
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 font-serif text-2xl">Majlis</h2><div className="grid gap-4 md:grid-cols-2"><Field label="Tarikh" name="date" value={c.date} type="date" /><Field label="Masa" name="time" value={c.time} type="time" /><Field label="Lokasi" name="venue" value={c.venue} /><Field label="No. telefon" name="contact" value={c.contact} /><Field label="Alamat" name="address" value={c.address} /><Field label="Pautan Google Maps" name="mapsUrl" value={c.mapsUrl} /><label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">Pesanan tetamu<textarea name="message" defaultValue={c.message} className="min-h-24 rounded-xl border bg-background p-3 font-normal" /></label></div></section>
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 font-serif text-2xl">Hadiah tunai</h2><div className="grid gap-4 md:grid-cols-3"><Field label="Bank" name="bank" value={c.gift.bank} /><Field label="Nama akaun" name="accountName" value={c.gift.accountName} /><Field label="Nombor akaun" name="accountNumber" value={c.gift.accountNumber} /></div></section>
    </div>
    <aside className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 font-serif text-xl">Tema warna</h2><div className="flex flex-col gap-4"><Field label="Warna utama" name="primary" value={c.theme.primary} type="color" /><Field label="Latar" name="background" value={c.theme.background} type="color" /><Field label="Teks" name="text" value={c.theme.text} type="color" /></div></section>
      <section className="rounded-2xl border bg-card p-6"><MediaManager invitationId={id} config={c} /></section>
      <SaveButton />
      {state.status === 'success' && <p role="status" className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary"><CheckCircle2 className="size-4" />Perubahan berjaya disimpan.</p>}
      {state.status === 'error' && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>}
      {status === 'published' && <Link href={`/i/${slug}`} target="_blank" className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium">Lihat jemputan <ExternalLink className="size-4" /></Link>}
    </aside>
  </form>
}
