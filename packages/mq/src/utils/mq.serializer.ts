import * as amqp from 'amqplib';
import { RabbitMQSerializationException } from '../src/exceptions/mq.exceptions.js';

export class MessageSerializer {
    static serialize<T>(value: T): Buffer {
        try {
            if (value === null || value === undefined) {
                const stringValue = JSON.stringify(null);
                return Buffer.from(stringValue);
            }

            if (typeof value === 'string') {
                return Buffer.from(value);
            }

            if (typeof value === 'number' || typeof value === 'boolean') {
                return Buffer.from(String(value));
            }

            return Buffer.from(JSON.stringify(value));
        } catch (error) {
            throw new RabbitMQSerializationException(
                'serialize',
                error as Error,
            );
        }
    }

    static deserialize(
        msg: Buffer,
        contentType: string,
        contentEncoding: string,
    ) {
        const raw = msg.toString('utf8');

        try {
            return JSON.parse(raw);
        } catch (err) {
            throw new RabbitMQSerializationException(
                'deserialize',
                err as Error,
            );
        }
    }
}
