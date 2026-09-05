import { CreateEmailResponse, TemplateVariableCreationOptions } from 'resend';
import { RetryOptions } from '../../cache/decorators/retry.decorator.js';

// export interface TemplateOptions extends CreateEmailOptions {
//     template: { id: string; variables?: Record<string, string | number>; };
// }

export type TemplateType = {
    alias: string;
    templateHash: string;
};

export interface EmailTemplateDefinition {
    name: string;
    alias: string;
    html: string;
    variables: TemplateVariableCreationOptions[];
}

export interface ResendServiceOptions {
    apiKey: string;
    baseUrl?: string;
    userAgent?: string;
    defaultFrom?: string;
    retry?: Partial<RetryOptions>;
}

export type SendEmailData = NonNullable<CreateEmailResponse['data']>;
