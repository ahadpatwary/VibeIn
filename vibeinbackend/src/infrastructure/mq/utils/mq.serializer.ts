import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { MessageEnvelope } from '../types/mq.types';



export class MessageSerializer {

  static serialize<T>(
    data: T,
    exchange: string,
    routingKey: string,
    overrides: Partial<MessageEnvelope<T>> = {},
  ): { buffer: Buffer; envelope: MessageEnvelope<T> } {

    const envelope: MessageEnvelope<T> = {
      id:           overrides.id           ?? uuidv4(),
      timestamp:    overrides.timestamp    ?? new Date().toISOString(),
      data,
      attempt:      overrides.attempt      ?? 1,
      exchange,
      routingKey,
      correlationId: overrides.correlationId,
      headers:      overrides.headers      ?? {},
      retryReason:  overrides.retryReason,
    };

    return { 
        buffer: Buffer.from(JSON.stringify(envelope)),
        envelope 
    };
  }


  static deserialize<T>(msg: amqp.ConsumeMessage): MessageEnvelope<T> {

    const raw = msg.content.toString('utf8');

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`MessageSerializer: failed to parse message content: ${raw.slice(0, 200)}`);
    }

    // Support both bare payloads and pre-enveloped messages
    if (MessageSerializer.isEnvelope(parsed)) {
      const env = parsed as MessageEnvelope<T>;

      // Merge x-death attempt count if present (set by RabbitMQ DLQ mechanism)
      const xDeath = (msg.properties.headers?.['x-death'] as Array<{ count: number }> | undefined);
      if (xDeath && xDeath.length > 0) {
        env.attempt = xDeath.reduce((acc, d) => acc + (d.count ?? 0), 0) + 1;
      }

      return env;
    }

    // Bare payload — wrap it
    return {
      id:           (msg.properties.messageId as string | undefined) ?? uuidv4(),
      timestamp:    msg.properties.timestamp
                      ? new Date(msg.properties.timestamp as number).toISOString()
                      : new Date().toISOString(),
      data:         parsed as T,
      attempt:      1,
      exchange:     msg.fields.exchange,
      routingKey:   msg.fields.routingKey,
      correlationId: msg.properties.correlationId as string | undefined,
      headers:      (msg.properties.headers ?? {}) as Record<string, unknown>,
    };
  }

  private static isEnvelope(obj: unknown): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id'        in obj &&
      'timestamp' in obj &&
      'data'      in obj &&
      'attempt'   in obj
    );
  }
}