import {
    CreateBatchOptions,
    CreateBatchRequestOptions,
    CreateEmailOptions,
    CreateEmailRequestOptions,
    CreateTemplateOptions,
    Resend,
    ResendOptions,
    TemplateListItem,
    UpdateTemplateOptions,
} from 'resend';

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { EMAIL_TEMPLATES } from './resend.template.js';
import { ResendRedisService } from './infrastructure/redis.js';
import type {
    EmailTemplateDefinition,
    ResendServiceOptions,
    SendEmailData,
    TemplateType,
} from './types/resend.type.js';
import {
    withRetry,
    type RetryOptions,
} from '../cache/decorators/retry.decorator.js';
import { mapResendErrorResponse } from './map.resend.error.js';
import { ResendUnknownException } from './exceptions/resend.exceptions.js';

export class ResendService {
    private readonly client: Resend;
    private readonly defaultFrom: string;
    private readonly retryOptions: Partial<RetryOptions>;

    constructor(
        private readonly cacheService: ResendRedisService,
        options: ResendServiceOptions,
    ) {
        if (!options.apiKey) {
            throw new Error(
                'ResendService requires an apiKey (e.g. process.env.RESEND_API_KEY)',
            );
        }

        const clientOptions: ResendOptions = {
            ...(options.baseUrl && { baseUrl: options.baseUrl }),
            ...(options.userAgent && { userAgent: options.userAgent }),
        };

        this.client = new Resend(options.apiKey, clientOptions);
        this.defaultFrom = options.defaultFrom ?? '<dev>vibein';
        this.retryOptions = options.retry ?? {};
    }

    // ---------------------------------------------------------------------
    // Template sync
    // ---------------------------------------------------------------------

    async syncTemplates(): Promise<void> {
        const [cachedHashes, existingAliases] = await Promise.all([
            this.getCachedTemplateHashes(),
            this.fetchAllTemplateAliases(),
        ]);

        const templates = Object.values(
            EMAIL_TEMPLATES,
        ) as EmailTemplateDefinition[];

        for (const template of templates) {
            const templateHash = this.hashTemplate(template);
            const cached = cachedHashes[template.name];

            if (cached?.templateHash === templateHash) {
                continue;
            }

            const existsInResend = Boolean(existingAliases[template.alias]);

            if (existsInResend) {
                await this.updateTemplate(template);
                continue;
            }

            await this.createTemplate(template);

            await this.cacheService.setTemplateHash('emailTemplate', {
                ...cachedHashes,
                [template.name]: {
                    alias: template.alias,
                    templateHash,
                } satisfies TemplateType,
            });
        }
    }

    private hashTemplate(template: EmailTemplateDefinition): string {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(template))
            .digest('hex');
    }

    private async getCachedTemplateHashes(): Promise<
        Record<string, TemplateType>
    > {
        const raw = await this.cacheService.getTemplateHash('emailTemplate');
        return raw as Record<string, TemplateType>;
    }

    private async fetchAllTemplateAliases(): Promise<
        Record<string, { alias: string }>
    > {
        const aliasesByName: Record<string, { alias: string }> = {};
        let startingAfter: string | undefined;
        let hasMore = true;

        while (hasMore) {
            const page = await withRetry(async () => {
                const response = await this.client.templates.list({
                    limit: 100,
                    ...(startingAfter && { starting_after: startingAfter }),
                });
                if (response.error)
                    throw mapResendErrorResponse(response.error);
                return response.data;
            }, this.retryOptions);

            if (!page) break;

            const items = (page.data ?? []) as TemplateListItem[];
            for (const item of items) {
                if (item.alias) {
                    aliasesByName[item.name] = { alias: item.alias };
                }
            }

            hasMore = page.has_more ?? false;
            startingAfter =
                items.length > 0 ? items[items.length - 1]?.id : undefined;
        }

        return aliasesByName;
    }

    async sendEmail(
        createEmailOptions: CreateEmailOptions,
        requestOptions: CreateEmailRequestOptions = {},
    ): Promise<SendEmailData> {
        createEmailOptions.template = {
            id: '1',
            variables: {},
        };

        const options: CreateEmailRequestOptions = {
            idempotencyKey: uuidv4(),
            ...requestOptions,
        };

        return withRetry(async () => {
            const { data, error } = await this.client.emails.send(
                createEmailOptions,
                options,
            );
            if (error) throw mapResendErrorResponse(error);
            if (!data)
                throw new ResendUnknownException(
                    'Resend returned neither data nor error',
                );
            return data;
        }, this.retryOptions);
    }

    async sendEmailWithTemplate(
        payload: CreateEmailOptions,
        requestOptions: CreateEmailRequestOptions = {},
    ): Promise<SendEmailData> {
        const options: CreateEmailRequestOptions = {
            idempotencyKey: uuidv4(),
            ...requestOptions,
        };

        return withRetry(async () => {
            const { data, error } = await this.client.emails.send(
                payload,
                options,
            );
            if (error) throw mapResendErrorResponse(error);
            if (!data)
                throw new ResendUnknownException(
                    'Resend returned neither data nor error',
                );
            return data;
        }, this.retryOptions);
    }

    async batchSendEmail(
        payload: CreateBatchOptions,
        requestOptions?: CreateBatchRequestOptions,
    ) {
        return withRetry(async () => {
            const { data, error } = await this.client.batch.send(
                payload,
                requestOptions,
            );
            if (error) throw mapResendErrorResponse(error);
            return data;
        }, this.retryOptions);
    }

    async batchSendEmailWithTemplate(
        payload: CreateBatchOptions,
        requestOptions?: CreateBatchRequestOptions,
    ) {
        return withRetry(async () => {
            const { data, error } = await this.client.batch.send(
                payload,
                requestOptions,
            );
            if (error) throw mapResendErrorResponse(error);
            return data;
        }, this.retryOptions);
    }

    async createTemplate(payload: CreateTemplateOptions) {
        const object: CreateTemplateOptions = {
            from: this.defaultFrom,
            ...payload,
        };

        return withRetry(async () => {
            const { data, error } = await this.client.templates
                .create(object)
                .publish();
            if (error) throw mapResendErrorResponse(error);
            return data;
        }, this.retryOptions);
    }

    async updateTemplate(payload: UpdateTemplateOptions) {
        if (!payload.alias) {
            throw new ResendUnknownException(
                'updateTemplate requires an alias to identify the template',
            );
        }

        const object: UpdateTemplateOptions = {
            from: this.defaultFrom,
            ...payload,
        };

        return withRetry(async () => {
            const { data, error } = await this.client.templates.update(
                payload.alias!,
                object,
            );
            if (error) throw mapResendErrorResponse(error);
            return data;
        }, this.retryOptions);
    }
}
