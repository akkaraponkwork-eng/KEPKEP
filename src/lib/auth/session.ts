import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Shared env validation
function getRawKey(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable must be set in production');
  }
  return process.env.ENCRYPTION_KEY || 'development_fallback_key_that_is_32_bytes_long_1234';
}

function getJwtKey(): Uint8Array {
  const secretKey = getRawKey();
  return new TextEncoder().encode(secretKey);
}

export async function encryptSession(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtKey());
}

export async function decryptSession(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, getJwtKey(), {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function createSession(adminId: number, email: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encryptSession({ adminId, email, expires });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return await decryptSession(session);
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}


