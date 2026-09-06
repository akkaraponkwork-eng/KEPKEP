import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy init — defers neon() until first use so build-time page-data
// collection doesn't fail when DATABASE_URL is absent in Docker build.
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return drizzle(neon(url), { schema });
}

let _db: ReturnType<typeof getDb> | undefined;
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_t, prop) {
    if (!_db) _db = getDb();
    return (_db as any)[prop];
  },
});

import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NeonHttpQueryResultHKT } from 'drizzle-orm/neon-http';

export type Transaction = PgTransaction<NeonHttpQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

export async function withTransaction<T>(
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}
