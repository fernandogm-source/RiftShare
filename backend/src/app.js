const path = require('path');
const express = require('express');
const { ZodError } = require('zod');
const apiRoutes = require('./routes');
const { zodErrorBody } = require('./validation/validate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', apiRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }

  if (err instanceof ZodError) {
    return res.status(400).json(zodErrorBody(err));
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

module.exports = app;
