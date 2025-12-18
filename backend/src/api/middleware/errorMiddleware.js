export function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status,
    error: err.name || 'Error',
    message,
    stack: process.env.NODE_ENV === 'production' ? err.stack : undefined
  });
}
