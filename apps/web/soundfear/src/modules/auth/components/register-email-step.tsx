'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@/lib/api-error';
import { useRequestOtp } from '../hooks/use-auth-mutations';
import { authLink } from '../lib/redirect';
import { emailSchema, type EmailValues } from '../schemas';
import type { AuthSession, OtpChallenge } from '../types';
import { OAuthButtons } from './oauth-buttons';
import { StepHeader, StepProgress } from './step-header';
import { Divider } from '@/shared/components/ui/divider';
import { TextField } from '@/shared/components/ui/text-field';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface RegisterEmailStepProps {
   defaultEmail?: string;
   next?: string;
   onSent: (email: string, challenge: OtpChallenge) => void;
   onAuthenticated: (session: AuthSession) => void;
}

export function RegisterEmailStep({
   defaultEmail = '',
   next,
   onSent,
   onAuthenticated,
}: RegisterEmailStepProps) {
   const request = useRequestOtp('register');
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<EmailValues>({
      resolver: zodResolver(emailSchema),
      defaultValues: { email: defaultEmail },
      mode: 'onTouched',
   });

   const onSubmit = handleSubmit(({ email }: { email: string }) => {
      request.mutate({ email }, { onSuccess: (challenge) => onSent(email, challenge) });
   });

   return (
      <div className="space-y-6">
         <div className="space-y-5">
            <StepProgress current={1} total={3} />
            <StepHeader
               title="Create your account"
               description="Sign up with a provider or use your email address."
            />
         </div>

         <OAuthButtons
            mode="register"
            onAuthenticated={onAuthenticated}
            disabled={request.isPending}
         />

         <Divider>or with email</Divider>

         <form onSubmit={onSubmit} noValidate className="space-y-4">
            {request.error ? <Alert>{getErrorMessage(request.error)}</Alert> : null}
            <TextField
               label="Email"
               type="email"
               inputMode="email"
               autoComplete="email"
               placeholder="you@example.com"
               error={errors.email?.message}
               {...register('email')}
            />
            <Button type="submit" fullWidth loading={request.isPending}>
               Continue
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
               href={authLink('/login', next)}
               className="font-medium text-foreground underline underline-offset-4 hover:text-accent-strong"
            >
               Log in
            </Link>
         </p>
      </div>
   );
}
