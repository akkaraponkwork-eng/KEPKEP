import { pgTable, serial, text, timestamp, varchar, integer, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  lineId: varchar('line_id', { length: 255 }).unique(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  pictureUrl: text('picture_url'),
  displayName: varchar('display_name', { length: 255 }),
  workspaceName: varchar('workspace_name', { length: 255 }),
  driveRootFolder: varchar('drive_root_folder', { length: 255 }),
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const oauthTokens = pgTable('oauth_tokens', {
  adminId: integer('admin_id').primaryKey().references(() => admins.id),
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  scopes: text('scopes').notNull(),
  keyVersion: varchar('key_version', { length: 50 }).notNull().default('v1'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  lineGroupId: varchar('line_group_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('initializing'), // initializing, active, degraded, token_expired, folder_missing, suspended
  driveFolderId: varchar('drive_folder_id', { length: 255 }),
  color: varchar('color', { length: 50 }).notNull().default('blue'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupAdmins = pgTable('group_admins', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
  adminId: integer('admin_id').references(() => admins.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
  lineMessageId: varchar('line_message_id', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('received'), // received, processing, stored, failed, deleted
  driveFileId: varchar('drive_file_id', { length: 255 }),
  originalFilename: varchar('original_filename', { length: 255 }),
  mimeType: varchar('mime_type', { length: 255 }),
  sizeBytes: integer('size_bytes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  fileId: integer('file_id').references(() => files.id).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('queued'), // queued, processing, retry_wait, blocked, completed, failed, dead_letter
  attempts: integer('attempts').notNull().default(0),
  nextRetryAt: timestamp('next_retry_at'),
  heartbeatAt: timestamp('heartbeat_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  contact: varchar('contact', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('new'), // new, read, resolved
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
