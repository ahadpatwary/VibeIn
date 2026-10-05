'use client';

import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newPasswordSchema, type NewPasswordValues } from '../schemas';
import { PasswordChecklist } from './password-checklist';
import { PasswordField } from '@/shared/components/ui/password-field';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface NewPasswordFormProps {
   submitLabel: string;
   onSubmit: (password: string) => void;
   loading?: boolean;
   /** Disables the submit button while something else (e.g. "skip") is in flight. */
   disabled?: boolean;
   error?: string | null;
   secondaryAction?: ReactNode;
}

/** Password + confirm password. Shared by registration (step 3) and password reset. */
export function NewPasswordForm({
   submitLabel,
   onSubmit,
   loading,
   disabled,
   error,
   secondaryAction,
}: NewPasswordFormProps) {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<NewPasswordValues>({
      resolver: zodResolver(newPasswordSchema),
      defaultValues: { password: '', confirmPassword: '' },
      mode: 'onTouched',
   });

   const password = watch('password');

   return (
      <form
         onSubmit={handleSubmit((values: any) => onSubmit(values.password))}
         noValidate
         className="space-y-4"
      >
         {error ? <Alert>{error}</Alert> : null}

         <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
         />
         <PasswordChecklist value={password} />
         <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
         />

         <Button type="submit" fullWidth loading={loading} disabled={disabled}>
            {submitLabel}
         </Button>
         {secondaryAction}
      </form>
   );
}
