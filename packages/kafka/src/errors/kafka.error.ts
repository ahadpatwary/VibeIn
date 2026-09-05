import { KafkaOperation } from "./kafka.error.mapper";


export abstract class KafkaException extends Error {
    public readonly code: string;
    public readonly retryable: boolean;
    public readonly originalError?: unknown;
    public readonly context?: Record<string, unknown>;


    protected constructor(
        message: string,
        code: string,
        retryable: boolean,
        originalError?: unknown,
        context?: Record<string, unknown>,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.retryable = retryable;
        this.originalError = originalError;
        this.context = context;
        Error.captureStackTrace?.(this, this.constructor);
    }
}


export class KafkaConnectionException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_CONNECTION_ERROR', true, originalError, context);
    }
}

export class KafkaAuthenticationException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_AUTHENTICATION_ERROR', false, originalError, context)
    }
}

export class KafkaTimeoutException extends KafkaException {
    private readonly operation: KafkaOperation;

    constructor(
        message: string, 
        operation: KafkaOperation,
        originalError?: unknown, 
        context?: Record<string, unknown>,
    ) {
        super(message, 'KAFKA_TIMEOUT_ERROR', true, originalError, context);
        this.operation = operation;
    }

}

export class KafkaProducerException extends KafkaException {
    constructor(
        message: string, 
        retryable: boolean = false, 
        originalError?: unknown, 
        context?: Record<string, unknown>
    ) {
        super(message, 'KAFKA_PRODUCER_ERROR', retryable, originalError, context);
    }
}

export class KafkaConsumerException extends KafkaException {
    constructor(
        message: string,
        retryable: boolean = false,
        originalError?: unknown,
        context?: Record<string, unknown>
    ) {
        super(message, 'KAFKA_CONSUMER_ERROR', retryable, originalError, context);
    }
}

export class KafkaAdminException extends KafkaException {
    constructor(
        message: string,
        retryable: boolean = false,
        originalError?: unknown,
        context?: Record<string, unknown>
    ) {
        super(message, 'KAFKA_ADMIN_ERROR', retryable, originalError, context);
    }
}


export class KafkaSerializationException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_SERIALIZATION_ERROR', false, originalError, context);
    }
}

// export class KafkaSerializationException extends KafkaException {
//     constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
//         super(message, 'KAFKA_SERIALIZATION_ERROR')
//     }
// }

export class KafkaTopicException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_TOPIC_ERROR', false, originalError, context);
    }
}

export class KafkaRetriesExhaustedException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_RETRIES_EXHAUSTED', false, originalError, context);
    }
}

export class KafkaNotConnectedException extends KafkaException {
    constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
        super(message, 'KAFKA_NOT_CONNECTED', true, originalError, context);
    }
}