import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PASSWORD_RULES } from '../schemas';

export function PasswordChecklist({ value }: { value: string }) {
   return (
      <ul aria-label="Password requirements" className="grid gap-1.5 text-xs">
         {PASSWORD_RULES.map((rule) => {
            const met = rule.test(value);
            return (
               <li
                  key={rule.id}
                  className={cn(
                     'flex items-center gap-2 transition-colors',
                     met ? 'text-success' : 'text-muted-foreground',
                  )}
               >
                  {met ? (
                     <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                     <Circle className="h-3.5 w-3.5" aria-hidden />
                  )}
                  <span>{rule.label}</span>
                  <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
               </li>
            );
         })}
      </ul>
   );
}
