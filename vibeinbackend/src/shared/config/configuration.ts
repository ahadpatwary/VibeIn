export default () => ({
  port: process.env.PORT ?? '5000',

  database: {
    uri: process.env.DB_URI,
  },

  queue: {
    uri: process.env.QUEUE_URI,
  },
});
