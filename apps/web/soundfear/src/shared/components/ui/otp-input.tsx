'use client';

import {
   useEffect,
   useRef,
   type ChangeEvent,
   type ClipboardEvent,
   type FocusEvent,
   type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/cn';

interface OtpInputProps {
   value: string;
   onChange: (value: string) => void;
   /** Fired once when the last digit is entered or pasted. */
   onComplete?: (value: string) => void;
   length?: number;
   disabled?: boolean;
   invalid?: boolean;
   autoFocus?: boolean;
   'aria-describedby'?: string;
}

export function OtpInput({
   value,
   onChange,
   onComplete,
   length = 6,
   disabled,
   invalid,
   autoFocus,
   'aria-describedby': describedBy,
}: OtpInputProps) {
   const refs = useRef<Array<HTMLInputElement | null>>([]);
   const hadValue = useRef(false);

   useEffect(() => {
      if (autoFocus) refs.current[0]?.focus();
   }, [autoFocus]);

   // After the parent clears the code (wrong code, resend) put the cursor back at the start.
   useEffect(() => {
      if (value.length === 0 && hadValue.current) refs.current[0]?.focus();
      hadValue.current = value.length > 0;
   }, [value]);

   const focusAt = (index: number) => {
      refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
   };

   const commit = (next: string, focusIndex: number) => {
      const clean = next.slice(0, length);
      onChange(clean);
      focusAt(focusIndex);
      if (clean.length === length) onComplete?.(clean);
   };

   const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '');
      if (!digits) return; // deletions are handled in onKeyDown
      const start = Math.min(index, value.length);
      commit(value.slice(0, start) + digits, Math.min(start + digits.length, length - 1));
   };

   const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
         case 'Backspace':
            event.preventDefault();
            if (value[index]) {
               onChange(value.slice(0, index) + value.slice(index + 1));
            } else if (index > 0) {
               onChange(value.slice(0, index - 1) + value.slice(index));
               focusAt(index - 1);
            }
            break;
         case 'Delete':
            event.preventDefault();
            if (value[index]) onChange(value.slice(0, index) + value.slice(index + 1));
            break;
         case 'ArrowLeft':
            event.preventDefault();
            focusAt(index - 1);
            break;
         case 'ArrowRight':
            event.preventDefault();
            focusAt(index + 1);
            break;
      }
   };

   const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (!digits) return;
      commit(digits, Math.min(digits.length, length - 1));
   };

   const selectAll = (event: FocusEvent<HTMLInputElement>) => event.target.select();

   return (
      <div
         role="group"
         aria-label="One-time code"
         aria-describedby={describedBy}
         className="flex gap-2 sm:gap-3"
      >
         {Array.from({ length }, (_, index) => (
            <input
               key={index}
               ref={(el) => {
                  refs.current[index] = el;
               }}
               type="text"
               inputMode="numeric"
               pattern="[0-9]*"
               autoComplete={index === 0 ? 'one-time-code' : 'off'}
               aria-label={`Digit ${index + 1} of ${length}`}
               aria-invalid={invalid || undefined}
               disabled={disabled}
               value={value[index] ?? ''}
               onChange={(event) => handleChange(index, event)}
               onKeyDown={(event) => handleKeyDown(index, event)}
               onPaste={handlePaste}
               onFocus={selectAll}
               onClick={(event) => event.currentTarget.select()}
               className={cn(
                  'h-12 min-w-0 flex-1 rounded-lg border bg-surface text-center text-lg font-semibold text-foreground sm:h-14',
                  'transition-colors hover:border-ink-muted',
                  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  invalid &&
                     'border-danger hover:border-danger focus:border-danger focus:ring-danger/25',
               )}
            />
         ))}
      </div>
   );
}
