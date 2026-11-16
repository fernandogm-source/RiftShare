const pool = require('../db');
const { getPagination, paginationInfo } = require('../queries/cards.query');

async function listAdminCards(req, res) {
  const query = req.validatedQuery;
  const { page, limit, offset } = getPagination(query);

  const values = [];
  let where = '';

  if (query.name) {
    values.push(`%${query.name}%`);
    where = `WHERE c.name ILIKE $${values.length}`;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM cards c ${where}`,
    values
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.set_id, c.card_type, c.rarity, c.image_url, c.is_active, c.price
       FROM cards c
       ${where}
      ORDER BY c.set_id, c.collector_number, c.id
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  res.json({ data: rows, pagination: paginationInfo(page, limit, total) });
}

async function updateCard(req, res) {
  const { id } = req.validatedParams;
  const { is_active: isActive, price } = req.body;

  const valores = [id];
  const cambios = [];

  if (isActive !== undefined) {
    valores.push(isActive);
    cambios.push(`is_active = $${valores.length}`);
  }

  if (price !== undefined) {
    valores.push(price);
    cambios.push(`price = $${valores.length}`);
  }

  const { rows } = await pool.query(
    `UPDATE cards SET ${cambios.join(', ')} WHERE id = $1
     RETURNING id, name, is_active, price`,
    valores
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Carta no encontrada' });
  }

  res.json(rows[0]);
}

module.exports = { listAdminCards, updateCard };
