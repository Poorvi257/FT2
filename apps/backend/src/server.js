const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Backend server listening");
});
