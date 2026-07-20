import type { ErrorResponse } from 'resend';
import {
  ResendException,
  ResendValidationException,
  ResendAuthException,
  ResendRateLimitException,
  ResendNotFoundException,
  ResendServerException,
  ResendNetworkException,
  ResendUnknownException,
} from './resend.exceptions';


export function mapResendErrorResponse(error: ErrorResponse): ResendException {
  switch (error.name) {
    case 'validation_error':
    case 'invalid_parameter':
    case 'invalid_attachment':
    case 'invalid_from_address':
    case 'invalid_region':
    case 'missing_required_field':
      return new ResendValidationException(error.message, { cause: error });

    case 'missing_api_key':
    case 'restricted_api_key':
    case 'invalid_api_key':
      return new ResendAuthException(error.message, { cause: error });

    case 'rate_limit_exceeded':
      return new ResendRateLimitException(error.message, undefined, error);

    case 'not_found':
      return new ResendNotFoundException(error.message, { cause: error });

    case 'internal_server_error':
    case 'application_error':
      return new ResendServerException(error.message, { cause: error });

    default:
      return new ResendUnknownException(error.message, { cause: error });
  }
}


export function mapResendThrownError(error: unknown): ResendException {
  if (error instanceof ResendException) {
    return error;
  }
  const message = error instanceof Error ? error.message : 'Unknown network error';
  return new ResendNetworkException(message, { cause: error });
}