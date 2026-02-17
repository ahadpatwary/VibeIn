export default () => ({
  port: process.env.PORT ?? '5000',

  database: {
    uri: process.env.DB_URI,
  },

  queue: {
    uri: process.env.QUEUE_URI,
  },

  cache: {
    uri: process.env.CACHE_URI,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }
});
