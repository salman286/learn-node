const AppError = require("../lib/appError");
const catchAsync = require("../lib/catchAsync");
const Blog = require("../models/blog");
const Like = require("../models/like");

exports.createLike = catchAsync(async (req, res, next) => {
  const { blogId } = req.body;
  const { _id: userId } = req.user;

  if (!blogId) {
    return next(new AppError("blogId is required.", 400));
  }

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return next(new AppError("blog with id does not exist", 400));
  }

  const like = await Like.findOne({ blog: blogId });

  if (like?.users.includes(userId)) {
    return next(new AppError("already liked blog", 400));
  }

  let updatedLike;
  if (like) {
    updatedLike = await Like.updateOne({
      users: [...like.users, userId],
    });
  } else {
    updatedLike = await Like.create({
      blog: blogId,
      users: [{ _id: userId }],
    });
  }

  res.status(200).json({
    status: "success",
    data: updatedLike,
  });
});

exports.deleteLikeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user;

  const like = await Like.findOneAndDelete({ _id: id, users: { $in: userId } });

  if (!like) {
    return next(new AppError("like does not exist", 400));
  }

  res.status(200).json({
    status: "success",
    data: like,
  });
});

exports.deleteLikeByBlogId = catchAsync(async (req, res, next) => {
  const { blogId } = req.body;
  const { _id: userId } = req.user;

  if (!blogId) {
    return next(new AppError("blog id is required", 400));
  }

  const like = await Like.findOneAndDelete({
    blog: blogId,
    users: { $in: userId },
  });

  if (!like) {
    return next(new AppError("like does not exist", 400));
  }

  res.status(200).json({
    status: "success",
    data: like,
  });
});
