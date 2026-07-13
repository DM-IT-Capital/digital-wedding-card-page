import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InvitationEditor } from '@/components/invitation-editor'

export default async function EditorPage({ params }: { params: Promise<{id:string}> }) {
 const {id}=await params; const session=await auth.api.getSession({headers:await headers()}); const rows=await db.select().from(invitations).where(and(eq(invitations.id,id),eq(invitations.userId,session!.user.id))).limit(1); const card=rows[0]; if(!card) notFound(); const c=card.config
 return <main className="mx-auto max-w-6xl px-5 py-8"><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-4"><Link href="/dashboard" className="rounded-lg border p-2"><ArrowLeft className="size-4"/></Link><div><p className="text-sm text-muted-foreground">Editor jemputan</p><h1 className="font-serif text-3xl">{card.title}</h1></div></div></div><InvitationEditor id={id} slug={card.slug} status={card.status} title={card.title} config={c}/></main>
}
