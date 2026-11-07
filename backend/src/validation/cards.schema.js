const { z } = require('zod');

const NUMERIC_FILTERS = ['might', 'energy', 'power'];

function optionalInteger(name) {
  return z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .coerce.number({ error: `${name} debe ser un número entero` })
      .int({ error: `${name} debe ser un número entero` })
      .optional()
  );
}

const cardFilterShape = {
  name: z.string({ error: 'name debe ser texto' }).optional(),
  set: z.string({ error: 'set debe ser texto' }).optional(),
  rarity: z.string({ error: 'rarity debe ser texto' }).optional(),
  type: z.string({ error: 'type debe ser texto' }).optional(),
  domain: z.string({ error: 'domain debe ser texto' }).optional(),
  might_min: optionalInteger('might_min'),
  might_max: optionalInteger('might_max'),
  energy_min: optionalInteger('energy_min'),
  energy_max: optionalInteger('energy_max'),
  power_min: optionalInteger('power_min'),
  power_max: optionalInteger('power_max'),
};

const paginationShape = {
  page: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .coerce.number({ error: 'page debe ser un número entero' })
      .int({ error: 'page debe ser un número entero' })
      .min(1, { error: 'page debe ser mayor o igual que 1' })
      .default(1)
  ),
  limit: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .coerce.number({ error: 'limit debe ser un número entero' })
      .int({ error: 'limit debe ser un número entero' })
      .min(1, { error: 'limit debe ser mayor o igual que 1' })
      .max(100, { error: 'limit no puede ser mayor que 100' })
      .default(20)
  ),
};

const cardListQuerySchema = z
  .object({ ...cardFilterShape, ...paginationShape })
  .superRefine((data, ctx) => {
    for (const column of NUMERIC_FILTERS) {
      const min = data[`${column}_min`];
      const max = data[`${column}_max`];

      if (min !== undefined && max !== undefined && min > max) {
        ctx.addIssue({
          code: 'custom',
          path: [`${column}_min`],
          message: `${column}_min no puede ser mayor que ${column}_max`,
        });
      }
    }
  });

const cardIdParamSchema = z.object({
  id: z
    .string({ error: 'El id de la carta es obligatorio' })
    .min(1, { error: 'El id de la carta es obligatorio' })
    .max(30, { error: 'El id de la carta no puede superar los 30 caracteres' }),
});

module.exports = { cardListQuerySchema, cardIdParamSchema };
