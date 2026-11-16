const pool = require('../db');

async function listFilters(req, res) {
  const { rows: rarities } = await pool.query(
    'SELECT DISTINCT rarity FROM cards WHERE rarity IS NOT NULL ORDER BY rarity'
  );
  const { rows: types } = await pool.query(
    'SELECT DISTINCT card_type FROM cards WHERE card_type IS NOT NULL ORDER BY card_type'
  );

  res.json({
    rarities: rarities.map((row) => row.rarity),
    types: types.map((row) => row.card_type),
  });
}

module.exports = { listFilters };
