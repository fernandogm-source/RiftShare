const { z } = require('zod');
const { usernameSchema } = require('./auth.schema');

const updateUsernameSchema = z.object(
  {
    username: usernameSchema,
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

const updatePasswordSchema = z.object(
  {
    contraseña_actual: z
      .string({ error: 'La contraseña actual es obligatoria' })
      .min(1, { error: 'La contraseña actual es obligatoria' }),
    contraseña_nueva: z
      .string({ error: 'La contraseña nueva debe ser texto' })
      .min(8, { error: 'La contraseña nueva debe tener al menos 8 caracteres' }),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

module.exports = { updateUsernameSchema, updatePasswordSchema };
