import {
    Resend,
    ResendOptions,
    CreateEmailOptions,
    CreateEmailRequestOptions,
    CreateEmailResponse,
    ErrorResponse,
} from 'resend';

const resendOptions: ResendOptions = {
    baseUrl: '',
    userAgent: '',
};

const client: Resend = new Resend('key', resendOptions);

const createEmailOptions: CreateEmailOptions = {
    from: '',
    to: '',
    html: '',
    subject: 'SEND OTP',
};

const createEmailRequestOptions: CreateEmailRequestOptions = {
    idempotencyKey: '11',
    headers: {},
};

const { data, error, headers }: CreateEmailResponse = await client.emails.send(
    createEmailOptions,
    createEmailRequestOptions,
);

if (error) {
    const err: ErrorResponse = error;

    const errorName = err.name;

    if (errorName == 'application_error') {
    }
}
