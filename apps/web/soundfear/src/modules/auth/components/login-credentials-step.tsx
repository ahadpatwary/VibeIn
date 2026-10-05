'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@/lib/api-error';
import { useLogin, useRequestOtp } from '../hooks/use-auth-mutations';
import { authLink } from '../lib/redirect';
import { emailSchema, loginSchema, type LoginValues } from '../schemas';
import type { AuthSession, OtpChallenge } from '../types';
import { OAuthButtons } from './oauth-buttons';
import { StepHeader } from './step-header';
import { Divider } from '@/shared/components/ui/divider';
import { TextField } from '@/shared/components/ui/text-field';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { PasswordField } from '@/shared/components/ui/password-field';

interface LoginCredentialsStepProps {
   defaultEmail?: string;
   next?: string;
   onForgot: (email: string, challenge: OtpChallenge) => void;
   onAuthenticated: (session: AuthSession) => void;
}

export function LoginCredentialsStep({
   defaultEmail = '',
   next,
   onForgot,
   onAuthenticated,
}: LoginCredentialsStepProps) {
   const login = useLogin();
   const forgot = useRequestOtp('reset-password');

   const {
      register,
      handleSubmit,
      getValues,
      setError,
      setFocus,
      formState: { errors },
   } = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: defaultEmail, password: '' },
      mode: 'onTouched',
   });

   const onSubmit = handleSubmit((values: any) => {
      forgot.reset();
      login.mutate(values, { onSuccess: onAuthenticated });
   });

   const handleForgot = () => {
      login.reset();
      const raw = getValues('email').trim();
      const parsed = emailSchema.safeParse({ email: raw });
      if (!parsed.success) {
         setError('email', {
            message: raw
               ? 'Enter a valid email address'
               : 'Enter your email first, then choose “Forgot password?”',
         });
         setFocus('email');
         return;
      }
      const { email } = parsed.data;
      forgot.mutate({ email }, { onSuccess: (challenge) => onForgot(email, challenge) });
   };

   const serverError = login.error ?? forgot.error;
   const busy = login.isPending || forgot.isPending;

   return (
      <div className="space-y-6">
         <StepHeader
            title="Welcome back"
            description="Log in with a provider or with your email and password."
         />

         <OAuthButtons mode="login" onAuthenticated={onAuthenticated} disabled={busy} />

         <Divider>or with email</Divider>

         <form onSubmit={onSubmit} noValidate className="space-y-4">
            {serverError ? <Alert>{getErrorMessage(serverError)}</Alert> : null}
            <TextField
               label="Email"
               type="email"
               inputMode="email"
               autoComplete="email"
               placeholder="you@example.com"
               error={errors.email?.message}
               {...register('email')}
            />
            <PasswordField
               label="Password"
               autoComplete="current-password"
               placeholder="Your password"
               error={errors.password?.message}
               labelAction={
                  <button
                     type="button"
                     onClick={handleForgot}
                     disabled={busy}
                     className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
                  >
                     {forgot.isPending ? 'Sending code…' : 'Forgot password?'}
                  </button>
               }
               {...register('password')}
            />
            <Button type="submit" fullWidth loading={login.isPending} disabled={forgot.isPending}>
               Log in
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link
               href={authLink('/register', next)}
               className="font-medium text-foreground underline underline-offset-4 hover:text-accent-strong"
            >
               Create an account
            </Link>
         </p>
      </div>
   );
}
