module.exports = {
  apps: [
    {
      name: "frozen-guild-server",
      script: "./server/dist/server/src/index.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "production",
        PORT: "8000",
        WEB_ORIGIN: "https://frozen.example.com",
        SQLITE_PATH: "./data/frozen-guild.db"
      }
    }
  ]
};
