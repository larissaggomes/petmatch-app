const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // Importe seu modelo de usuário do banco de dados

// Salva apenas o ID do usuário na sessão (para ocupar menos espaço)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Usa o ID salvo para buscar o usuário completo no banco de dados
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // Certifique-se de que esta URL está autorizada no Google Console
  },
  async (accessToken, refreshToken, profile, done) => {
    // 3. No callback, verificar se o usuário existe no DB
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Usuário já existe, prossegue o login
        return done(null, user);
      } else {
        // 4. Se novo, salvar o usuário no DB
        user = await new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          // Adicione outros campos que desejar salvar
        }).save();

        // 5. Chamar a função done(null, user)
        return done(null, user);
      }
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  }
));