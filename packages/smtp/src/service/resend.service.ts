import { Resend } from 'resend';
import { inject, injectable } from 'tsyringe';

import { RESEND_TOKEN } from '../tokens/token.js';
import { type ResendConfig } from '../types/resend.type.js';

@injectable()
export class ResendService {
   private readonly resend!: Resend;

   constructor(@inject(RESEND_TOKEN.resendConfig) config: ResendConfig) {
      this.resend = new Resend(config.key, config.resendOption);
   }

   async sendEmail(): Promise<void> {}

   // async sendEmail(
   //    options: CreateEmailOptions,
   //    requestOptions: CreateEmailRequestOptions = {},
   // ): Promise<SendEmailData> {
   //    const createEmailOptions: CreateEmailOptions = {
   //       from: this.defaultFrom,
   //       ...options,
   //    };

   //    const createEmailRequestOptions: CreateEmailRequestOptions = {
   //       idempotencyKey: uuidv4(),
   //       ...requestOptions,
   //    };

   //    const { data, error } = await this.resend.emails.send(
   //       createEmailOptions,
   //       createEmailRequestOptions,
   //    );

   //    if (error) throw mapResendErrorResponse(error);

   //    if (!data) {
   //       throw new ResendUnknownException('Resend returned neither data nor error');
   //    }

   //    return data;
   // }

   // async batchSendEmail(payload: CreateBatchOptions, requestOptions?: CreateBatchRequestOptions) {
   //    const reqOptions: CreateBatchRequestOptions = {
   //       batchValidation: 'strict',
   //       idempotencyKey: uuidv4(),
   //       ...requestOptions,
   //    };

   //    const { data, error } = await this.client.batch.send(payload, reqOptions);

   //    if (error) throw mapResendErrorResponse(error);

   //    return data;
   // }
}
