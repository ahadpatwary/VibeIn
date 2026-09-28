import type { ResendOptions } from 'resend';

export interface ResendConfig {
   key: string;
   resendOption?: ResendOptions;
}

export type TemplateType = {
   alias: string;
   templateHash: string;
};
