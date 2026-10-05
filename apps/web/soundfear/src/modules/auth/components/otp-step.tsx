'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { env } from '@/config/env';
import { getErrorMessage } from '@/lib/api-error';
import { formatClock, useCountdown } from '../hooks/use-countdown';
import { useRequestOtp, useVerifyOtp } from '../hooks/use-auth-mutations';
import { MOCK_OTP } from '../services/auth.mock';
import { OTP_LENGTH, otpSchema } from '../schemas';
import type { OtpChallenge, OtpPurpose } from '../types';
import { StepHeader } from './step-header';
import { Button } from '@/shared/components/ui/button';
import { Alert } from '@/shared/components/ui/alert';
import { OtpInput } from '@/shared/components/ui/otp-input';

interface OtpStepProps {
   email: string;
   purpose: OtpPurpose;
   challenge: OtpChallenge;
   backLabel: string;
   onBack: () => void;
   onVerified: (ticket: string) => void;
}

/** Same OTP screen for registration and for forgot-password. */
export function OtpStep({
   email,
   purpose,
   challenge,
   backLabel,
   onBack,
   onVerified,
}: OtpStepProps) {
   const [code, setCode] = useState('');
   const [expiresInSeconds, setExpiresInSeconds] = useState(challenge.expiresInSeconds);
   const [resent, setResent] = useState(false);

   const verify = useVerifyOtp();
   const resend = useRequestOtp(purpose);
   const { remaining, restart } = useCountdown(challenge.resendAfterSeconds);

   const submit = (value: string) => {
      if (verify.isPending || !otpSchema.safeParse(value).success) return;
      verify.mutate(
         { email, otp: value, purpose },
         {
            onSuccess: ({ ticket }) => onVerified(ticket),
            onError: () => setCode(''),
         },
      );
   };

   const handleChange = (value: string) => {
      setCode(value);
      setResent(false);
      if (verify.isError) verify.reset();
   };

   const handleResend = () => {
      resend.mutate(
         { email },
         {
            onSuccess: (next) => {
               restart(next.resendAfterSeconds);
               setExpiresInSeconds(next.expiresInSeconds);
               setCode('');
               setResent(true);
               verify.reset();
            },
         },
      );
   };

   const errorMessage = verify.error ? getErrorMessage(verify.error) : null;

   return (
      <div className="space-y-6">
         <div className="space-y-5">
            <Button
               variant="ghost"
               size="sm"
               onClick={onBack}
               leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
               className="-ml-3"
            >
               {backLabel}
            </Button>
            <StepHeader
               title="Check your email"
               description={
                  <>
                     We sent a {OTP_LENGTH}-digit code to{' '}
                     <span className="break-all font-medium text-foreground">{email}</span>. It
                     expires in {Math.max(1, Math.round(expiresInSeconds / 60))} minutes.
                  </>
               }
            />
         </div>

         {env.authMock ? (
            <Alert variant="info">
               Demo mode: the code is <strong>{MOCK_OTP}</strong>.
            </Alert>
         ) : null}

         <form
            onSubmit={(event) => {
               event.preventDefault();
               submit(code);
            }}
            className="space-y-4"
            noValidate
         >
            <OtpInput
               value={code}
               onChange={handleChange}
               onComplete={submit}
               length={OTP_LENGTH}
               invalid={Boolean(errorMessage)}
               disabled={verify.isPending}
               autoFocus
            />
            {errorMessage ? <Alert>{errorMessage}</Alert> : null}
            {resent ? <Alert variant="success">A new code is on its way.</Alert> : null}
            {resend.error ? <Alert>{getErrorMessage(resend.error)}</Alert> : null}

            <Button
               type="submit"
               fullWidth
               loading={verify.isPending}
               disabled={code.length !== OTP_LENGTH}
            >
               Verify code
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t get it?{' '}
            {remaining > 0 ? (
               <span>Resend in {formatClock(remaining)}</span>
            ) : (
               <button
                  type="button"
                  onClick={handleResend}
                  disabled={resend.isPending}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-accent-strong disabled:opacity-60"
               >
                  {resend.isPending ? 'Sending…' : 'Resend code'}
               </button>
            )}
         </p>
      </div>
   );
}
