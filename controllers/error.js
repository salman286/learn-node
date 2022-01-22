const AppError = require("../lib/appError");

const sendDevError = (err, req, res) => {
  return res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, req, res) => {
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }

  console.log("error", err);

  return res
    .status(500)
    .json({ status: "error", message: "something went wrong" });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) err = new AppError("Error duplicate field", 400);

    sendProdError(err, req, res);
  }
};
