const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validate } = require('../validation/validate');
const { registerSchema, loginSchema } = require('../validation/auth.schema');

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);

module.exports = router;
