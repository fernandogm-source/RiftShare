const fs = require('fs');
const path = require('path');
const pool = require('../src/db');

const CARDS_FILE = path.join(__dirname, '..', '..', 'cards.json');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const COLLECTION_FILE = path.join(__dirname, 'collection.sql');

async function getOrCreate(client, table, name, cache) {
  if (cache.has(name)) return cache.get(name);
  const { rows } = await client.query(
    `INSERT INTO ${table} (name) VALUES ($1) RETURNING id`,
    [name]
  );
  cache.set(name, rows[0].id);
  return rows[0].id;
}

async function seed() {
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const collection = fs.readFileSync(COLLECTION_FILE, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(schema);

    const setsCache = new Set();
    const domainsCache = new Map();
    const tagsCache = new Map();

    for (const card of cards) {
      if (!setsCache.has(card.set.set_id)) {
        setsCache.add(card.set.set_id);
        await client.query(
          'INSERT INTO sets (set_id, label) VALUES ($1, $2)',
          [card.set.set_id, card.set.label]
        );
      }

      await client.query(
        `INSERT INTO cards (
          id, name, riftbound_id, tcgplayer_id, collector_number,
          energy, might, power, card_type, supertype, rarity,
          text_rich, text_plain, flavour, set_id, artist, image_url,
          accessibility_text, clean_name, orientation,
          alternate_art, overnumbered, signature, is_new, updated_on
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
        )`,
        [
          card.id,
          card.name,
          card.riftbound_id,
          card.tcgplayer_id ?? null,
          card.collector_number,
          card.attributes.energy,
          card.attributes.might,
          card.attributes.power,
          card.classification.type,
          card.classification.supertype,
          card.classification.rarity,
          card.text.rich,
          card.text.plain,
          card.text.flavour,
          card.set.set_id,
          card.media.artist,
          card.media.image_url,
          card.media.accessibility_text,
          card.metadata.clean_name,
          card.orientation,
          card.metadata.alternate_art,
          card.metadata.overnumbered,
          card.metadata.signature,
          card.new ?? null,
          card.metadata.updated_on,
        ]
      );

      for (const domain of card.classification.domain) {
        const domainId = await getOrCreate(client, 'domains', domain, domainsCache);
        await client.query(
          'INSERT INTO card_domains (card_id, domain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [card.id, domainId]
        );
      }

      for (const tag of card.tags) {
        const tagId = await getOrCreate(client, 'tags', tag, tagsCache);
        await client.query(
          'INSERT INTO card_tags (card_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [card.id, tagId]
        );
      }
    }

    await client.query(collection);

    await client.query('COMMIT');
    console.log(
      `Carga completada: ${cards.length} cartas, ${setsCache.size} sets, ` +
      `${domainsCache.size} dominios, ${tagsCache.size} tags.`
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la carga, se han deshecho los cambios:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
