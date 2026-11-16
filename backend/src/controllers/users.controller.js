const argon2 = require('argon2');
const pool = require('../db');
const { firmarToken } = require('../utils/token');

async function getMe(req, res) {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.role,
       COALESCE((
         SELECT SUM(ci.quantity)
         FROM collection_items ci
         JOIN cards c ON c.id = ci.card_id
         WHERE ci.user_id = u.id AND c.is_active = TRUE
       ), 0)::int AS total_copies,
       COALESCE((
         SELECT ROUND(SUM(ci.quantity * c.price), 2)
         FROM collection_items ci
         JOIN cards c ON c.id = ci.card_id
         WHERE ci.user_id = u.id AND c.is_active = TRUE
       ), 0)::float AS valor_coleccion
     FROM users u
     WHERE u.id = $1`,
    [req.user.id]
  );

  res.json(rows[0]);
}

async function updateUsername(req, res) {
  const { username } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE users SET username = $2 WHERE id = $1
       RETURNING id, username, email, role`,
      [req.user.id, username]
    );

    const user = rows[0];
    res.json({ token: firmarToken(user), user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }
    throw err;
  }
}

async function updatePassword(req, res) {
  const { contraseña_actual: actual, contraseña_nueva: nueva } = req.body;

  const { rows } = await pool.query(
    'SELECT id, username, email, role, password_hash FROM users WHERE id = $1',
    [req.user.id]
  );
  const user = rows[0];

  const valida = user && (await argon2.verify(user.password_hash, actual));
  if (!valida) {
    return res.status(400).json({ error: 'La contraseña actual no es correcta' });
  }

  const passwordHash = await argon2.hash(nueva);
  await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, passwordHash]);

  res.json({
    token: firmarToken(user),
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
}

module.exports = { getMe, updateUsername, updatePassword };
