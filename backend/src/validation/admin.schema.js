const { z } = require('zod');
const { paginationShape } = require('./cards.schema');

const adminCardListQuerySchema = z.object({
  ...paginationShape,
  name: z.string({ error: 'name debe ser texto' }).optional(),
});

const adminCardUpdateBodySchema = z
  .object(
    {
      is_active: z.boolean({ error: 'is_active debe ser true o false' }).optional(),
      price: z
        .number({ error: 'El precio debe ser un número' })
        .min(0, { error: 'El precio no puede ser negativo' })
        .refine((valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-6, {
          error: 'El precio puede tener como máximo dos decimales',
        })
        .optional(),
    },
    { error: 'El cuerpo de la petición debe ser un objeto JSON' }
  )
  .refine((datos) => datos.is_active !== undefined || datos.price !== undefined, {
    error: 'Indica is_active o price para actualizar la carta',
  });

const adminCardIdParamSchema = z.object({
  id: z
    .string({ error: 'El id de la carta es obligatorio' })
    .min(1, { error: 'El id de la carta es obligatorio' })
    .max(30, { error: 'El id de la carta no puede superar los 30 caracteres' }),
});

module.exports = { adminCardListQuerySchema, adminCardUpdateBodySchema, adminCardIdParamSchema };
