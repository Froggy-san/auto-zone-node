import express from "express";
import {
  forgotPassword,
  isLoggedIn,
  login,
  logout,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from "../controllers/authController";
import {
  deleteMe,
  deleteUser,
  getCurrentUser,
  getMe,
  getUser,
  getUsers,
  updateMe,
  updateUser,
  uploadAvatar,
} from "../controllers/userController";
import { validate } from "../middleware/validateMiddleware";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateUserByAdminSchema,
  updateUserSchema,
} from "../validators/userValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

// 1. Public Routes
router.post("/signup", validate(createUserSchema), signup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);

router.patch(
  "/resetPassword/:token",
  validate(resetPasswordSchema),
  resetPassword,
);
// 2. Protected Routes (Must be logged in)
router.use(protect);

router.get("/me", getMe, getUser); // Renamed for standard practice
router.get("/:id", validate(paramIdSchema), getUser);

router.patch(
  "/updateMyPassword",
  validate(updatePasswordSchema),
  updatePassword,
);
// router.patch("/updateMyPassword", updatePassword); // Separate route for security
router.patch(
  "/updateMe",
  uploadAvatar.single("picture"),
  validate(updateUserSchema),
  updateMe,
);
router.delete("/deleteMe", deleteMe); // "deleteMe" is more descriptive than deleteCurrentUser

// 3. Admin Only Routes

router.use(restrictTo("admin"));
router.route("/").get(getUsers);

router.use(validate(paramIdSchema));

router
  .route("/:id")
  .delete(deleteUser)
  .patch(
    uploadAvatar.single("picture"),
    validate(updateUserByAdminSchema),
    updateUser,
  );
export default router;
