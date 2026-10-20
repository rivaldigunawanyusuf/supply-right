module.exports = {
  apps: [
    {
      name: "supplyright-backend",
      cwd: "./backend",
      script: "dist/index.js",
      instances: 1, // Single instance to ensure SSE stream & SQLite WAL sync 100%
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 38410,
        BACKEND_PORT: 38410,
      },
      // CPU & Crash-Loop Protection
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      exp_backoff_restart_delay: 1000,
      max_memory_restart: "500M",
      error_file: "./logs/backend-err.log",
      out_file: "./logs/backend-out.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "supplyright-frontend",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 38411",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 38411,
        BACKEND_PORT: 38410,
      },
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      exp_backoff_restart_delay: 1000,
      max_memory_restart: "1G",
      error_file: "./logs/frontend-err.log",
      out_file: "./logs/frontend-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
