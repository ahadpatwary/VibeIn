import {
    KafkaJSError,
    KafkaJSConnectionError,
    KafkaJSRequestTimeoutError,
    KafkaJSNumberOfRetriesExceeded,
    KafkaJSNonRetriableError,
    KafkaJSProtocolError,
    KafkaJSSASLAuthenticationError,
    KafkaJSTopicMetadataNotLoaded,
    KafkaJSMetadataNotLoaded,
} from 'kafkajs';

import {
    KafkaException,
    KafkaConnectionException,
    KafkaAuthenticationException,
    KafkaTimeoutException,
    KafkaProducerException,
    KafkaConsumerException,
    KafkaTopicException,
    KafkaRetriesExhaustedException,
} from './kafka.error';

export type KafkaOperation = 'produce' | 'consume' | 'connect' | 'disconnect' | 'admin';


export function mapKafkaError(
    error: unknown,
    operation: KafkaOperation,
    context?: Record<string, unknown>,
): KafkaException {
    // Already mapped — pass through
    if (error instanceof KafkaException) {
        return error;
    }

    if (error instanceof KafkaJSSASLAuthenticationError) {
        return new KafkaAuthenticationException(
            `Kafka SASL authentication failed during ${operation}`,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSConnectionError) {
        return new KafkaConnectionException(
            `Kafka broker connection failed during ${operation}: ${error.message}`,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSRequestTimeoutError) {
        return new KafkaTimeoutException(
            `Kafka request timed out during ${operation}`,
            operation,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSNumberOfRetriesExceeded) {
        return new KafkaRetriesExhaustedException(
            `Kafka internal retries exhausted during ${operation}`,
            error,
            context,
        );
    }

    if (
        error instanceof KafkaJSTopicMetadataNotLoaded ||
        error instanceof KafkaJSMetadataNotLoaded
    ) {
        return new KafkaTopicException(
            `Kafka topic metadata could not be loaded during ${operation}`,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSProtocolError) {
        // Protocol errors carry a `retriable` flag from the broker itself
        const retryable = Boolean((error as { retriable?: boolean }).retriable);
        return operation === 'produce'
        ? new KafkaProducerException(
            `Kafka protocol error during produce: ${error.message}`,
            retryable,
            error,
            context,
        )
        : new KafkaConsumerException(
            `Kafka protocol error during ${operation}: ${error.message}`,
            retryable,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSNonRetriableError) {
        return operation === 'produce'
        ? new KafkaProducerException(
            `Non-retriable producer error: ${error.message}`,
            false,
            error,
            context,
        )
        : new KafkaConsumerException(
            `Non-retriable consumer error: ${error.message}`,
            false,
            error,
            context,
        );
    }

    if (error instanceof KafkaJSError) {
        return operation === 'produce'
        ? new KafkaProducerException(
            `Kafka producer error: ${error.message}`,
            true,
            error,
            context,
        )
        : new KafkaConsumerException(
            `Kafka consumer error during ${operation}: ${error.message}`,
            true,
            error,
            context,
        );
    }

    // Completely unknown error shape — treat conservatively as retryable
    const message = error instanceof Error ? error.message : String(error);
    return operation === 'produce'
        ? new KafkaProducerException(`Unknown producer error: ${message}`, true, error, context)
        : new KafkaConsumerException(
            `Unknown error during ${operation}: ${message}`,
            true,
            error,
            context,
        )
    ;
}