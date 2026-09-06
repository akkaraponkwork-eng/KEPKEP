'use server';

import { cookies } from 'next/headers';
import { Locale } from '@/i18n/getDictionary';

export async function setLanguage(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'lax',
  });
}
