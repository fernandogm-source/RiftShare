const { Router } = require('express');
const { getMe, updateUsername, updatePassword } = require('../controllers/users.controller');
const { validate } = require('../validation/validate');
const { requireAuth } = require('../middleware/auth.middleware');
const { updateUsernameSchema, updatePasswordSchema } = require('../validation/users.schema');

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', validate({ body: updateUsernameSchema }), updateUsername);
router.put('/me/password', validate({ body: updatePasswordSchema }), updatePassword);

module.exports = router;
