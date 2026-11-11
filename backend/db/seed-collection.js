const pool = require('../src/db');
const { MAX_QUANTITY } = require('../src/validation/collection.schema');

const USER_IDENTIFIER = process.argv[2];
const CARDS_TO_ADD = Number(process.argv[3] ?? 20);
const MAX_RANDOM_QUANTITY = 3;

async function seedCollection() {
  if (!USER_IDENTIFIER || !Number.isInteger(CARDS_TO_ADD) || CARDS_TO_ADD < 1) {
    console.error('Uso: npm run seed:collection -- <email|username> [numeroDeCartas]');
    process.exitCode = 1;
    await pool.end();
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: users } = await client.query(
      'SELECT id, username FROM users WHERE username = $1 OR email = LOWER($1)',
      [USER_IDENTIFIER]
    );
    if (users.length === 0) {
      throw new Error(`No existe ningún usuario con username o email "${USER_IDENTIFIER}"`);
    }
    const user = users[0];

    const { rows: cards } = await client.query(
      'SELECT id FROM cards ORDER BY RANDOM() LIMIT $1',
      [CARDS_TO_ADD]
    );

    for (const card of cards) {
      const quantity = Math.floor(Math.random() * MAX_RANDOM_QUANTITY) + 1;
      await client.query(
        `INSERT INTO collection_items (user_id, card_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, card_id) DO UPDATE
           SET quantity = LEAST(collection_items.quantity + EXCLUDED.quantity, $4)`,
        [user.id, card.id, quantity, MAX_QUANTITY]
      );
    }

    await client.query('COMMIT');
    console.log(`Colección de "${user.username}": ${cards.length} cartas añadidas o actualizadas.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al rellenar la colección, se han deshecho los cambios:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCollection();
