const pool = require('../db');

async function requireAdmin(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);

    if (rows.length === 0 || rows[0].role !== 'Admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdmin };
