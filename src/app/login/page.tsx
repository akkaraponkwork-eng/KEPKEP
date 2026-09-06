import { getDictionary } from '@/i18n/getDictionary';
import LoginForm from './LoginForm';

export default async function LoginPage(props: { searchParams: Promise<{ connect?: string }> }) {
  const { dict, locale } = await getDictionary();
  const searchParams = await props.searchParams;
  const connect = searchParams?.connect;

  return <LoginForm dict={dict.login} currentLocale={locale} connect={connect} />;
}
