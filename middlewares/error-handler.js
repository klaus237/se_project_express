module.exports = (err, req, res, next) => {
  console.error(err.stack || err);

  const { statusCode = 500, message } = err;

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: statusCode === 500 ? "An internal server error occurred" : message,
  });
};
