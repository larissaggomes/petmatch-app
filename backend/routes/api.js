const express = require("express");
const router = express.Router();
// const userController = require('../controllers/userController'); // Ajuste o caminho
// api.js (ou app.js)

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para processar JSON (necessário para receber dados de login/registro)
app.use(express.json());

// ----------------------------------------------------
// ✅ Adicionando as Rotas de Usuário
// O middleware router.use() adiciona um prefixo '/users' a todas as rotas definidas em userRoutes.js
// ----------------------------------------------------
app.use('/api/users', require('./userRoutes')); // Altere './userRoutes' se estiver em uma pasta diferente

// Rota de teste (Opcional)
app.get('/', (req, res) => {
  res.send('API Rodando...');
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// // Rota para o registro de novos usuários
// router.post('/register', userController.registerUser);


// IMPORTANTE:
// Certifique-se de que o caminho para './userRoutes' está correto
// em relação ao local onde api.js está sendo executado.

module.exports = router;