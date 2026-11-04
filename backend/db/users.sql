-- Usuarios. No se borran al recargar el catálogo.
DROP TABLE IF EXISTS sessions;

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'Client' CHECK (role IN ('Client', 'Admin'))
);
