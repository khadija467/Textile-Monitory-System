/**
 * Standard success response shape used across all controllers.
 */
function success(res, statusCode, message, data = null, meta = null) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Standard error response shape used across all controllers.
 */
function error(res, statusCode, message, errors = null) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, error };
