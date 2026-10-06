import { SetMetadata } from '@nestjs/common';
import { ZodType } from 'zod';

export const RESPONSE_SCHEMA_KEY = 'response_schema';

export const ResponseSchema = (schema: ZodType) => SetMetadata(RESPONSE_SCHEMA_KEY, schema);
