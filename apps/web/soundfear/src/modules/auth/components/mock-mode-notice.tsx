import { env } from '@/config/env';
import { MOCK_DEMO_EMAIL, MOCK_DEMO_PASSWORD, MOCK_OTP } from '../services/auth.mock';

/** Only rendered when NEXT_PUBLIC_AUTH_MOCK=true, so reviewers know the demo credentials. */
export function MockModeNotice() {
   if (!env.authMock) return null;
   return (
      <div className="mt-6 rounded-lg border border-dashed bg-surface px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
         <p className="font-medium text-foreground">Demo mode (no backend)</p>
         <p>
            Login: <code className="text-foreground">{MOCK_DEMO_EMAIL}</code> /{' '}
            <code className="text-foreground">{MOCK_DEMO_PASSWORD}</code>
         </p>
         <p>
            OTP code: <code className="text-foreground">{MOCK_OTP}</code>
         </p>
      </div>
   );
}
