const { Router } = require('express');
const { listCards, getCard } = require('../controllers/cards.controller');

const router = Router();

router.get('/', listCards);
router.get('/:id', getCard);

module.exports = router;
