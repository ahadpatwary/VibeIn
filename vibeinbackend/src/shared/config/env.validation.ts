import { z } from 'zod';

export const validate = (config: Record<string, unknown>) => {

    const filteredConfig = {
        port: config.PORT ?? '5000',
        database: { uri: config.DB_URI },
        queue: { uri: config.QUEUE_URI },
        cache: { uri: config.CACHE_URI },
        cloudinary: {
            cloud_name: config.CLOUDINARY_CLOUD_NAME,
            api_key: config.CLOUDINARY_API_KEY,
            api_secret: config.CLOUDINARY_API_SECRET,
        }
    };

    const schema = z.object({
        port: z.string(),
        database: z.object({
            uri: z.string(),
        }),
        queue: z.object({
            uri: z.string(),
        }),
        cache: z.object({
            uri: z.string(),
        }),
        cloudinary: z.object({
            cloud_name: z.string(),
            api_key: z.string(),
            api_secret: z.string()
        })
    });

    const parsed = schema.safeParse(filteredConfig);
    if (!parsed.success) {
        throw new Error(`ENV validation error: ${parsed.error}`);
    }
    return parsed.data;
};
