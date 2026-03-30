const logger = require("../config/logger");

function errorMiddleware(err, req, res, next) {
  logger.error({
    err,
    requestId: req.requestId
  }, err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      details: err.details || null,
      requestId: req.requestId
    }
  });
}

module.exports = errorMiddleware;
