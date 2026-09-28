export function maskEmail(email: string): string {
   const [local, domain] = email.split('@');
   if (!domain) return '***';
   const visible = local!.slice(0, 2);
   return `${visible}***@${domain}`;
}
