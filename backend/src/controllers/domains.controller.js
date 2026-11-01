const pool = require('../db');

async function listDomains(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name FROM domains ORDER BY name'
  );
  res.json(rows);
}

module.exports = { listDomains };
