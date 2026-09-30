// Thin wrapper around express-validator: run the declared validation chain,
// and short-circuit with 400 + field errors if anything failed. Centralizing
// this keeps controllers free of repeated boilerplate and is one of our
// defenses against injection / malformed-input attacks.
const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  return next();
}

module.exports = validate;
