-- Colección de cada usuario. No se borra al recargar el catálogo.
CREATE TABLE IF NOT EXISTS collection_items (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id   VARCHAR(30) NOT NULL,
  quantity  INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  added_on  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, card_id)
);

-- Migración: tablas creadas antes de existir user_id. Las filas sin dueño se eliminan.
ALTER TABLE collection_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
DELETE FROM collection_items WHERE user_id IS NULL;
ALTER TABLE collection_items ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'collection_items'::regclass AND contype = 'p'
      AND array_length(conkey, 1) = 2
  ) THEN
    ALTER TABLE collection_items DROP CONSTRAINT IF EXISTS collection_items_pkey;
    ALTER TABLE collection_items ADD PRIMARY KEY (user_id, card_id);
  END IF;
END $$;

-- Restaura la clave foránea que se pierde al recrear la tabla cards.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'collection_items_card_id_fkey'
  ) THEN
    DELETE FROM collection_items WHERE card_id NOT IN (SELECT id FROM cards);
    ALTER TABLE collection_items
      ADD CONSTRAINT collection_items_card_id_fkey
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
  END IF;
END $$;
