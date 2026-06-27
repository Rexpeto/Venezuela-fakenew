import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const claims = sqliteTable('claims', {
  id: text('id').primaryKey(),
  claimText: text('claim_text').notNull(),
  context: text('context'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  claimId: text('claim_id').notNull().references(() => claims.id),
  verdict: text('verdict', { enum: ['verdadero', 'falso', 'dudoso'] }).notNull(),
  confidence: real('confidence').notNull(),
  explanation: text('explanation').notNull(),
  patternsDetected: text('patterns_detected', { mode: 'json' }).$type<string[]>(),
  sources: text('sources', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
})

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  lastChecked: integer('last_checked', { mode: 'timestamp' }),
})
