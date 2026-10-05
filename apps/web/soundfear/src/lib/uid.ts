/** Random id that also works on non-secure origins (older LAN dev setups). */
export function uid(): string {
   if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
   }
   return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
