function healthController(req, res) {
  res.json({ ok: true, timestamp: new Date().toISOString() });
}

module.exports = {
  healthController
};
