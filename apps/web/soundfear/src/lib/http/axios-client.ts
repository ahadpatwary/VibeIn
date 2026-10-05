import axios, { AxiosInstance } from 'axios';

export class ApiClient {
   private readonly client: AxiosInstance;

   constructor() {
      this.client = axios.create({
         baseURL: process.env.NEXT_PUBLIC_API_URL,
         timeout: 10_000,
         headers: {
            'Content-Type': 'application/json',
         },
         withCredentials: true,
      });
   }

   get apiClient(): AxiosInstance {
      return this.client;
   }
}
