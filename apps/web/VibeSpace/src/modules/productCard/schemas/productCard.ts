import z from 'zod'

export const productSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(300),
  sellerName: z.string().trim().min(3).max(30),
  sellerAvatar: z.string().url().optional(),   //optional
  price: z.number().min(0).default(0),          //optional
  currency: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]).default("USD"),  //optional
  rating: z.number().min(0).max(5).default(0),  //optional
  reviewCount: z.number().min(0).default(0),     //optional
  salesCount: z.number().min(0).default(0),    //optional
  viewCount: z.number().min(0).default(0),  //optional
  techStack: z.array(z.string().trim().min(1)).max(20),
  licenseType: z.enum(["MIT", "Commercial", "Extended"]).default("MIT"), //optional
  isPrivate: z.boolean().default(false),  //optinal
  isFeatured: z.boolean().default(false), //optional
  isVerified: z.boolean().default(false),  //optinal
  previewUrl: z.string().url().optional(),  //optional
  productUrl: z.string().url(),
  postedAt: z.string().trim().min(3).max(50),
  media: z.array(z.string().url()).min(1).max(5),
})

export type productType = z.infer<typeof productSchema>

export const createProductCardSchema = productSchema.pick({
    title: true,
    description: true,
    price: true,
    currency: true,
    techStack: true,
    licenseType: true,
    isPrivate: true,
    isFeatured: true,
    isVerified: true,
    previewUrl: true,
    productUrl: true,
    postedAt: true,
    media: true,    
})

export type createProductCardType = z.infer<typeof createProductCardSchema>


export const createProductCardReturnSchema = z.object({
    message: z.string(),
})

export type createProductCardReturnType = z.infer<typeof createProductCardReturnSchema>