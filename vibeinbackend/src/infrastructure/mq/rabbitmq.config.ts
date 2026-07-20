import amqp from 'amqplib'
import { RTAssertQueueOptions, RTAssertQueueOptionsForMain } from './types/mq.types';
import { z } from 'zod';

// amqplib এর জেনারেল অপশন পাসথ্রু স্কিমা
const amqpOptionsSchema = z.object({}).passthrough();

export const QueueBindingSchema = z.object({
    exchangeName: z.string().min(1, "Exchange name required"),
    routingKey: z.string().min(1, "Routing key required"), // bindingKey এর জায়গায় routingKey করা হয়েছে
    bindingArgs: z.any().optional(),
});

// ২. মেইন কিউ এর জন্য যখন DLX লাগবে (REQUIRED)
const retryAssertQueueOptionsForMainSchema = z.object({
    deadLetterExchange: z.string().trim().min(1, "deadLetterExchange is required for DLX processes"),
    deadLetterRoutingKey: z.string().trim().min(1, 'deadLetterRoutingKey is required for DLX processes'),
}).passthrough();

const retryAssertQueueOptionsForRetrySchema = z.object({
    messageTtl: z.number().positive("messageTtl is required for retry queue"),
    deadLetterExchange: z.string().trim().min(1, "deadLetterExchange name required for retry"),
    deadLetterRoutingKey: z.string().trim().min(1, 'deadLetterRoutingKey required for retry'),
}).passthrough();

export const QueueConfigItemSchema = z.object({
    id: z.string().min(1),
    processType: z.enum(['NORMAL', 'NORMAL_DLX', 'RETRY', 'RETRY_DLX']),
    queueName: z.string().min(1),
    queueOptions: amqpOptionsSchema, // প্রথমে জেনেরিক রাখছি, পরে সুপার-রিফাইন দিয়ে টাইট করব
  
    retry: z.object({
        initialDelayMs: z.number().positive(),
        factor: z.number().min(1),
        maxRetry: z.number().positive(),
        maxDelayMs: z.number().positive(),
        retry_exchange: z.string().min(1),
        retry_queue: z.string().min(1),
        retry_queueOptions: retryAssertQueueOptionsForRetrySchema,
        retry_routingKey: z.string().min(1),
        retry_bindingArgs: z.any().optional(),
    }).nullable(),

    DLQ: z.object({
        dlx_exchange: z.string().min(1),
        dlx_queue: z.string().min(1),
        dlx_routingKey: z.string().min(1),
        dlx_bindingArg: z.any().optional(),
    }).nullable(),

    bindings: z.array(QueueBindingSchema).min(1, "At least one binding is required"),
}).superRefine((data, ctx) => {


  // ক) যদি NORMAL_DLX বা RETRY_DLX হয় -> queueOptions এ DLX প্রোপার্টি বাধ্যতামূলক!
    if (data.processType === 'NORMAL_DLX' || data.processType === 'RETRY_DLX') {
        const mainOptionsCheck = retryAssertQueueOptionsForMainSchema.safeParse(data.queueOptions);
        if (!mainOptionsCheck.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['queueOptions'],
                message: `For ${data.processType}, queueOptions must contain 'deadLetterExchange' and 'deadLetterRoutingKey'`,
            });
        }
    }

  // খ) যদি RETRY বা RETRY_DLX হয় -> retry অবজেক্ট অবশ্যই থাকতে হবে (null হতে পারবে না)
    if (data.processType === 'RETRY' || data.processType === 'RETRY_DLX') {
        if (data.retry === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retry'],
                message: `For processType '${data.processType}', retry configuration cannot be null!`,
            });
        }
    } else {
        // অন্যথায় (NORMAL, NORMAL_DLX) হলে retry অবশ্যই null হতে হবে
        if (data.retry !== null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retry'],
                message: `For processType '${data.processType}', retry must be null!`,
            });
        }
    }

    // গ) যদি NORMAL_DLX বা RETRY_DLX হয় -> DLQ অবজেক্ট অবশ্যই থাকতে হবে
    if (data.processType === 'NORMAL_DLX' || data.processType === 'RETRY_DLX') {
        if (data.DLQ === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['DLQ'],
                message: `For processType '${data.processType}', DLQ configuration cannot be null!`,
            });
        }
    } else {
        // অন্যথায় (NORMAL, RETRY) হলে DLQ অবশ্যই null হতে হবে
        if (data.DLQ !== null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['DLQ'],
                message: `For processType '${data.processType}', DLQ must be null!`,
            });
        }
    }

  // ===========================================================================
  // 🔒 তোমার আগের দেওয়া ৩টি বিজনেস লজিক কন্ডিশন (Strict Mappings)
  // ===========================================================================

    // ১. রিট্রাই কিউ এর মেসেজ ব্যাক করার রুট চেক
    if (data.retry && data.retry.retry_queueOptions) {
        const targetDLX = data.retry.retry_queueOptions.deadLetterExchange;
        const hasValidReturnRoute = data.bindings.some(b => b.exchangeName === targetDLX);
        if (!hasValidReturnRoute) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retry', 'retry_queueOptions', 'deadLetterExchange'],
                message: `Retry deadLetterExchange must match one of the main exchange bindings!`,
            });
        }
    }

    // ২. queueOptions-এর DLX সেটিংস এবং DLQ অবজেক্টের সেটিংস ১০০% ম্যাচ করা
    if (data.DLQ && data.queueOptions) {
        const mainDlxExchange = (data.queueOptions as any).deadLetterExchange;
        const mainDlxRoutingKey = (data.queueOptions as any).deadLetterRoutingKey;

        if (mainDlxExchange !== data.DLQ.dlx_exchange) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['queueOptions', 'deadLetterExchange'],
                message: `queueOptions.deadLetterExchange must strictly match DLQ.dlx_exchange ("${data.DLQ.dlx_exchange}")`,
            });
        }

        if (mainDlxRoutingKey !== data.DLQ.dlx_routingKey) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['queueOptions', 'deadLetterRoutingKey'],
                message: `queueOptions.deadLetterRoutingKey must strictly match DLQ.dlx_routingKey ("${data.DLQ.dlx_routingKey}")`,
            });
        }
    }

    // ৩. retry-র এক্সচেঞ্জ ও রাউটিং কি bindings[0] এর সাথে ম্যাচ করা
    if (data.retry && data.bindings.length > 0) {
        const firstBinding = data.bindings[0];

        if (data.retry.retry_exchange !== firstBinding.exchangeName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retry', 'retry_exchange'],
                message: `retry_exchange must match the 1st object's exchangeName in bindings ("${firstBinding.exchangeName}")`,
            });
        }

        if (data.retry.retry_routingKey !== firstBinding.routingKey) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retry', 'retry_routingKey'],
                message: `retry_routingKey must match the 1st object's routingKey in bindings ("${firstBinding.routingKey}")`,
            });
        }
    }
});

export const QueueRegistrySchema = z.array(QueueConfigItemSchema);

export interface QueueBinding {
    exchangeName: string;
    bindingKey: string;
    bindingArgs?: any;
}

type ProcessType = 
    | 'NORMAL'              // MAIN -> DROP
    | 'NORMAL_DLX'          // MAIN -> DLX
    | 'RETRY'               // MAIN -> RETRY -> DROP
    | 'RETRY_DLX'           // MAIN -> RETRY -> DLX
;

interface QueueConfigItem<T extends ProcessType> {
    id: string;
    processType: T;
    queueName: string;
    queueOptions: T extends 'NORMAL_DLX' | 'RETRY_DLX'
        ? RTAssertQueueOptionsForMain
        : amqp.Options.AssertQueue
    ;

    retry: T extends 'RETRY' | 'RETRY_DLX' ? {
        initialDelayMs: number,
        factor: number,
        maxRetry: number,
        maxDelayMs: number,

        retry_exchange: string,
        retry_exchangeOptions?: amqp.Options.AssertExchange,

        retry_queue: string,
        retry_queueOptions: RTAssertQueueOptions,

        retry_routingKey: string,
        retry_bindingArgs?: any,
    } : null;

    DLQ: T extends 'NORMAL_DLX' | 'RETRY_DLX' ? {
        dlx_exchange: string,
        dlx_exchangeOptions?: amqp.Options.AssertExchange,

        dlx_queue: string,
        dlx_queueOptions?: amqp.Options.AssertQueue,

        dlx_routingKey: string,
        dlx_bindingArg?: any,
    } : null;

    bindings: QueueBinding[];
}


// ৩. মেইন ডায়নামিক রেজিস্ট্রি
export const QueueRegistry: QueueConfigItem<'RETRY_DLX'> [] = [
    {
        id: 'EMAIL_SERVICE',
        processType: 'RETRY_DLX',
        queueName: 'email.queue',
        queueOptions: {
            deadLetterExchange: 'email.dlx.exchange',
            deadLetterRoutingKey: 'email.dlx.routingKey',
        },

        retry: {
            initialDelayMs: 1000,
            factor: 2,
            maxRetry: 3,
            maxDelayMs: 2000,

            retry_exchange: 'email.retry.exchange',
            retry_queue: 'email.retry.queue',
            retry_queueOptions: {
                messageTtl: 5000,
                deadLetterExchange: 'default.email.exchange',
                deadLetterRoutingKey: 'default.email.routingKey'
            },
            retry_routingKey: 'email.retry.routingKey',
        },


        DLQ: {
            dlx_exchange: 'email.dlx.exchange',
            dlx_routingKey: 'email.dlx.routingKey',
            dlx_queue: 'email.dlx.queue',
        },
 

        bindings: [
            {
                exchangeName: 'default.email.exchange',
                bindingKey: 'default.email.routingKey',
            },
            {
                exchangeName: 'order.email.exchange',
                bindingKey: 'order.email.routingKey',
            },
        ], 
    },
 
];