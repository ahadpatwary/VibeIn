import {
    CreateBatchOptions,
    CreateBatchRequestOptions,
    CreateEmailOptions,
    CreateEmailRequestOptions,
    CreateTemplateOptions,
    Resend,
    ResendOptions,
    UpdateTemplateOptions,
} from 'resend';

import { v4 as uuidv4 } from 'uuid';
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
import { ResendMissingApiKeyException, ResendUnknownException } from './exceptions/resend.exceptions.js';

export class ResendService {
    private readonly client: Resend;
    private readonly defaultFrom: string;
    private readonly retryOptions: Partial<RetryOptions>;

    constructor(
        private readonly cacheService: ResendRedisService,
        config: ResendServiceOptions,
    ) {
        if (!config.apiKey) {
            throw new ResendMissingApiKeyException(
                'ResendService requires an apiKey (e.g. process.env.RESEND_API_KEY)',
            );
        }

        const clientOptions: ResendOptions = {
            ...(config.baseUrl && { baseUrl: config.baseUrl }),
            ...(config.userAgent && { userAgent: config.userAgent }),
        };

        this.client = new Resend(config.apiKey, clientOptions);
        this.defaultFrom = config.defaultFrom ?? '<dev>vibein';
        this.retryOptions = config.retry ?? {};
    }


    async sendEmail(
        options: CreateEmailOptions,
        requestOptions: CreateEmailRequestOptions = {},
    ): Promise<SendEmailData> {

        const createEmailOptions: CreateEmailOptions = {
            from: this.defaultFrom,
            ...options,
        }

        const createEmailRequestOptions: CreateEmailRequestOptions = {
            idempotencyKey: uuidv4(),
            ...requestOptions,
        };

        return withRetry(async () => {
            const { data, error } = await this.client.emails.send(
                createEmailOptions,
                createEmailRequestOptions,
            );

            if (error) throw mapResendErrorResponse(error);

            if (!data) {
                throw new ResendUnknownException('Resend returned neither data nor error');
            }

            return data;

        }, this.retryOptions);
    }


    async batchSendEmail(
        payload: CreateBatchOptions,
        requestOptions?: CreateBatchRequestOptions,
    ) {

        const reqOptions: CreateBatchRequestOptions = {
            batchValidation: 'strict',
            idempotencyKey: uuidv4(),
            ...requestOptions,
        }

        return withRetry(async () => {

            const { data, error } = await this.client.batch.send(
                payload,
                reqOptions,
            );

            if (error) throw mapResendErrorResponse(error);

            return data;
            
        }, this.retryOptions);
    }

}