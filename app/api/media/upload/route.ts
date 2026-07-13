import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations, media, type InvitationConfig } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

type MediaKind = 'cover' | 'gallery' | 'animation' | 'music'
type AnimationEffect = NonNullable<InvitationConfig['animation']>['effect']

const imageLimit = 10 * 1024 * 1024
const videoLimit = 25 * 1024 * 1024
const audioLimit = 10 * 1024 * 1024

function getKind(value: FormDataEntryValue | null): MediaKind {
 const kind = String(value || 'gallery')
 return kind === 'cover' || kind === 'gallery' || kind === 'animation' || kind === 'music' ? kind : 'gallery'
}

function getAnimationEffect(value: FormDataEntryValue | null): AnimationEffect {
 const effect = String(value || 'float')
 return effect === 'fade' || effect === 'zoom' || effect === 'slide' || effect === 'float' ? effect : 'float'
}

export async function POST(request: Request) {
 const session=await auth.api.getSession({headers:await headers()}); if(!session?.user)return NextResponse.json({error:'Unauthorized'},{status:401})
 const form=await request.formData(); const file=form.get('file'); const invitationId=String(form.get('invitationId')); const kind=getKind(form.get('kind'))
 if(!(file instanceof File)||file.size===0)return NextResponse.json({error:'Invalid file'},{status:400})
 const isImage=file.type.startsWith('image/'); const isVideo=file.type.startsWith('video/'); const isAudio=file.type.startsWith('audio/')
 const allowed=kind==='music'?isAudio:kind==='animation'?isImage||isVideo:isImage; if(!allowed)return NextResponse.json({error:'Unsupported file'},{status:400})
 const limit=kind==='animation'&&isVideo?videoLimit:kind==='music'?audioLimit:imageLimit; if(file.size>limit)return NextResponse.json({error:'File too large'},{status:400})
 const rows=await db.select().from(invitations).where(and(eq(invitations.id,invitationId),eq(invitations.userId,session.user.id))).limit(1); if(!rows[0])return NextResponse.json({error:'Not found'},{status:404})
 const blob=await put(`invitations/${invitationId}/${crypto.randomUUID()}-${file.name}`,file,{access:'private'}); await db.insert(media).values({invitationId,userId:session.user.id,kind,pathname:blob.pathname,alt:file.name})
 const config: InvitationConfig={...rows[0].config,gallery:Array.isArray(rows[0].config.gallery)?rows[0].config.gallery:[]}
 if(kind==='cover')config.coverPath=blob.pathname; else if(kind==='music')config.musicPath=blob.pathname; else if(kind==='animation')config.animation={...(config.animation||{effect:'float'}),mediaPath:blob.pathname,mediaType:isVideo?'video':'image',effect:getAnimationEffect(form.get('animationEffect'))}; else config.gallery=[...config.gallery,blob.pathname]
 await db.update(invitations).set({config,updatedAt:new Date()}).where(and(eq(invitations.id,invitationId),eq(invitations.userId,session.user.id)))
 revalidatePath(`/dashboard/${invitationId}`); revalidatePath(`/i/${rows[0].slug}`)
 return NextResponse.json({ok:true,kind,pathname:blob.pathname,config})
}
