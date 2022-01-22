const { promisify } = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signToken } = require("../lib/helpers");

const User = require("../models/user");
const AppError = require("../lib/appError");
const catchAsync = require("../lib/catchAsync");
const { userRoles } = require("../config/constants");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in. Please login to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select("+active");

  if (!currentUser || !currentUser.active) {
    return next(
      new AppError("User belonging to this token does not exist", 401)
    );
  }

  currentUser.select = undefined;
  req.user = currentUser;

  // TODO! check if user changed passowrd

  next();
});

exports.restrictTo = (roles) => {
  return catchAsync(async (req, res, next) => {
    if (typeof roles === "string") {
      if (!userRoles.includes(roles)) {
        return next(new Error(`${roles} role does not exist`));
      }
    } else {
      roles.forEach((role) => {
        if (!userRoles.includes(role)) {
          return next(new Error(`${role} role does not exist`));
        }
      });
    }

    if (typeof roles === "string" && !(roles === req.user.role)) {
      return next(
        new AppError("You do not have permission to do this action.", 403)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to do this action.", 403)
      );
    }

    next();
  });
};

// routes
exports.login = catchAsync(async (req, res, next) => {
  let user;
  const { email, username, password } = req.body;
  if (!password || !(username || email)) {
    return next(new AppError("Please provide identifier and password.", 404));
  }

  if (email) {
    user = await User.findOne({
      email,
    }).select("+password +active");
  } else if (username) {
    user = await User.findOne({
      username,
    }).select("+password +active");
  }

  if (!user || !user.active) {
    return next(
      new AppError("Unauthorized! Invalid identifier or password.", 404)
    );
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return next(
      new AppError("Unauthorized! Invalid identifier or password.", 401)
    );
  }

  const token = signToken(user._id);

  // delete password and active fields from user
  user.password = undefined;
  user.active = undefined;
  return res.status(200).json({
    status: "success",
    data: {
      user,
      jwt: token,
    },
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const user = await User.create({
    username,
    email,
    password,
  });

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    data: {
      user,
      jwt: token,
    },
  });
});

exports.makeAuthor = catchAsync(async (req, res, next) => {
  const { id, username, email } = req.body;

  if (!id && !username && !email) {
    return next(
      new AppError(
        "Please provide id, username or email of the user to make him author",
        400
      )
    );
  }

  const user = await User.findOne(req.body);

  if (user?.role === "author") {
    return next(new AppError("User is already author", 400));
  }

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    { role: "author" },
    { new: true }
  );

  res.status(201).json({
    status: "success",
    data: updatedUser,
  });
});

exports.makeAdmin = catchAsync(async (req, res, next) => {
  const { id, username, email } = req.body;

  if (!id && !username && !email) {
    return next(
      new AppError(
        "Please provide id, username or email of the user to make him admin",
        400
      )
    );
  }

  const user = await User.findOne(req.body);

  if (user?.role === "admin") {
    return next(new AppError("User is already admin", 400));
  }

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    { role: "admin" },
    { new: true }
  );

  res.status(201).json({
    status: "success",
    data: updatedUser,
  });
});
