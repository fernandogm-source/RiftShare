const crypto = require('crypto');
const argon2 = require('argon2');
const pool = require('../db');

const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 60 * 60;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSessionToken(req) {
  const cookies = req.headers.cookie ?? '';
  const pair = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return pair ? pair.slice(SESSION_COOKIE.length + 1) : null;
}

function sessionCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

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

  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [token, user.id]
  );

  res.setHeader('Set-Cookie', sessionCookie(token, SESSION_MAX_AGE));
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
}

async function logout(req, res) {
  const token = getSessionToken(req);

  if (token) {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  res.setHeader('Set-Cookie', sessionCookie('', 0));
  res.status(204).end();
}

module.exports = { register, login, logout };
