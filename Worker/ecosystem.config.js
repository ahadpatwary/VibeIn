module.exports = {
  apps: [
    // {
    //   name: 'api-server',
    //   script: 'dist/server.js',
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '300M',
    // },
    {
      name: 'queue-workers',
      script: 'dist/start-workers.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};