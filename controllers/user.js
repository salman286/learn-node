const _ = require("lodash");
const User = require("../models/user");
const Blog = require("../models/blog");
const catchAsync = require("../lib/catchAsync");
const AppError = require("../lib/appError");
const { userPrivateFields } = require("../config/constants");

exports.getMe = catchAsync(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);
  res.status(200).json({ status: "success", user });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const data = _.omit(req.body, userPrivateFields);

  if (_.isEmpty(data)) {
    return next(new AppError("please enter valid data to update.", 400));
  }

  const user = await User.findByIdAndUpdate(id, data, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({ status: "success", user });
});

exports.deleteMe = catchAsync(async (req, res) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { active: false });
  res.status(204).json({ status: "success", data: null });
});

exports.getUsers = catchAsync(async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({ status: "success", results: users.length, data: users });
  } catch (err) {
    res.status(404).json({ status: "error", message: err });
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("user id is required", 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User with this id does not exist.", 404));
  }

  if (!user.active) {
    return next(new AppError("This user is deleted already", 400));
  }

  await User.findByIdAndUpdate(id, {
    active: false,
  });

  res.status(204).json({ status: "success", data: null });
});

exports.getBlogsByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User with this id does not exist.", 404));
  }

  const blogs = await Blog.find({ createdBy: userId }).select("-createdBy");
  res
    .status(200)
    .json({ status: "success", result: blogs.length, data: blogs });
});
