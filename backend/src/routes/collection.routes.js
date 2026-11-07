const { Router } = require('express');
const {
  listCollection,
  getSummary,
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/collection.controller');
const { validate } = require('../validation/validate');
const { cardListQuerySchema } = require('../validation/cards.schema');
const {
  addItemSchema,
  updateItemSchema,
  collectionCardIdParamSchema,
} = require('../validation/collection.schema');

const router = Router();

router.get('/', validate({ query: cardListQuerySchema }), listCollection);
router.get('/summary', getSummary);
router.post('/', validate({ body: addItemSchema }), addItem);
router.put(
  '/:cardId',
  validate({ params: collectionCardIdParamSchema, body: updateItemSchema }),
  updateItem
);
router.delete(
  '/:cardId',
  validate({ params: collectionCardIdParamSchema }),
  deleteItem
);

module.exports = router;
