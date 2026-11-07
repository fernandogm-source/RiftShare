const { Router } = require('express');
const {
  listCollection,
  getSummary,
  getQuantities,
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/collection.controller');
const { validate } = require('../validation/validate');
const { requireAuth } = require('../middleware/auth.middleware');
const { cardListQuerySchema } = require('../validation/cards.schema');
const {
  addItemSchema,
  updateItemSchema,
  collectionCardIdParamSchema,
} = require('../validation/collection.schema');

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: cardListQuerySchema }), listCollection);
router.get('/summary', getSummary);
router.get('/quantities', getQuantities);
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
