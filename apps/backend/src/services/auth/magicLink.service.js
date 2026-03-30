const jwt = require("jsonwebtoken");
const env = require("../../config/env");

class MagicLinkService {
  createToken(payload) {
    return jwt.sign(payload, env.MAGIC_LINK_SECRET, {
      expiresIn: `${env.MAGIC_LINK_TTL_MINUTES}m`
    });
  }

  verifyToken(token) {
    return jwt.verify(token, env.MAGIC_LINK_SECRET);
  }

  createLoginUrl(appUserId) {
    const token = this.createToken({ appUserId, type: "magic_link" });
    return `${env.FRONTEND_BASE_URL}/login?token=${token}`;
  }
}

module.exports = new MagicLinkService();
