const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { userRoles } = require("../config/constants");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: [true, "username is not available"],
    validate: {
      validator: function (el) {
        return !/\s/.test(el);
      },
      message: "username can not contain space",
    },
  },
  password: {
    type: String,
    required: [true, "password is required"],
    select: false,
    validate: {
      validator: function (el) {
        return el.length >= 6;
      },
      message: "password length must be greate than 6",
    },
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email is already associated with another account"],
    validate: [validator.isEmail, "invalid email"],
  },
  role: {
    type: String,
    enum: {
      values: userRoles,
      message: "Role can be either: user, author, admin.",
    },
    default: "user",
  },
  createdAt: {
    type: Date,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date().toISOString(),
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

userSchema.post("save", function () {
  this.password = undefined;
  this.__v = undefined;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
