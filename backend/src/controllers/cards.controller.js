const pool = require('../db');
const {
  cardSelect,
  buildCardFilters,
  getPagination,
  paginationInfo,
} = require('../queries/cards.query');

async function listCards(req, res) {
  const { where, values } = buildCardFilters(req.query);
  const { page, limit, offset } = getPagination(req.query);

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM cards c ${where}`,
    values
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `${cardSelect()}
     ${where}
     ORDER BY s.set_id, c.collector_number, c.id
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  res.json({ data: rows, pagination: paginationInfo(page, limit, total) });
}

async function getCard(req, res) {
  const { rows } = await pool.query(`${cardSelect()} WHERE c.id = $1`, [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Carta no encontrada' });
  }

  res.json(rows[0]);
}

module.exports = { listCards, getCard };
