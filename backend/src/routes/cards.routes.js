const { Router } = require('express');
const { listCards, getCard } = require('../controllers/cards.controller');
const { validate } = require('../validation/validate');
const { cardListQuerySchema, cardIdParamSchema } = require('../validation/cards.schema');

const router = Router();

router.get('/', validate({ query: cardListQuerySchema }), listCards);
router.get('/:id', validate({ params: cardIdParamSchema }), getCard);

module.exports = router;
