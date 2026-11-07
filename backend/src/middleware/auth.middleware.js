const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [esquema, token] = cabecera.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token de autenticación' });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el .env');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), username: payload.username, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token no válido o caducado' });
  }
}

module.exports = { requireAuth };
