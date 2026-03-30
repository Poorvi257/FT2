const jwt = require("jsonwebtoken");
const env = require("../../config/env");

class SessionService {
  createSessionToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
  }
}

module.exports = new SessionService();
