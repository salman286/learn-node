const jwt = require("jsonwebtoken");
const { userRoles } = require("../config/constants");

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
