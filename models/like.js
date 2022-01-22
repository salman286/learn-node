const mongoose = require("mongoose");

const likeSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    blog: {
      type: mongoose.Schema.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

likeSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
