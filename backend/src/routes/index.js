const { Router } = require('express');
const cardsRoutes = require('./cards.routes');
const setsRoutes = require('./sets.routes');
const domainsRoutes = require('./domains.routes');
const collectionRoutes = require('./collection.routes');
const authRoutes = require('./auth.routes');
const filtersRoutes = require('./filters.routes');
const adminRoutes = require('./admin.routes');
const usersRoutes = require('./users.routes');

const router = Router();

router.use('/cards', cardsRoutes);
router.use('/sets', setsRoutes);
router.use('/domains', domainsRoutes);
router.use('/filters', filtersRoutes);
router.use('/admin', adminRoutes);
router.use('/users', usersRoutes);
router.use('/collection', collectionRoutes);
router.use('/auth', authRoutes);

module.exports = router;
