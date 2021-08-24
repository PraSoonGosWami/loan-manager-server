const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const adminController = require("../controllers/admin-controller");

/**
 * @GET
 * @description checks if the current user is admin
 * @protected route    /api/admin/check
 */
router.get("/check", checkAuth, adminController.checkIfAdmin);

/**
 * @GET
 * @description gets all admin from DB
 * @protected route    /api/admin/get
 */
router.get("/get", checkAuth, adminController.getAllAdmin);

/**
 * @POST
 * @description adds new admin to the admin list
 * @protected route    /api/admin/add
 */
router.post(
  "/add",
  checkAuth,
  [check("email").isEmail()],
  adminController.addAdmin
);

/**
 * @DELETE
 * @description delete an admin from admin group
 * @protected route    /api/admin/delete
 */
router.delete(
  "/delete",
  checkAuth,
  [check("_id").not().isEmpty()],
  adminController.deleteAdminByEmail
);

module.exports = router;
