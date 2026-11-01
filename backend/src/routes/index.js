const { Router } = require('express');
const cardsRoutes = require('./cards.routes');
const setsRoutes = require('./sets.routes');
const domainsRoutes = require('./domains.routes');
const collectionRoutes = require('./collection.routes');
const authRoutes = require('./auth.routes');

const router = Router();

router.use('/cards', cardsRoutes);
router.use('/sets', setsRoutes);
router.use('/domains', domainsRoutes);
router.use('/collection', collectionRoutes);
router.use('/auth', authRoutes);

module.exports = router;
