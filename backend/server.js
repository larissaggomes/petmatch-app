const express = require("express");
const path = require("path");
require('dotenv').config();
const dataBaseConnect = require("./db");
passport = require("passport");
require("./config/passport"); // Carrega a configuração do Passport

const userRoutes = require("./routes/userRoutes");
const passport = require("passport");

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = 3000;
const DB_URL = process.env.DATABASE_URL;
console.log(`URI de Conexão sendo usada: ${DB_URL}`);
dataBaseConnect();

app.use(express.static(path.join(__dirname, "frontend")));

app.use("/api", userRoutes);
app.use(passport.initialize());

app.listen(PORT, ()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})
