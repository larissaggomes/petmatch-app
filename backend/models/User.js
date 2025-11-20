const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // 1. Importar o bcryptjs

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false }, // Mantenha o nome do campo como está
  phone: String,
  location: String,
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
  createdAt: { type: Date, default: Date.now }
});

// 2. Criar o hook pre-save (Middleware)
// Usamos uma função 'async' para poder usar 'await' com as funções do bcryptjs
userSchema.pre('save', async function(next) {
    const user = this;

    // Apenas criptografa a senha se ela foi modificada (ou for nova)
    if (!user.isModified('passwordHash')) {
        return next();
    }

    try {
        // Gera o 'salt'
        const salt = await bcrypt.genSalt(10); 
        
        // Gera o 'hash' (senha criptografada)
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        
        // Passa para a próxima função middleware/save
        next();
    } catch (error) {
        // Se houver erro, passa o erro adiante
        next(error);
    }
});

// 3. Método para comparar a senha (opcional, mas muito útil)
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);