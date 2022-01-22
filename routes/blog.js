const router = require("express").Router();
const {
  updateBlog,
  getBlog,
  getBlogs,
  createBlog,
  deleteBlog,
  createLike,
} = require("../controllers/blog");
const { protect, restrictTo } = require("../controllers/auth");

router
  .route("/")
  .get(getBlogs)
  .post(protect, restrictTo(["author", "admin"]), createBlog);

router
  .route("/:id")
  .get(getBlog)
  .delete(protect, deleteBlog)
  .patch(protect, updateBlog);

module.exports = router;
