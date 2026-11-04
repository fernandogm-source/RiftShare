const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const TOKEN_EXPIRES_IN = '1h';
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  const { username, email, password } = req.body ?? {};

  if (
    typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 50 ||
    typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255 ||
    typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH
  ) {
    return res.status(400).json({
      error: `Datos no válidos: username (3-50 caracteres), email válido y password (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`,
    });
  }

  const passwordHash = await argon2.hash(password);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role`,
      [username.trim(), email.toLowerCase(), passwordHash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de usuario o el email ya están registrados' });
    }
    throw err;
  }
}

async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Datos no válidos: email y password son obligatorios' });
  }

  const { rows } = await pool.query(
    'SELECT id, username, email, role, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];

  const valid = user && (await argon2.verify(user.password_hash, password));
  if (!valid) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el .env');
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: TOKEN_EXPIRES_IN }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
}

module.exports = { register, login };
