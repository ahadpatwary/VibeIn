import { http } from '@/shared/lib/api/http';
import { productSchema, productType } from '../schemas/productCard';


export async function productCardApi() {

    return http<productType[]>('/api/product', {
        method: 'GET',
        schema: productSchema.array(),
    })

}