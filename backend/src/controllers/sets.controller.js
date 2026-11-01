const pool = require('../db');

async function listSets(req, res) {
  const { rows } = await pool.query(
    'SELECT set_id, label FROM sets ORDER BY set_id'
  );
  res.json(rows);
}

module.exports = { listSets };
