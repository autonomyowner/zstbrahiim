module.exports = {
  apps: [
    {
      name: 'zst-backend',
      script: 'dist/main.js',
      cwd: '/var/www/zst-backend',
      instances: 'max',  // Use all CPU cores (2)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',  // Per instance
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        REDIS_HOST: 'redis-16946.fcrce259.eu-central-1-3.ec2.cloud.redislabs.com',
        REDIS_PORT: 16946,
        REDIS_PASSWORD: 'sa8CNz8WAWdgahVxNWNQzhmBx0Gvw1OK'
      },
      error_file: '/var/www/zst-backend/logs/error.log',
      out_file: '/var/www/zst-backend/logs/out.log',
      log_file: '/var/www/zst-backend/logs/combined.log',
      time: true,
      merge_logs: true,
      // Performance tuning
      listen_timeout: 8000,
      kill_timeout: 5000,
    }
  ]
};
