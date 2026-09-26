/**
 * PM2 Ecosystem Config for Zentrivex
 * Usage:
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: "zentrivex-api",
      script: "./artifacts/api-server/dist/index.mjs",
      cwd: "/opt/zentrivex",
      interpreter: "node",
      node_args: "--enable-source-maps",

      // Load .env from project root
      env_file: "/opt/zentrivex/.env",

      env: {
        NODE_ENV: "production",
      },

      // Process settings
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "/var/log/zentrivex/api-out.log",
      error_file: "/var/log/zentrivex/api-error.log",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
    },
  ],
};
