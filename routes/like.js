const router = require("express").Router();

const { protect } = require("../controllers/auth");
const {
  createLike,
  deleteLikeById,
  deleteLikeByBlogId,
} = require("../controllers/like");

router.route("/").post(protect, createLike).delete(protect, deleteLikeByBlogId);

router.route("/:id").delete(protect, deleteLikeById);

module.exports = router;
