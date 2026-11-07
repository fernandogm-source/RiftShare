const pool = require('../db');
const {
  cardSelect,
  buildCardFilters,
  getPagination,
  paginationInfo,
} = require('../queries/cards.query');
const { MAX_QUANTITY } = require('../validation/collection.schema');

const COLLECTION_COLUMNS = 'ci.quantity, ci.added_on,';
const COLLECTION_JOIN = 'JOIN collection_items ci ON ci.card_id = c.id';

async function listCollection(req, res) {
  const query = req.validatedQuery;
  const filters = buildCardFilters(query);
  const { page, limit, offset } = getPagination(query);

  const values = [...filters.values, req.user.id];
  const userCondition = `ci.user_id = $${values.length}`;
  const where = filters.where
    ? `${filters.where} AND ${userCondition}`
    : `WHERE ${userCondition}`;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM collection_items ci
     JOIN cards c ON c.id = ci.card_id
     ${where}`,
    values
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `${cardSelect(COLLECTION_COLUMNS, COLLECTION_JOIN)}
     ${where}
     ORDER BY s.set_id, c.collector_number, c.id
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  res.json({ data: rows, pagination: paginationInfo(page, limit, total) });
}

async function getSummary(req, res) {
  const { rows } = await pool.query(`
    SELECT s.set_id,
      s.label,
      COUNT(c.id)::int AS total_cards,
      COUNT(ci.card_id)::int AS owned_cards,
      COALESCE(SUM(ci.quantity), 0)::int AS total_copies
    FROM sets s
    JOIN cards c ON c.set_id = s.set_id
    LEFT JOIN collection_items ci ON ci.card_id = c.id AND ci.user_id = $1
    GROUP BY s.set_id, s.label
    ORDER BY s.set_id
  `, [req.user.id]);

  res.json(rows);
}

async function getQuantities(req, res) {
  const { rows } = await pool.query(
    'SELECT card_id, quantity FROM collection_items WHERE user_id = $1',
    [req.user.id]
  );

  const cantidades = Object.fromEntries(rows.map((row) => [row.card_id, row.quantity]));

  res.json(cantidades);
}

async function addItem(req, res) {
  const { card_id: cardId, quantity } = req.body;

  const card = await pool.query('SELECT id FROM cards WHERE id = $1', [cardId]);
  if (card.rowCount === 0) {
    return res.status(404).json({ error: 'Carta no encontrada' });
  }

  const { rows } = await pool.query(
    `INSERT INTO collection_items (user_id, card_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, card_id) DO UPDATE
       SET quantity = LEAST(collection_items.quantity + EXCLUDED.quantity, ${MAX_QUANTITY})
     RETURNING card_id, quantity, added_on`,
    [req.user.id, cardId, quantity]
  );

  res.status(201).json(rows[0]);
}

async function updateItem(req, res) {
  const { quantity } = req.body;
  const { cardId } = req.validatedParams;

  const { rows } = await pool.query(
    `UPDATE collection_items
     SET quantity = $2
     WHERE card_id = $1 AND user_id = $3
     RETURNING card_id, quantity, added_on`,
    [cardId, quantity, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'La carta no está en tu colección' });
  }

  res.json(rows[0]);
}

async function deleteItem(req, res) {
  const { cardId } = req.validatedParams;

  const { rowCount } = await pool.query(
    'DELETE FROM collection_items WHERE card_id = $1 AND user_id = $2',
    [cardId, req.user.id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ error: 'La carta no está en tu colección' });
  }

  res.status(204).end();
}

module.exports = { listCollection, getSummary, getQuantities, addItem, updateItem, deleteItem };
