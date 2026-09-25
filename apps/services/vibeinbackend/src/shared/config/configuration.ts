export default () => ({
   port: process.env.PORT ?? '5000',

   database: {
      uri: process.env.DATABASE_URI,
   },

   cache: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
   },

   // cloudinary: {
   //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   //   api_key: process.env.CLOUDINARY_API_KEY,
   //   api_secret: process.env.CLOUDINARY_API_SECRET,
   // }
});
