const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const PRIVATE_KEY = process.env.private_key;

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description middleware to check if the req is authorised
 */
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Auth 'Bearer TOKEN'
    if (!token) return next(new HttpError("Auth token unavailable", 400));
    const decodedToken = jwt.verify(token, PRIVATE_KEY);
    req.userData = { id: decodedToken.id, email: decodedToken.email };
    next();
  } catch (e) {
    console.log(`Auth middleware failed ${e}`);
    return next(new HttpError("Authentication failed", 403));
  }
};
