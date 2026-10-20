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
      max_memory_restart: "1G",
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
      max_memory_restart: "1G",
      error_file: "./logs/frontend-err.log",
      out_file: "./logs/frontend-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
