/**
 * Global error handler — must be registered last, after all routes.
 * Converts thrown errors, Mongoose validation errors, and duplicate-key
 * errors into a consistent JSON shape instead of leaking stack traces
 * or crashing the process.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error (e.g. missing required field)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already in use`;
  }

  // Mongoose bad ObjectId (e.g. /api/users/not-a-valid-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  console.error(err.stack);

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Catches requests to routes that don't exist — register right before
 * errorHandler so unmatched routes also get a clean JSON 404 instead of
 * Express's default HTML page.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
