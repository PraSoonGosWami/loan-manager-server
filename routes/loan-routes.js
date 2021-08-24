const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const loanController = require("../controllers/loan-controller");

/**
 * @GET
 * @description get all loan application by user id
 * @protected route    /api/loan/getByUser
 */
router.get("/getByUser", checkAuth, loanController.getAllLoanApplication);

/**
 * @POST
 * @description creates new loan application
 * @protected route    /api/loan/create
 */
router.post(
  "/create",
  checkAuth,
  [
    check("title").not().isEmpty(),
    check("applicantName").not().isEmpty(),
    check("address").not().isEmpty(),
    check("phone").isMobilePhone(),
    check("email").isEmail(),
    check("amount").not().isEmpty(),
    check("installment").not().isEmpty(),
    check("fixed").isBoolean(),
  ],
  loanController.createLoanApplication
);

/**
 * @POST
 * @description update loan application
 * @protected route    /api/loan/update
 */
router.post(
  "/update",
  checkAuth,
  [
    check("title").not().isEmpty(),
    check("_id").not().isEmpty(),
    check("applicantName").not().isEmpty(),
    check("address").not().isEmpty(),
    check("phone").isMobilePhone(),
    check("email").isEmail(),
    check("amount").not().isEmpty(),
    check("installment").not().isEmpty(),
    check("fixed").isBoolean(),
  ],
  loanController.updateLoanApplication
);

/**
 * @DELETE
 * @description delete a loan application for a user
 * @protected route    /api/loan/delete
 */
router.delete(
  "/delete",
  checkAuth,
  [check("loanId").not().isEmpty()],
  loanController.deleteLoanApplication
);

/**
 * @GET
 * @description fetches all loan application which are not approved
 * @protected route    /api/loan/getForApproval
 */
router.get(
  "/getForApproval",
  checkAuth,
  loanController.getApplicationsForApproval
);

/**
 * @POST
 * @description update loan application
 * @protected route    /api/loan/approve
 */
router.post(
  "/approve",
  checkAuth,
  [
    check("loanId").not().isEmpty(),
    check("verified").isBoolean(),
    check("adminComment").not().isEmpty(),
  ],
  loanController.approveLoanApplication
);

module.exports = router;
