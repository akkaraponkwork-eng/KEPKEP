import { th } from './th';
import { en } from './en';
import { cookies } from 'next/headers';

export type Locale = 'th' | 'en';

export const dictionaries = {
  th,
  en,
};

export async function getDictionary() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'th') as Locale;
  return {
    dict: dictionaries[locale] || dictionaries.th,
    locale
  };
}
