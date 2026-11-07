const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const TOKEN_EXPIRES_IN = '1h';

async function register(req, res) {
  const { username, email, contraseña } = req.body;

  const passwordHash = await argon2.hash(contraseña);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role`,
      [username, email, passwordHash]
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
  const { email, contraseña } = req.body;

  const { rows } = await pool.query(
    'SELECT id, username, email, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  const valid = user && (await argon2.verify(user.password_hash, contraseña));
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
