import { z } from "zod";

export const eventObjectSchema = z.object({
    origin: z.string(),
    data: z.object({
        type: z.string().trim(),
        id: z.string().trim(),
        name: z.string().optional(),
        email: z.string().optional(),
        picture: z.string().optional(),
        accessToken: z.string()
    })
});