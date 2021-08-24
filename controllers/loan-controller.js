const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const loanModel = require("../models/loan-model");
const { findUserById } = require("./user-controller");
const { findAdminByID, getAdminListForMail } = require("./admin-controller");
const { sendEmailToAdmins } = require("../utils/send-email");
const sendMessage = require("../utils/fcm");
const { toolresults_v1beta3 } = require("googleapis");

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @description creates new loan application for auth user
 */
const createLoanApplication = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  //getting form data from req body
  const {
    title,
    applicantName,
    address,
    phone,
    email,
    amount,
    installment,
    fixed,
  } = req.body;

  //validating user
  const user = await findUserById(req.userData.id);

  //if auth failed
  if (!user) {
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  }

  //if auth successful
  //create a new entry in db
  //creates new loan application model
  const newLoan = new loanModel({
    title,
    applicantName,
    address,
    phone,
    email,
    amount,
    installment,
    fixed,
    creator: req.userData.id,
  });

  //session for saving application
  let loan;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    loan = await newLoan.save({ session: sess });
    user.loans.push(newLoan);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    console.log("Session error", e);
    return next(
      new HttpError(
        "Something went wrong. Cannot submit your loan application",
        500
      )
    );
  }
  const adminGroup = await getAdminListForMail();
  if (!adminGroup || !adminGroup?.length)
    console.log("cannot send email to admins");
  try {
    //sending OTP to the user email
    await sendEmailToAdmins(adminGroup);
  } catch (e) {
    console.log(e);
    const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );
    return next(error);
  }
  return res.status(200).json({
    data: loan,
    message: "Your loan application has been submitted for review",
  });
};

/**
 *
 * @param  res
 * @param  req
 * @param  next
 * @description update loan application
 */
const updateLoanApplication = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  //getting form data from req body
  const {
    _id,
    title,
    applicantName,
    address,
    phone,
    email,
    amount,
    installment,
    fixed,
    verified,
  } = req.body;

  ///validating user
  const user = findUserById(req.userData.id);

  //if auth failed
  if (!user) {
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  }

  //if auth successful
  //find application and update
  let updatedLoan;
  try {
    updatedLoan = await loanModel.findByIdAndUpdate(
      _id,
      {
        title,
        applicantName,
        address,
        phone,
        email,
        amount,
        installment,
        fixed,
        verified,
      },
      { new: true }
    );
  } catch (e) {
    return next(new HttpError("Cannot update loan application", 500));
  }

  if (!updatedLoan)
    return next(
      new HttpError("Could not find any loan application for this id", 404)
    );

  return res.status(200).json({
    data: updatedLoan,
    message: "Loan application updated",
  });
};

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @description get all applications for a user
 */
const getAllLoanApplication = async (req, res, next) => {
  let loan = [];
  try {
    loan = await loanModel
      .find({ creator: req.userData.id })
      .sort({ timestamp: "desc" });
  } catch (e) {
    return next(new HttpError("Cannot fetch data", 500));
  }

  return res.status(200).json({ data: loan, message: "Fetch successful" });
};

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @description delete a loan application
 */
const deleteLoanApplication = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { loanId } = req.body;
  let loan;
  try {
    loan = await loanModel.findById(loanId).populate("creator");
  } catch (e) {
    return next(
      new HttpError(
        "Something went wrong, could not delete Loan application.",
        500
      )
    );
  }
  if (!loan)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );

  if (loan.creator.id !== req.userData.id)
    return next(
      new HttpError(
        "You do not have the access to delete this Loan application",
        401
      )
    );
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await loan.remove({ session: sess });
    loan.creator.loans.pull(loan);
    await loan.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Something went wrong, could not delete Loan application.",
        500
      )
    );
  }
  return res
    .status(200)
    .json({ message: "Loan application deleted successfully" });
};

//for admins only ----

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @description get all applications for approval
 */
const getApplicationsForApproval = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  //checks if user is admin
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  let loans = [];
  try {
    loans = await loanModel
      .find({ verified: false })
      .sort({ timestamp: "desc" });
  } catch (e) {
    return next(
      new HttpError(
        "Something went wrong, could not fetch Loan applications",
        500
      )
    );
  }
  return res.status(200).json({ data: loans, message: "Fetch successful" });
};

/**
 *
 * @param  req
 * @param  res
 * @param  next
 * @description verify application for
 */
const approveLoanApplication = async (req, res, next) => {
  //checking validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  //checks if user is admin
  const admin = await findAdminByID(req.userData.id);
  if (!admin)
    return next(
      new HttpError("Permission denied! You cannot access this service", 401)
    );
  const { loanId, verified, adminComment } = req.body;
  let updatedLoan;
  try {
    updatedLoan = await loanModel
      .findByIdAndUpdate(loanId, { verified, adminComment }, { new: true })
      .populate("creator");
  } catch (e) {
    return next(
      new HttpError(
        "Something went wrong, could not aproove loan applications",
        500
      )
    );
  }
  const userFCMToken = updatedLoan?.creator?.fcmToken;
  //TODO Send email to user
  if (userFCMToken)
    await sendMessage(
      [userFCMToken],
      verified === true
        ? "Loan Manager - Application Approved"
        : "Loan Manager - Application Rejected",
      verified === true
        ? "Congratulations! Your loan application has been approved"
        : "We regret to inform that your loan application has been reject for some reason. Click to view comment"
    );

  const payload = !verified
    ? { data: updatedLoan }
    : { message: "Approval successful" };
  return res.status(200).json(payload);
};

exports.createLoanApplication = createLoanApplication;
exports.updateLoanApplication = updateLoanApplication;
exports.getAllLoanApplication = getAllLoanApplication;
exports.deleteLoanApplication = deleteLoanApplication;
exports.getApplicationsForApproval = getApplicationsForApproval;
exports.approveLoanApplication = approveLoanApplication;
