const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const likeRouter = require("./routes/like");
const globalErrorHandler = require("./controllers/error");
const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/likes", likeRouter);

app.all("*", (req, res, next) => {
  const err = new Error(`Can not find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use(globalErrorHandler);
module.exports = app;
