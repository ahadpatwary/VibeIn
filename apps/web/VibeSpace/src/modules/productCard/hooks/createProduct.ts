import { createProductCardType } from "../schemas/productCard";
import { createProductApi } from "../api/createProductApi";


export const useCreateProduct = () => {
    
    const createProduct = async (productObject: createProductCardType) => {

        try {
            const response = await createProductApi(productObject);
            return response;
        }   
        catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    };

    return { createProduct };
}