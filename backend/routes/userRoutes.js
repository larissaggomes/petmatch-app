// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ajuste o caminho conforme sua estrutura de pastas
const middleware = require('../middlewares/authMiddlewares');
const passport = require('../config/passport'); // Certifique-se de carregar a configuração do Passport

// Rota que inicia a autenticação (opcional, mas útil ter aqui)
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de Callback após autenticação com o Google
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), userController.googleAuthCallback);

// Rota POST para registrar um novo usuário
// LIGAÇÃO com userController.registerUser (Você deve criar esta função)
router.post('/users/register', userController.registerUser);

// Rota POST para autenticação e login de usuário
// LIGAÇÃO com userController.loginUser (A função que criamos anteriormente)
router.post('/users/login', userController.loginUser);

// A rota só será acessada se a função 'protect' passar
router.get('/users/profile', middleware.protect, userController.getMe);

module.exports = router;