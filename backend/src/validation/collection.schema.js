const { z } = require('zod');

const MAX_QUANTITY = 99;

const quantitySchema = z
  .number({ error: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` })
  .int({ error: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` })
  .min(1, { error: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` })
  .max(MAX_QUANTITY, { error: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` });

const addItemSchema = z.object(
  {
    card_id: z
      .string({ error: 'card_id es obligatorio' })
      .min(1, { error: 'card_id es obligatorio' })
      .max(30, { error: 'card_id no puede superar los 30 caracteres' }),
    quantity: quantitySchema.default(1),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

const updateItemSchema = z.object(
  {
    quantity: quantitySchema,
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' }
);

const collectionCardIdParamSchema = z.object({
  cardId: z
    .string({ error: 'El id de la carta es obligatorio' })
    .min(1, { error: 'El id de la carta es obligatorio' })
    .max(30, { error: 'El id de la carta no puede superar los 30 caracteres' }),
});

module.exports = {
  MAX_QUANTITY,
  addItemSchema,
  updateItemSchema,
  collectionCardIdParamSchema,
};
