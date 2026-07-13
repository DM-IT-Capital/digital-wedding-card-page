import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false), image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const session = pgTable('session', {
  id: text('id').primaryKey(), expiresAt: timestamp('expiresAt').notNull(), token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})
export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }), accessToken: text('accessToken'),
  refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type InvitationConfig = {
  couple: { bride: string; groom: string; tagline: string; brideParents?: string; groomParents?: string }
  date: string; time: string; venue: string; address: string; mapsUrl: string; contact: string
  message: string; theme: { primary: string; background: string; text: string }
  coverPath?: string; musicPath?: string; gallery: string[]
  animation?: { mediaPath?: string; mediaType?: 'image' | 'video'; effect: 'fade' | 'float' | 'zoom' | 'slide' }
  gift: { bank: string; accountName: string; accountNumber: string }
}
export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(), userId: text('userId').notNull(), slug: text('slug').notNull().unique(),
  title: text('title').notNull(), status: text('status').notNull().default('draft'), config: jsonb('config').$type<InvitationConfig>().notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const responses = pgTable('responses', {
  id: serial('id').primaryKey(), invitationId: text('invitationId').notNull(), kind: text('kind').notNull(), name: text('name').notNull(),
  email: text('email'), attendance: text('attendance'), guests: integer('guests').default(1), message: text('message'),
  approved: boolean('approved').notNull().default(false), createdAt: timestamp('createdAt').notNull().defaultNow(),
})
export const media = pgTable('media', {
  id: serial('id').primaryKey(), invitationId: text('invitationId').notNull(), userId: text('userId').notNull(),
  kind: text('kind').notNull(), pathname: text('pathname').notNull().unique(), alt: text('alt'), createdAt: timestamp('createdAt').notNull().defaultNow(),
})
