import { http } from '@/shared/lib/api/http';
import { createProductCardType, createProductCardReturnSchema, createProductCardReturnType } from '../schemas/productCard';

export async function createProductApi(productObject: createProductCardType) {

    return http<createProductCardReturnType>('/api/product', {
        method: 'POST',
        body: productObject,
        schema: createProductCardReturnSchema,
    })

}