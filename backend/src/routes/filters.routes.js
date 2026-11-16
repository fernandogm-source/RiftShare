const { Router } = require('express');
const { listFilters } = require('../controllers/filters.controller');

const router = Router();

router.get('/', listFilters);

module.exports = router;
