const jwt = require('jsonwebtoken');

const TOKEN_EXPIRES_IN = '1h';

function firmarToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el .env');
  }

  return jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: TOKEN_EXPIRES_IN }
  );
}

module.exports = { firmarToken };
