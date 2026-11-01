const { Router } = require('express');
const {
  listCollection,
  getSummary,
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/collection.controller');

const router = Router();

router.get('/', listCollection);
router.get('/summary', getSummary);
router.post('/', addItem);
router.put('/:cardId', updateItem);
router.delete('/:cardId', deleteItem);

module.exports = router;
