const { Router } = require('express');
const { listSets } = require('../controllers/sets.controller');

const router = Router();

router.get('/', listSets);

module.exports = router;
