import { db } from '@/lib/db'
import { invitations } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WeddingInvitation } from '@/components/wedding-invitation'

export const dynamic = 'force-dynamic'

export default async function InvitationPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params; const rows=await db.select().from(invitations).where(and(eq(invitations.slug,slug),eq(invitations.status,'published'))).limit(1); if(!rows[0])notFound();
 return <WeddingInvitation id={rows[0].id} config={rows[0].config}/>
}
