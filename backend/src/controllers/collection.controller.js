const pool = require('../db');
const {
  cardSelect,
  buildCardFilters,
  getPagination,
  paginationInfo,
} = require('../queries/cards.query');

const MAX_QUANTITY = 99;
const COLLECTION_COLUMNS = 'ci.quantity, ci.added_on,';
const COLLECTION_JOIN = 'JOIN collection_items ci ON ci.card_id = c.id';

function isValidQuantity(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}

async function listCollection(req, res) {
  const { where, values } = buildCardFilters(req.query);
  const { page, limit, offset } = getPagination(req.query);

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
    LEFT JOIN collection_items ci ON ci.card_id = c.id
    GROUP BY s.set_id, s.label
    ORDER BY s.set_id
  `);

  res.json(rows);
}

async function addItem(req, res) {
  const body = req.body ?? {};
  const cardId = body.card_id;
  const quantity = body.quantity === undefined ? 1 : body.quantity;

  if (typeof cardId !== 'string' || !isValidQuantity(quantity)) {
    return res.status(400).json({
      error: `Datos no válidos: card_id (texto) y quantity (entero de 1 a ${MAX_QUANTITY})`,
    });
  }

  const card = await pool.query('SELECT id FROM cards WHERE id = $1', [cardId]);
  if (card.rowCount === 0) {
    return res.status(404).json({ error: 'Carta no encontrada' });
  }

  const { rows } = await pool.query(
    `INSERT INTO collection_items (card_id, quantity)
     VALUES ($1, $2)
     ON CONFLICT (card_id) DO UPDATE
       SET quantity = LEAST(collection_items.quantity + EXCLUDED.quantity, ${MAX_QUANTITY})
     RETURNING card_id, quantity, added_on`,
    [cardId, quantity]
  );

  res.status(201).json(rows[0]);
}

async function updateItem(req, res) {
  const quantity = (req.body ?? {}).quantity;

  if (!isValidQuantity(quantity)) {
    return res.status(400).json({
      error: `Datos no válidos: quantity debe ser un entero de 1 a ${MAX_QUANTITY}`,
    });
  }

  const { rows } = await pool.query(
    `UPDATE collection_items
     SET quantity = $2
     WHERE card_id = $1
     RETURNING card_id, quantity, added_on`,
    [req.params.cardId, quantity]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'La carta no está en tu colección' });
  }

  res.json(rows[0]);
}

async function deleteItem(req, res) {
  const { rowCount } = await pool.query(
    'DELETE FROM collection_items WHERE card_id = $1',
    [req.params.cardId]
  );

  if (rowCount === 0) {
    return res.status(404).json({ error: 'La carta no está en tu colección' });
  }

  res.status(204).end();
}

module.exports = { listCollection, getSummary, addItem, updateItem, deleteItem };
