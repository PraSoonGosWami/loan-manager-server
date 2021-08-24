const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const adminModel = require("../models/admin-model");
const { findUserById } = require("./user-controller");

/**
 * utilty function
 * @param  email
 * @description finds admin by user
 */
const findAdminByID = async (id) => {
  const user = await findUserById(id);
  //if auth failed
  if (!user)
    return next(
      new HttpError("Permission denied! Please login to continue", 404)
    );
  try {
    return await adminModel.findOne({ email: user.email });
  } catch (e) {
    return next(
      new HttpError("Creating loan application failed, please try again.", 500)
    );
  }
};

/**
 * utilty function
 * @description gets list of all admins for mail notification
 */
const getAdminListForMail = async () => {
  try {
    const list = await adminModel.find({});
    return list.map((item) => item.email);
  } catch (e) {
    return false;
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description checks if the user is admin
 */

const checkIfAdmin = async (req, res, next) => {
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  return res.status(200).json({ isAdmin: true });
};

/**
 * @param req
 * @param res
 * @param next
 * @description gets all admin
 */
const getAllAdmin = async (req, res, next) => {
  //checks if user is admin
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  let admins = [];
  try {
    admins = await adminModel.find({});
  } catch (e) {
    next(new HttpError("Something went wrong. Please try again", 500));
  }
  return res.status(200).json({ data: admins, message: "Fetch successful" });
};

/**
 * @param req
 * @param res
 * @param next
 * @description adds an admin to the list
 */
const addAdmin = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Email invalid", 422));
  }
  //checks if user is admin
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  const { email } = req.body;
  let data;
  try {
    data = await adminModel.create({ email });
  } catch (e) {
    next(new HttpError("Something went wrong. Please try again", 500));
  }
  return res.status(201).json({ data, message: "Email added to admin group" });
};

/**
 * @param req
 * @param res
 * @param next
 * @description deletes an admin by email
 */
const deleteAdminByEmail = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Email invalid", 422));
  }
  //checks if user is admin
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  const { _id } = req.body;
  try {
    await adminModel.findByIdAndDelete(_id);
  } catch (e) {
    next(new HttpError("Something went wrong. Please try again", 500));
  }

  return res
    .status(200)
    .json({ message: "Email removed from the admin group" });
};

//utility functions
exports.findAdminByID = findAdminByID;
exports.getAdminListForMail = getAdminListForMail;
//controllers
exports.checkIfAdmin = checkIfAdmin;
exports.getAllAdmin = getAllAdmin;
exports.addAdmin = addAdmin;
exports.deleteAdminByEmail = deleteAdminByEmail;
