const { Router } = require('express');
const { listAdminCards, updateCard } = require('../controllers/admin.controller');
const { validate } = require('../validation/validate');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const {
  adminCardListQuerySchema,
  adminCardUpdateBodySchema,
  adminCardIdParamSchema,
} = require('../validation/admin.schema');

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/cards', validate({ query: adminCardListQuerySchema }), listAdminCards);
router.put(
  '/cards/:id',
  validate({ params: adminCardIdParamSchema, body: adminCardUpdateBodySchema }),
  updateCard
);

module.exports = router;
