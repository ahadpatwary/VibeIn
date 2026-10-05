import type { Metadata } from 'next';
import { RegisterFlow } from '@/modules/auth';
import { firstParam } from '@/modules/auth/lib/redirect';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage({
   searchParams,
}: {
   searchParams: { next?: string | string[] };
}) {
   return <RegisterFlow next={firstParam(searchParams.next)} />;
}
