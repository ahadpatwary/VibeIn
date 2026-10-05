'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { useCompleteRegistration } from '../hooks/use-auth-mutations';
import { useCompleteAuth } from '../hooks/use-complete-auth';
import type { OtpChallenge } from '../types';
import { NewPasswordForm } from './new-password-form';
import { OtpStep } from './otp-step';
import { RegisterEmailStep } from './register-email-step';
import { StepHeader, StepProgress } from './step-header';

type State =
   | { step: 'email'; email: string }
   | { step: 'otp'; email: string; challenge: OtpChallenge }
   | { step: 'password'; email: string; ticket: string };

/** Registration: 1) email  2) OTP  3) password + confirm password. */
export function RegisterFlow({ next }: { next?: string }) {
   const [state, setState] = useState<State>({ step: 'email', email: '' });
   const completeAuth = useCompleteAuth(next);
   const complete = useCompleteRegistration();

   return (
      <div key={state.step} className="animate-fade-up">
         {state.step === 'email' && (
            <RegisterEmailStep
               defaultEmail={state.email}
               next={next}
               onAuthenticated={completeAuth}
               onSent={(email, challenge) => setState({ step: 'otp', email, challenge })}
            />
         )}

         {state.step === 'otp' && (
            <div className="space-y-6">
               <StepProgress current={2} total={3} />
               <OtpStep
                  email={state.email}
                  purpose="register"
                  challenge={state.challenge}
                  backLabel="Use a different email"
                  onBack={() => setState({ step: 'email', email: state.email })}
                  onVerified={(ticket) =>
                     setState({ step: 'password', email: state.email, ticket })
                  }
               />
            </div>
         )}

         {state.step === 'password' && (
            <div className="space-y-6">
               <div className="space-y-5">
                  <StepProgress current={3} total={3} />
                  <StepHeader
                     title="Create your password"
                     description={
                        <>
                           Last step for{' '}
                           <span className="break-all font-medium text-foreground">
                              {state.email}
                           </span>
                           .
                        </>
                     }
                  />
               </div>
               <NewPasswordForm
                  submitLabel="Create account"
                  loading={complete.isPending}
                  error={complete.error ? getErrorMessage(complete.error) : null}
                  onSubmit={(password) =>
                     complete.mutate(
                        { ticket: state.ticket, password },
                        { onSuccess: completeAuth },
                     )
                  }
               />
            </div>
         )}
      </div>
   );
}
