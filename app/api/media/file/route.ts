import { get } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations, media } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request:NextRequest){
 const pathname=request.nextUrl.searchParams.get('pathname'); if(!pathname)return new NextResponse('Missing file',{status:400})
 const rows=await db.select({status:invitations.status,userId:invitations.userId}).from(media).innerJoin(invitations,eq(media.invitationId,invitations.id)).where(eq(media.pathname,pathname)).limit(1)
 if(!rows[0])return new NextResponse('Not found',{status:404})
 const session=await auth.api.getSession({headers:await headers()}).catch(()=>null)
 const canView=rows[0].status==='published'||rows[0].userId===session?.user.id; if(!canView)return new NextResponse('Not found',{status:404})
 const result=await get(pathname,{access:'private',ifNoneMatch:request.headers.get('if-none-match')||undefined}); if(!result)return new NextResponse('Not found',{status:404})
 const cacheControl=rows[0].status==='published'?'public, max-age=0, must-revalidate':'private, max-age=0, must-revalidate'
 if(result.statusCode===304)return new NextResponse(null,{status:304,headers:{ETag:result.blob.etag,'Cache-Control':cacheControl}})
 return new NextResponse(result.stream,{headers:{'Content-Type':result.blob.contentType,ETag:result.blob.etag,'Cache-Control':cacheControl}})
}
