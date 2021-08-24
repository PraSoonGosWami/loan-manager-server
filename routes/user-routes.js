const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

/**
 * @POST
 * @description user authentication method
 * route    /api/user/auth
 */
router.post("/auth", [check("email").isEmail()], userController.auth);

/**
 * @POST
 * @description user email verification
 * route    /api/user/verify
 */
router.post(
  "/verify",
  [check("email").isEmail(), check("otp").not().isEmpty()],
  userController.verify
);

/**
 * @POST
 * @description saves user fcm token
 * @protected route    /api/user/fcm
 */
router.post(
  "/fcm",
  checkAuth,
  check("fcmToken").not().isEmpty(),
  userController.storeFCM
);

module.exports = router;
