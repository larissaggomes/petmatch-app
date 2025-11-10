const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Se estiver usando para lidar com exceções assíncronas
const User = require('../models/User'); // Ajuste o caminho para o seu modelo de usuário

/**
 * @desc Protege rotas, garantindo autenticação via Token JWT.
 * @param {Object} req - Objeto de Requisição do Express.
 * @param {Object} res - Objeto de Resposta do Express.
 * @param {Function} next - Função para passar para o próximo middleware.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Verificar se o cabeçalho Authorization existe e começa com 'Bearer '
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extrair o token (a string após 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 3. Usar jwt.verify() para decodificar
      // O JWT_SECRET deve estar definido nas suas variáveis de ambiente
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Se válido, buscar o usuário no DB e anexá-lo a req.user
      // Selecionamos o usuário pelo ID decodificado e removemos o campo de senha
      req.user = await User.findById(decoded.id).select('-password');
      
      // Se o usuário não for encontrado (ex: foi deletado), interrompe
      if (!req.user) {
        res.status(401); // Não Autorizado
        throw new Error('Usuário não encontrado.');
      }

      // 5. Chamar next()
      next();
    } catch (error) {
      console.error(error);
      // Retorna 401 se a verificação do token falhar ou o usuário não for encontrado
      res.status(401);
      throw new Error('Não autorizado, token inválido ou expirado.');
    }
  }

  // Se o token não existir (cabeçalho não enviado ou formato incorreto)
  if (!token) {
    // Retorna 401
    res.status(401);
    throw new Error('Não autorizado, nenhum token fornecido.');
  }
});

module.exports = { protect };