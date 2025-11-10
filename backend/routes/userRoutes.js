// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ajuste o caminho conforme sua estrutura de pastas
const middleware = require('../middlewares/authMiddlewares');

// Rota POST para registrar um novo usuário
// LIGAÇÃO com userController.registerUser (Você deve criar esta função)
router.post('/register', userController.registerUser);

// Rota POST para autenticação e login de usuário
// LIGAÇÃO com userController.loginUser (A função que criamos anteriormente)
router.post('/login', userController.loginUser);

// A rota só será acessada se a função 'protect' passar
router.get('/profile', middleware.protect, userController.getMe);

module.exports = router;