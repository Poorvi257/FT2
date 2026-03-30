const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 12);

function createId(prefix) {
  return `${prefix}_${nanoid()}`;
}

module.exports = {
  createId
};
