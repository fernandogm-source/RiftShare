const { z } = require('zod');

const usernameSchema = z
  .string({ error: 'El nombre de usuario debe ser texto' })
  .trim()
  .min(3, { error: 'El nombre de usuario debe tener al menos 3 caracteres' })
  .max(50, { error: 'El nombre de usuario no puede superar los 50 caracteres' });

const emailSchema = z
  .string({ error: 'El email debe ser texto' })
  .trim()
  .max(255, { error: 'El email no puede superar los 255 caracteres' })
  .email({ error: 'El email no es válido' })
  .transform((value) => value.toLowerCase());

const registerSchema = z.object(
  {
    username: usernameSchema,
    email: emailSchema,
    contraseña: z
      .string({ error: 'La contraseña debe ser texto' })
      .min(8, { error: 'La contraseña debe tener al menos 8 caracteres' }),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

const loginSchema = z.object(
  {
    email: emailSchema,
    contraseña: z
      .string()
      .min(1, { error: 'La contraseña es obligatoria' }),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

module.exports = { registerSchema, loginSchema };
