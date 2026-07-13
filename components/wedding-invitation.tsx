'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { CalendarDays, Copy, Gift, Heart, MapPin, MessageCircle, Phone, Users, Volume2, VolumeX } from 'lucide-react'
import type { InvitationConfig } from '@/lib/db/schema'
import { submitResponse } from '@/app/actions/invitations'

const mediaUrl = (path: string) => `/api/media/file?pathname=${encodeURIComponent(path)}`

function OpeningMedia({ config }: { config: InvitationConfig }) {
  const animation = config.animation
  if (!animation?.mediaPath) return null

  const effect = animation.effect || 'float'
  const className = `invite-opening-media invite-opening-media-${effect} max-h-[42vh] max-w-[78%] rounded-3xl object-contain`
  const src = mediaUrl(animation.mediaPath)

  return <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8">
    {animation.mediaType === 'video'
      ? <video src={src} autoPlay muted loop playsInline className={`${className} bg-black/10 object-cover`} />
      : <img src={src} alt="" className={className} />}
  </div>
}

export function WeddingInvitation({ id, config: c }: { id: string; config: InvitationConfig }) {
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(true)
  const [left, setLeft] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = new Date(`${c.date}T${c.time}`).getTime() - Date.now()
      if (diff <= 0) return setLeft('Hari yang dinantikan telah tiba')
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor(diff / 3600000) % 24
      const mins = Math.floor(diff / 60000) % 60
      setLeft(`${days} hari · ${hours} jam · ${mins} minit`)
    }
    tick()
    const timer = setInterval(tick, 60000)
    return () => clearInterval(timer)
  }, [c.date, c.time])

  const dateLabel = new Date(c.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = new Date(c.date).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const addCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Majlis ${c.couple.bride} & ${c.couple.groom}`)}&dates=${c.date.replaceAll('-', '')}T${c.time.replace(':', '')}00/${c.date.replaceAll('-', '')}T160000&location=${encodeURIComponent(c.address)}`
  const mainStyle = { '--invite-primary': c.theme.primary, '--invite-bg': c.theme.background, '--invite-text': c.theme.text } as CSSProperties
  const gallery = c.gallery || []
  const photoPaths = Array.from(new Set([c.coverPath, ...gallery].filter(Boolean))) as string[]

  return <main className="mx-auto min-h-screen max-w-md overflow-hidden bg-card shadow-2xl" style={mainStyle}>
    {!open && <section className="fixed inset-0 isolate z-50 flex flex-col items-center justify-between overflow-hidden bg-[var(--invite-bg)] px-7 py-12 text-center text-[var(--invite-text)]">
      {c.coverPath && <><img src={mediaUrl(c.coverPath)} alt="Gambar pasangan" className="absolute inset-0 -z-20 size-full object-cover" /><div className="absolute inset-0 -z-10 bg-[var(--invite-bg)]/75" /></>}
      <div className="pointer-events-none absolute inset-x-10 top-24 z-0 h-56 rounded-full border border-current/10" />
      <div className="pointer-events-none absolute inset-x-16 bottom-24 z-0 h-40 rounded-full border border-[var(--invite-primary)]/20" />
      <OpeningMedia config={c} />
      <div className="relative z-20 text-xs uppercase tracking-[.35em]">Walimatulurus</div>
      <div className="relative z-20 flex flex-col items-center gap-5">
        <Heart className="size-8 text-[var(--invite-primary)]" />
        <p className="font-serif text-5xl leading-tight">{c.couple.bride}<span className="block text-3xl italic">&</span>{c.couple.groom}</p>
        <div className="h-px w-16 bg-[var(--invite-primary)]" />
        <p className="text-sm uppercase tracking-widest">{dateLabel}</p>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="relative z-20 inline-flex h-12 items-center justify-center rounded-full bg-[var(--invite-primary)] px-9 text-sm font-semibold uppercase tracking-[.28em] text-[var(--invite-bg)] shadow-lg transition hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--invite-primary)]">Buka</button>
    </section>}

    <div className="bg-[var(--invite-bg)] text-[var(--invite-text)]">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-7 py-16 text-center">{c.coverPath && <><img src={mediaUrl(c.coverPath)} alt="Gambar utama pasangan" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-[var(--invite-bg)]/80" /></>}<div className="relative z-10 flex flex-col items-center"><p className="text-xs uppercase tracking-[.35em]">Dengan izin Allah</p><h1 className="mt-8 font-serif text-5xl leading-tight">{c.couple.bride}<span className="block text-3xl italic text-[var(--invite-primary)]">&</span>{c.couple.groom}</h1><p className="mt-8 max-w-sm leading-relaxed opacity-75">{c.couple.tagline}</p><div className="mt-10 rounded-full border border-current/20 px-6 py-3 text-sm font-semibold">{left}</div></div></section>
      {(c.couple.brideParents || c.couple.groomParents) && <section className="bg-card px-7 py-16 text-center text-card-foreground"><p className="text-xs uppercase tracking-[.3em] text-primary">Dengan penuh hormat</p><h2 className="mt-3 font-serif text-4xl">Keluarga Mempelai</h2><div className="mt-8 grid gap-5"><div className="rounded-2xl border p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Ibu bapa pengantin perempuan</p><p className="mt-3 font-serif text-xl">{c.couple.brideParents || '-'}</p></div><div className="rounded-2xl border p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Ibu bapa pengantin lelaki</p><p className="mt-3 font-serif text-xl">{c.couple.groomParents || '-'}</p></div></div></section>}
      <section className="bg-card px-7 py-16 text-center text-card-foreground"><p className="text-xs uppercase tracking-[.3em] text-primary">Atur cara</p><h2 className="mt-3 font-serif text-4xl">Hari Bahagia</h2><div className="mt-8 rounded-3xl border p-7"><CalendarDays className="mx-auto size-6 text-primary" /><p className="mt-4 font-serif text-2xl">{fullDateLabel}</p><p className="mt-2 text-muted-foreground">{c.time} — 4:00 petang</p><div className="my-6 h-px bg-border" /><MapPin className="mx-auto size-6 text-primary" /><p className="mt-4 font-semibold">{c.venue}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.address}</p></div><div className="mt-5 grid grid-cols-3 gap-2"><a href={c.mapsUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 rounded-xl border p-3 text-xs"><MapPin className="size-5" />Peta</a><a href={`tel:${c.contact}`} className="flex flex-col items-center gap-2 rounded-xl border p-3 text-xs"><Phone className="size-5" />Hubungi</a><a href={addCalendar} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 rounded-xl border p-3 text-xs"><CalendarDays className="size-5" />Kalendar</a></div></section>
      <section className="px-7 py-16 text-center"><Heart className="mx-auto size-6 text-[var(--invite-primary)]" /><h2 className="mt-4 font-serif text-4xl">Doa & Restu</h2><p className="mt-5 leading-relaxed opacity-75">{c.message}</p></section>
      <section className="bg-card px-7 py-16 text-card-foreground"><div className="text-center"><Users className="mx-auto size-6 text-primary" /><h2 className="mt-4 font-serif text-4xl">RSVP</h2><p className="mt-2 text-sm text-muted-foreground">Mohon sahkan kehadiran anda.</p></div><form action={submitResponse.bind(null, id)} className="mt-8 flex flex-col gap-3"><input type="hidden" name="kind" value="rsvp" /><input required name="name" placeholder="Nama penuh" className="h-12 rounded-xl border px-4" /><input name="email" type="email" placeholder="Email" className="h-12 rounded-xl border px-4" /><select name="attendance" className="h-12 rounded-xl border px-4"><option value="hadir">Hadir, insya-Allah</option><option value="tidak">Tidak dapat hadir</option></select><input name="guests" type="number" min="1" max="10" defaultValue="1" className="h-12 rounded-xl border px-4" /><button className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground">Hantar RSVP</button></form></section>
      <section className="px-7 py-16"><div className="text-center"><MessageCircle className="mx-auto size-6 text-[var(--invite-primary)]" /><h2 className="mt-4 font-serif text-4xl">Buku Tetamu</h2></div><form action={submitResponse.bind(null, id)} className="mt-8 flex flex-col gap-3"><input type="hidden" name="kind" value="guestbook" /><input required name="name" placeholder="Nama anda" className="h-12 rounded-xl border border-current/20 bg-transparent px-4" /><textarea required name="message" placeholder="Titipkan ucapan dan doa" className="min-h-28 rounded-xl border border-current/20 bg-transparent p-4" /><button className="h-12 rounded-xl bg-[var(--invite-primary)] font-semibold text-card">Kirim ucapan</button></form></section>
      {photoPaths.length > 0 && <section className="bg-card px-7 py-16 text-card-foreground"><p className="text-center text-xs uppercase tracking-[.3em] text-primary">Kenangan</p><h2 className="mt-3 text-center font-serif text-4xl">Galeri Kami</h2><div className="mt-8 grid grid-cols-2 gap-3">{photoPaths.map((path, index) => <img key={path} src={mediaUrl(path)} alt={`Kenangan pasangan ${index + 1}`} className="aspect-[4/5] w-full rounded-2xl object-cover" />)}</div></section>}
      <section className="bg-card px-7 py-16 text-center text-card-foreground"><Gift className="mx-auto size-6 text-primary" /><h2 className="mt-4 font-serif text-4xl">Hadiah Kasih</h2><p className="mt-3 text-sm text-muted-foreground">Bagi yang ingin mengirim tanda kasih.</p><div className="mt-7 rounded-2xl border p-6"><p className="text-sm text-muted-foreground">{c.gift.bank}</p><p className="mt-2 font-mono text-xl font-semibold">{c.gift.accountNumber}</p><p className="mt-1 text-sm">{c.gift.accountName}</p><button type="button" onClick={() => navigator.clipboard.writeText(c.gift.accountNumber)} className="mx-auto mt-5 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><Copy className="size-4" />Salin nombor</button></div></section>
      <footer className="px-7 py-12 text-center"><Heart className="mx-auto size-5 text-[var(--invite-primary)]" fill="currentColor" /><p className="mt-4 font-serif text-2xl">Terima kasih</p><p className="mt-2 text-xs opacity-60">{c.couple.bride} & {c.couple.groom}</p></footer>
    </div>

    {c.musicPath && <audio key={String(muted)} src={mediaUrl(c.musicPath)} autoPlay={!muted} muted={muted} loop />}
    <button aria-label={muted ? 'Mainkan muzik' : 'Senyapkan muzik'} onClick={() => setMuted(!muted)} className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">{muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}</button>
  </main>
}
