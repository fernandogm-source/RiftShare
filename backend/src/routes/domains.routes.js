const { Router } = require('express');
const { listDomains } = require('../controllers/domains.controller');

const router = Router();

router.get('/', listDomains);

module.exports = router;
