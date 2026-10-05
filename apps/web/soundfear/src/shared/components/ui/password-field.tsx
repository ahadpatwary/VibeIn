'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField, TextFieldProps } from './text-field';

export const PasswordField = forwardRef<
   HTMLInputElement,
   Omit<TextFieldProps, 'type' | 'endAdornment'>
>(function PasswordField(props, ref) {
   const [visible, setVisible] = useState(false);

   return (
      <TextField
         ref={ref}
         {...props}
         type={visible ? 'text' : 'password'}
         endAdornment={
            <button
               type="button"
               onClick={() => setVisible((v) => !v)}
               aria-label={visible ? 'Hide password' : 'Show password'}
               aria-pressed={visible}
               className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-foreground"
            >
               {visible ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
               ) : (
                  <Eye className="h-4 w-4" aria-hidden />
               )}
            </button>
         }
      />
   );
});
