-- Elimina y vuelve a crear todas las tablas (orden por dependencias)
DROP TABLE IF EXISTS card_tags CASCADE;
DROP TABLE IF EXISTS card_domains CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS sets CASCADE;

CREATE TABLE sets (
  set_id VARCHAR(10) PRIMARY KEY,
  label  VARCHAR(150) NOT NULL
);

CREATE TABLE cards (
  id                 VARCHAR(30) PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  riftbound_id       VARCHAR(50) NOT NULL,
  tcgplayer_id       VARCHAR(20),
  collector_number   INTEGER NOT NULL,
  energy             INTEGER,
  might              INTEGER,
  power              INTEGER,
  card_type          VARCHAR(30) NOT NULL,
  supertype          VARCHAR(50),
  rarity             VARCHAR(30) NOT NULL,
  text_rich          TEXT,
  text_plain         TEXT,
  flavour            TEXT,
  set_id             VARCHAR(10) NOT NULL REFERENCES sets(set_id),
  artist             VARCHAR(150),
  image_url          TEXT,
  accessibility_text TEXT,
  clean_name         VARCHAR(150),
  orientation        VARCHAR(20),
  alternate_art      BOOLEAN NOT NULL DEFAULT FALSE,
  overnumbered       BOOLEAN NOT NULL DEFAULT FALSE,
  signature          BOOLEAN NOT NULL DEFAULT FALSE,
  is_new             BOOLEAN,
  updated_on         TIMESTAMPTZ
);

CREATE TABLE domains (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE card_domains (
  card_id   VARCHAR(30) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, domain_id)
);

CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE card_tags (
  card_id VARCHAR(30) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);

CREATE INDEX idx_cards_riftbound_id ON cards(riftbound_id);
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_card_type ON cards(card_type);
CREATE INDEX idx_cards_set_id ON cards(set_id);
