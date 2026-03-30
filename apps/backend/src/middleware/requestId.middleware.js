const { createId } = require("../utils/ids");

function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers["x-request-id"] || createId("req");
  res.setHeader("x-request-id", req.requestId);
  next();
}

module.exports = requestIdMiddleware;
