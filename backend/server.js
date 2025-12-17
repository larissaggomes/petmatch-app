const express = require("express");
const path = require("path");
require('dotenv').config();
const dataBaseConnect = require("./db");
const session = require('express-session');
const passport = require('passport');

const userRoutes = require("./routes/userRoutes");
require('./config/passport');

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = 3000;
const DB_URL = process.env.DATABASE_URL;
console.log(`URI de Conexão sendo usada: ${DB_URL}`);
dataBaseConnect();
console.log("Conexão com o banco de dados estabelecida com sucesso!");
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Defina como true se usar HTTPS
}));

app.use(express.static(path.join(__dirname, "frontend")));

app.use("/api", userRoutes);
app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})
