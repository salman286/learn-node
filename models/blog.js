const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: Date,
      default: () => new Date().toISOString(),
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.pre(/^find/, function (next) {
  this.populate("createdBy").populate("likes");
  this.select("-__v");
  next();
});

blogSchema.post("save", function () {
  this.__v = undefined;
});

blogSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "blog",
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
