'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations, responses, type InvitationConfig } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type UpdateInvitationState = { status: 'idle' | 'success' | 'error'; message?: string }

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function getAnimationEffect(value: FormDataEntryValue | null, fallback: NonNullable<InvitationConfig['animation']>['effect']) {
  const effect = String(value || fallback)
  return effect === 'fade' || effect === 'zoom' || effect === 'slide' || effect === 'float' ? effect : fallback
}

const defaultConfig: InvitationConfig = {
  couple: { bride: 'Alya', groom: 'Rayyan', tagline: 'Dengan penuh kesyukuran, kami menjemput anda meraikan cinta kami.' },
  date: '2026-12-12', time: '11:00', venue: 'Dewan Seri Kasih', address: 'Kuala Lumpur, Malaysia',
  mapsUrl: 'https://maps.google.com', contact: '+60123456789', message: 'Kehadiran dan doa restu anda amat bermakna buat kami.',
  theme: { primary: '#6f7d59', background: '#f5f0e6', text: '#283128' }, gallery: [], animation: { effect: 'float' },
  gift: { bank: 'Maybank', accountName: 'Alya Binti Ahmad', accountNumber: '1234567890' },
}

export async function createInvitation(formData: FormData) {
  const userId = await getUserId()
  const title = String(formData.get('title') || 'Majlis Perkahwinan').slice(0, 100)
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'jemputan'}-${crypto.randomUUID().slice(0, 5)}`
  const id = crypto.randomUUID()
  await db.insert(invitations).values({ id, userId, slug, title, status: 'draft', config: defaultConfig })
  redirect(`/dashboard/${id}`)
}

export async function updateInvitation(id: string, _state: UpdateInvitationState, formData: FormData): Promise<UpdateInvitationState> {
  try {
    const userId = await getUserId()
    const current = await db.select().from(invitations).where(and(eq(invitations.id, id), eq(invitations.userId, userId))).limit(1)
    if (!current[0]) throw new Error('Not found')
    const old = current[0].config
    const previousAnimation = old.animation || { effect: 'float' as const }
    const config: InvitationConfig = {
      ...old,
      couple: { bride: String(formData.get('bride') || ''), groom: String(formData.get('groom') || ''), tagline: String(formData.get('tagline') || '') },
      date: String(formData.get('date') || ''), time: String(formData.get('time') || ''), venue: String(formData.get('venue') || ''),
      address: String(formData.get('address') || ''), mapsUrl: String(formData.get('mapsUrl') || ''), contact: String(formData.get('contact') || ''),
      message: String(formData.get('message') || ''),
      theme: { primary: String(formData.get('primary') || '#6f7d59'), background: String(formData.get('background') || '#f5f0e6'), text: String(formData.get('text') || '#283128') },
      animation: { ...previousAnimation, effect: getAnimationEffect(formData.get('animationEffect'), previousAnimation.effect) },
      gift: { bank: String(formData.get('bank') || ''), accountName: String(formData.get('accountName') || ''), accountNumber: String(formData.get('accountNumber') || '') },
    }
    await db.update(invitations).set({ title: String(formData.get('title') || current[0].title), config, updatedAt: new Date() }).where(and(eq(invitations.id, id), eq(invitations.userId, userId)))
    revalidatePath(`/dashboard/${id}`); revalidatePath(`/i/${current[0].slug}`)
    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Perubahan gagal disimpan.' }
  }
}

export async function setPublish(id: string, publish: boolean) {
  const userId = await getUserId()
  await db.update(invitations).set({ status: publish ? 'published' : 'draft', updatedAt: new Date() }).where(and(eq(invitations.id, id), eq(invitations.userId, userId)))
  revalidatePath('/dashboard')
}

export async function submitResponse(invitationId: string, formData: FormData) {
  const kind = String(formData.get('kind')) === 'guestbook' ? 'guestbook' : 'rsvp'
  const name = String(formData.get('name') || '').trim().slice(0, 80)
  if (!name) return
  await db.insert(responses).values({ invitationId, kind, name, email: String(formData.get('email') || '').slice(0, 120), attendance: String(formData.get('attendance') || ''), guests: Math.min(10, Math.max(1, Number(formData.get('guests')) || 1)), message: String(formData.get('message') || '').slice(0, 500), approved: kind === 'rsvp' })
  revalidatePath('/')
}

export async function signOut() { await auth.api.signOut({ headers: await headers() }); redirect('/login') }
