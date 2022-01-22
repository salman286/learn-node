const router = require("express").Router();

const {
  protect,
  restrictTo,
  makeAuthor,
  makeAdmin,
  login,
  signup,
} = require("../controllers/auth");
const {
  getUsers,
  getMe,
  getBlogsByUserId,
  updateMe,
  deleteMe,
  deleteUser,
} = require("../controllers/user");

router.route("/").get(protect, getUsers);

router.route("/:id").delete(protect, restrictTo("admin"), deleteUser);

router
  .route("/me")
  .get(protect, getMe)
  .patch(protect, updateMe)
  .delete(protect, deleteMe);

router.route("/author").post(protect, restrictTo("admin"), makeAuthor);
router.route("/admin").post(protect, restrictTo("admin"), makeAdmin);

router.route("/:userId/blogs").get(getBlogsByUserId);

router.route("/login").post(login);

router.route("/signup").post(signup);

module.exports = router;
