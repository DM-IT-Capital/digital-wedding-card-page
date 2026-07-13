import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const runtimeUrl = process.env.V0_RUNTIME_URL
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined
const baseURL = process.env.BETTER_AUTH_URL || productionUrl || vercelUrl || runtimeUrl

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [runtimeUrl, vercelUrl, productionUrl].filter(Boolean) as string[],
  emailAndPassword: { enabled: true, disableSignUp: false },
  advanced: process.env.NODE_ENV === 'development' ? { defaultCookieAttributes: { sameSite: 'none', secure: true } } : undefined,
})
