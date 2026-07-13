'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Film, ImagePlus, Music2, Upload } from 'lucide-react'
import type { InvitationConfig } from '@/lib/db/schema'

const mediaUrl = (path: string) => `/api/media/file?pathname=${encodeURIComponent(path)}`
type MediaKind = 'cover' | 'gallery' | 'animation' | 'music'
type AnimationEffect = NonNullable<InvitationConfig['animation']>['effect']

const acceptedTypes: Record<MediaKind, string> = {
  cover: 'image/png,image/jpeg,image/webp',
  gallery: 'image/png,image/jpeg,image/webp',
  animation: 'image/png,image/jpeg,image/webp,video/mp4,video/webm',
  music: 'audio/mpeg,audio/mp4,audio/ogg',
}

export function MediaManager({ invitationId, config }: { invitationId: string; config: InvitationConfig }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [kind, setKind] = useState<MediaKind>('cover')
  const [effect, setEffect] = useState<AnimationEffect>(config.animation?.effect || 'float')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => setEffect(config.animation?.effect || 'float'), [config.animation?.effect])

  async function upload() {
    if (!file) { setMessage('Pilih fail dahulu.'); return }
    setBusy(true); setMessage('')
    const form = new FormData()
    form.set('invitationId', invitationId); form.set('kind', kind); form.set('animationEffect', effect); form.set('file', file)
    const response = await fetch('/api/media/upload', { method: 'POST', body: form })
    const result = await response.json().catch(() => ({ error: 'Muat naik gagal.' }))
    setBusy(false)
    if (!response.ok) { setMessage(result.error || 'Muat naik gagal.'); return }
    setMessage('Fail berjaya dimuat naik dan disimpan.'); setFile(null); if (fileRef.current) fileRef.current.value = ''; router.refresh()
  }

  const animationPath = config.animation?.mediaPath
  const gallery = config.gallery || []
  return <div className="flex flex-col gap-5">
    <div><div className="flex items-center gap-2"><ImagePlus className="size-4" /><h2 className="font-semibold">Media & animasi</h2></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Muat naik terus disimpan ke jemputan ini.</p></div>
    {config.coverPath && <img src={mediaUrl(config.coverPath)} alt="Pratonton gambar latar" className="aspect-[4/3] w-full rounded-xl object-cover" />}
    {animationPath && (config.animation?.mediaType === 'video' ? <video src={mediaUrl(animationPath)} muted playsInline controls className="aspect-video w-full rounded-xl bg-muted object-cover" /> : <img src={mediaUrl(animationPath)} alt="Pratonton watak animasi" className="aspect-square w-full rounded-xl bg-muted object-contain" />)}
    {gallery.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Galeri</p><div className="grid grid-cols-3 gap-2">{gallery.map((path, index) => <img key={path} src={mediaUrl(path)} alt={`Galeri ${index + 1}`} className="aspect-square rounded-lg object-cover" />)}</div></div>}
    <div className="flex flex-col gap-3">
      <select value={kind} onChange={event => { setKind(event.target.value as MediaKind); setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="cover">Gambar latar</option><option value="gallery">Gambar galeri</option><option value="animation">Watak animasi / video</option><option value="music">Muzik latar</option></select>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground"><Upload className="size-4" /><input ref={fileRef} type="file" accept={acceptedTypes[kind]} className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />{file?.name || 'Pilih gambar, video atau audio'}</label>
      <label className="flex flex-col gap-2 text-xs font-medium">Gerakan animasi<select name="animationEffect" value={effect} onChange={event => setEffect(event.target.value as AnimationEffect)} className="h-10 rounded-lg border bg-background px-3 text-sm font-normal"><option value="float">Terapung lembut</option><option value="fade">Muncul perlahan</option><option value="zoom">Zum masuk</option><option value="slide">Meluncur naik</option></select></label>
      <button type="button" onClick={upload} disabled={busy} className="h-10 rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground disabled:opacity-60">{busy ? 'Memuat naik...' : 'Muat naik & simpan'}</button>
      {message && <p role="status" className="text-xs text-primary">{message}</p>}
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Film className="size-3" />Imej 10 MB, video 25 MB</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Music2 className="size-3" />Video pendek MP4/WebM disyorkan</div>
  </div>
}
