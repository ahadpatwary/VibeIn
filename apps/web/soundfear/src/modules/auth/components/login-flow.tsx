'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { useLoginWithTicket, useResetPassword } from '../hooks/use-auth-mutations';
import { useCompleteAuth } from '../hooks/use-complete-auth';
import type { OtpChallenge } from '../types';
import { LoginCredentialsStep } from './login-credentials-step';
import { NewPasswordForm } from './new-password-form';
import { OtpStep } from './otp-step';
import { StepHeader } from './step-header';
import { Button } from '@/shared/components/ui/button';

type State =
   | { step: 'credentials'; email: string }
   | { step: 'otp'; email: string; challenge: OtpChallenge }
   | { step: 'new-password'; email: string; ticket: string };

/** Login: 1) email + password (forgot link)  2) OTP  3) change password — skippable. */
export function LoginFlow({ next }: { next?: string }) {
   const [state, setState] = useState<State>({ step: 'credentials', email: '' });
   const completeAuth = useCompleteAuth(next);
   const reset = useResetPassword();
   const skip = useLoginWithTicket();

   return (
      <div key={state.step} className="animate-fade-up">
         {state.step === 'credentials' && (
            <LoginCredentialsStep
               defaultEmail={state.email}
               next={next}
               onAuthenticated={completeAuth}
               onForgot={(email, challenge) => setState({ step: 'otp', email, challenge })}
            />
         )}

         {state.step === 'otp' && (
            <OtpStep
               email={state.email}
               purpose="reset-password"
               challenge={state.challenge}
               backLabel="Back to log in"
               onBack={() => setState({ step: 'credentials', email: state.email })}
               onVerified={(ticket) =>
                  setState({ step: 'new-password', email: state.email, ticket })
               }
            />
         )}

         {state.step === 'new-password' && (
            <div className="space-y-6">
               <StepHeader
                  title="Set a new password"
                  description="Your email is verified. Choose a new password, or skip this step and keep your current one."
               />
               <NewPasswordForm
                  submitLabel="Update password"
                  loading={reset.isPending}
                  disabled={skip.isPending}
                  error={
                     reset.error || skip.error ? getErrorMessage(reset.error ?? skip.error) : null
                  }
                  onSubmit={(password) => {
                     skip.reset();
                     reset.mutate({ ticket: state.ticket, password }, { onSuccess: completeAuth });
                  }}
                  secondaryAction={
                     <Button
                        variant="ghost"
                        fullWidth
                        loading={skip.isPending}
                        disabled={reset.isPending}
                        onClick={() => {
                           reset.reset();
                           skip.mutate({ ticket: state.ticket }, { onSuccess: completeAuth });
                        }}
                     >
                        Skip for now
                     </Button>
                  }
               />
            </div>
         )}
      </div>
   );
}
