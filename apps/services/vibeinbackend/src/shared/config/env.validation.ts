import { z } from 'zod';

export const validate = (config: Record<string, unknown>) => {
   const filteredConfig = {
      port: config.PORT ?? '5000',
      database: {
         uri: config.DATABASE_URI,
         dbName: config.DATABASE_NAME,
      },
      cache: {
         host: config.REDIS_HOST,
         port: config.REDIS_PORT,
         username: config.REDIS_USERNAME,
         password: config.REDIS_PASSWORD,
      },
      token: {
         secret: config.ACCESS_TOKEN,
         refreshToken: config.REFRESH_TOKEN,
      },
   };

   const schema = z.object({
      port: z.string().trim().min(1, 'port must be required'),
      database: z.object({
         uri: z.string().trim().min(1, 'database uri must be required'),
         dbName: z.string().trim().min(2, 'databse name must be required'),
      }),
      cache: z.object({
         host: z.string().trim().min(1, 'redis host must be required'),
         port: z.string().trim().min(1, 'port must be required'),
         username: z.string().trim().min(1, 'username must be required'),
         password: z.string().trim().min(1, 'password must be required'),
      }),
      token: z.object({
         secret: z.string().trim().min(1, 'accessToken must be required'),
         refreshToken: z.string().trim().min(1, 'refreshToken must be required'),
      }),
   });

   const parsed = schema.safeParse(filteredConfig);

   if (!parsed.success) {
      throw new Error(`ENV validation error: ${parsed.error}`);
   }

   return parsed.data;
};
