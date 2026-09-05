import { Resend, ResendOptions } from 'resend'
import { ResendServiceOptions } from './types/resend.type';



export class ResendClient {
    private resend!: Resend;

    constructor(config: ResendServiceOptions) {
        
        const resendOptions: ResendOptions  = {
            ...(config.baseUrl && { baseUrl: config.baseUrl }),
            ...(config.userAgent && { userAgent: config.userAgent }),
        }

        this.resend = new Resend('', resendOptions);

    }


}