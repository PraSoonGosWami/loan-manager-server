const { validationResult } = require("express-validator");
const { totp } = require("otplib");
const HttpError = require("../models/http-error");
const userModel = require("../models/user-model");
const generateJWT = require("../utils/generateJwt");
const { sendEmail } = require("../utils/send-email");

/**
 * otp options
 * step - valid till 10 minutes
 * digits - 6 digit OTP
 */
totp.options = { digits: 6, step: 600 };

/**
 * utilty function
 * @param  id - user id
 * @returns finds user by user id from DB
 */
const findUserById = async (id) => {
  try {
    return await userModel.findById(id);
  } catch (err) {
    return next(
      new HttpError("Creating loan application failed, please try again.", 500)
    );
  }
};

/**
 * utilty function
 * @param  email
 * @returns found user from the DB via email
 */
const findUserByEmail = async (email) => {
  try {
    return await userModel.findOne({ email });
  } catch (e) {
    return next(
      new HttpError("Cannot log you in, please try again later", 500)
    );
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @description user authentication handler
 */
const auth = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid or no email passed", 422));
  }
  const { email } = req.body;

  //finds existing user
  const existingUser = await findUserByEmail(email);

  //if user does not exist
  //create new user and saving to the DB
  const name = email.toString().split("@")[0];
  if (!existingUser) {
    try {
      await userModel.create({
        name,
        email,
      });
    } catch (e) {
      return next(
        new HttpError("Something went wrong , please try again later", 500)
      );
    }
  }

  //generating the OTP and sigining it with the user email
  const token = totp.generate(email);

  try {
    //sending OTP to the user email
    await sendEmail(token, email);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );
    return next(error);
  }
  //returning the response
  return res.status(200).json({
    message: "Please enter the verification code we have sent to your email",
  });
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @description user OTP verification handler
 */
const verify = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  const { email, otp } = req.body;
  //check if OTP is valid for the particular
  const isValid = totp.check(otp, email);
  //if not valid
  if (!isValid) return next(new HttpError("You have entered wrong OTP", 401));
  //finds existing user using email
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return next(
      new HttpError("Cannot find user associated with this email", 403)
    );
  }
  //if password is correct then generates JWT token
  const { token, error } = generateJWT(existingUser);
  if (error)
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  //returning the response if OTP is valid
  res.status(201).json({
    data: {
      email: existingUser.email,
      name: existingUser.name,
    },
    isValid,
    token,
    message: "Login Successfull",
  });
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @description stores user FCM token to DB
 */
const storeFCM = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("FCM Token not found", 422));
  }
  const { fcmToken } = req.body;
  try {
    await userModel.findByIdAndUpdate(req.userData.id, { fcmToken });
  } catch (e) {
    return next(new HttpError("Cannot save FCM Token", 422));
  }

  console.log("FCM TOKEN SAVED");
  return res.status(200).json({ message: "Saved FCM TOKEN" });
};

exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.auth = auth;
exports.verify = verify;
exports.storeFCM = storeFCM;
