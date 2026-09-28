import { CreateTemplateOptions, Resend, UpdateTemplateOptions } from 'resend';
import { injectable } from 'tsyringe';

import { ResendServerException } from '../exceptions/resend.exceptions';

@injectable()
export class TemplateService {
   private readonly resend!: Resend;

   constructor() {
      this.resend = new Resend();
   }

   async createTemplate(createTemplateOptions: CreateTemplateOptions): Promise<void> {
      const { error } = await this.resend.templates.create(createTemplateOptions).publish();

      if (error) throw new ResendServerException(error.message);
   }

   async updateTemplate(identifier: string, payload: UpdateTemplateOptions): Promise<void> {
      const { error } = await this.resend.templates.update(identifier, payload);

      if (error) throw new ResendServerException(error.message);
   }
}
