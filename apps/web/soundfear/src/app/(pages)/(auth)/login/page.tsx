import type { Metadata } from 'next';
import { LoginFlow } from '@/modules/auth';
import { firstParam } from '@/modules/auth/lib/redirect';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage({
   searchParams,
}: {
   searchParams: { next?: string | string[] };
}) {
   return <LoginFlow next={firstParam(searchParams.next)} />;
}
