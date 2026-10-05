import type { ReactNode } from 'react';
import { AuthShell } from '@/modules/auth';

export default function AuthLayout({ children }: { children: ReactNode }) {
   return <AuthShell>{children}</AuthShell>;
}
