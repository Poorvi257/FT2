const pino = require("pino");
const env = require("./env");

const logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info"
});

module.exports = logger;
