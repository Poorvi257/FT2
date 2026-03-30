const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { AppError } = require("../utils/errors");

function authMiddleware(req, res, next) {
  const bearer = req.headers.authorization;
  const cookieToken = req.cookies?.ft2_session;
  const token = cookieToken || (bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : null);

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.auth = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(new AppError(401, "Invalid or expired session"));
  }
}

module.exports = authMiddleware;
