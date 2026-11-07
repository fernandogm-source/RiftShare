const { ZodError } = require('zod');

function formatZodError(error) {
  return error.issues.map((issue) => issue.message).join('; ');
}

function zodErrorBody(error) {
  return {
    error: formatZodError(error),
    details: error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body ?? {});
      }
      if (query) {
        req.validatedQuery = query.parse(req.query);
      }
      if (params) {
        req.validatedParams = params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(zodErrorBody(error));
      }
      next(error);
    }
  };
}

module.exports = { validate, zodErrorBody };
