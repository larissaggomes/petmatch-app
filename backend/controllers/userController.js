// user.controller.js
const User = require('../models/User'); // Ajuste o caminho conforme sua estrutura
const bcrypt = require('bcrypt'); // Biblioteca para comparação de senhas
const jwt = require('jsonwebtoken'); // Biblioteca para geração de tokens
const asyncHandler = require('express-async-handler');

// 2. Importar a função de geração de Token
const { generateToken } = require('../utils/authUtils'); // <-- IMPORTADO AQUI!

// Certifique-se de que esta variável de ambiente está definida no seu .env
const JWT_SECRET = process.env.JWT_SECRET; 

/**
 * @desc Autentica um usuário e retorna um token de acesso
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res) => {
    // 1. Receber credenciais do corpo da requisição
    const { email, password } = req.body;

    // 2. Validação básica
    if (!email || !password) {
        // Retorna 400 Bad Request se faltar e-mail ou senha
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        // 3. Buscar o usuário pelo e-mail no banco de dados
        const user = await User.findOne({ email });

        // 4. Verificar se o usuário existe
        if (!user) {
            // Retorna 401 Unauthorized se o usuário não for encontrado
            return res.status(401).json({ message: 'Credenciais inválidas ou não autorizadas.' });
        }

        // 5. Comparar a senha fornecida com a senha hash armazenada
        // O bcrypt.compare retorna true ou false
        const isMatch = await bcrypt.compare(password, user.password);

        // 6. Verificar a correspondência de senhas
        if (user && isMatch) {
            
            // 7. Geração do Token JWT (JSON Web Token)
            const token = jwt.sign(
                // Payload (dados a serem armazenados no token)
                { userId: user._id, email: user.email },
                // Chave Secreta para Assinatura (MUITO IMPORTANTE!)
                JWT_SECRET,
                // Opções (Token expira em 30 dias)
                { expiresIn: '30d' } 
            );

            // 8. Sucesso: Retorna o token gerado (e dados básicos do usuário)
            return res.status(200).json({ 
                _id: user._id,
                email: user.email,
                token: token,
                message: 'Login bem-sucedido.'
            });

        } else {
            // 9. Falha na senha
            // Retorna 401 Unauthorized se a senha estiver incorreta
            return res.status(401).json({ message: 'Credenciais inválidas ou não autorizadas.' });
        }

    } catch (error) {
        // 10. Lidar com erros de servidor ou banco de dados
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const registerUser = async (req, res) => {
    // 3. Extrair dados do corpo da requisição
    const { 
        name, 
        email, 
        password // O campo do frontend deve se chamar 'password'
    } = req.body;

    // 4. Validação básica (opcional, mas recomendado)
    if (!name || !email || !password) {
        return res.status(400).json({ 
            message: "Por favor, preencha todos os campos obrigatórios: nome, email e senha." 
        });
    }

    try {
        // 5. Verificar se o usuário já existe
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Se o email já estiver em uso, retorna um erro 409 Conflict
            return res.status(409).json({ 
                message: "O email fornecido já está registrado." 
            });
        }

        // 6. Criar uma nova instância do usuário
        const newUser = new User({
            name,
            email,
            // O hook 'pre' em User.js irá criptografar este valor
            passwordHash: password, 
            phone: req.body.phone,
            location: req.body.location
        });

        // 7. Salvar o novo usuário no banco de dados
        const savedUser = await newUser.save();
        
        // 8. 🔑 GERAR O TOKEN DE AUTENTICAÇÃO
        // O usuário é automaticamente logado após o registro.
        const token = generateToken(savedUser._id);
        
        // 9. Retornar uma resposta de sucesso (incluindo o token)
        const userResponse = {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt,
            // Inclua o token na resposta
            token: token, // <-- TOKEN ADICIONADO AQUI!
        };

        return res.status(201).json({
            message: "Usuário registrado e logado com sucesso!",
            user: userResponse
        });

    } catch (error) {
        console.error("Erro ao registrar o usuário:", error);
        return res.status(500).json({ 
            message: "Erro interno do servidor ao tentar registrar o usuário.",
            error: error.message
        });
    }
};

const getMe = asyncHandler(async (req, res) => {
  // A propriedade 'req.user' foi definida no middleware 'protect'
  // e contém todos os dados do usuário (exceto a senha) buscados no DB.

  // 1. Verificar se req.user existe (Embora o middleware 'protect' garanta isso, é uma boa prática)
  if (!req.user) {
    res.status(404);
    throw new Error('Usuário não encontrado.');
  }

  // 2. Retornar o objeto req.user
  // Se você quiser customizar a resposta, pode retornar apenas campos específicos:
  // res.status(200).json({
  //   id: req.user._id,
  //   email: req.user.email,
  //   name: req.user.name,
  // });

  // No entanto, retornar o objeto completo é o mais comum para este tipo de função:
  res.status(200).json(req.user);
});

// Exportar a função para ser usada nas rotas
module.exports = {
    registerUser,
    loginUser,
    getMe,
    // (outras funções de login, update, delete...)
};