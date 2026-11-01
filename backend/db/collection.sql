-- Tabla de la colección del usuario. No se borra al recargar el catálogo.
CREATE TABLE IF NOT EXISTS collection_items (
  card_id   VARCHAR(30) PRIMARY KEY,
  quantity  INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  added_on  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
