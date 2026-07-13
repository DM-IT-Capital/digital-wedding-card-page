import { auth } from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (!process.env.OWNER_EMAIL || !process.env.OWNER_PASSWORD || body.email !== process.env.OWNER_EMAIL || body.password !== process.env.OWNER_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  try {
    await auth.api.signUpEmail({ body: { email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD, name: 'Pemilik' } })
  } catch { /* Account already exists. */ }
  return NextResponse.json({ ok: true })
}
