import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import LivrosController from "./src/app/controllers/LivrosController.js";
import UsuarioController from "./src/app/controllers/UsuarioController.js";

const app = express();

// Usando import.meta.url para obter o caminho do diretório
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações e middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "main")));
app.use("/node_modules", express.static("node_modules"));
app.use("/css", express.static(path.join(__dirname, "css")));

// Configurar o motor de templates Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.CHAVE_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.sucess_msg = req.flash("sucess_msg");
  res.locals.erro_msg = req.flash("error_msg");
  next();
});

//rotas de renderização da rota
app.get("/", (req, res) => {
  res.render("inicio");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/entrar", (req, res) => {
  res.render("entrar");
});

app.get("/cadastrarlivros", (req, res) => {
  res.render("livros");
});
app.get("/ajuda", (req, res) => {
  res.render("help");
});

app.get("/registros", (req, res) => {
  res.render("registros");
});

// Rota de cadastrar usuário
app.post("/login", UsuarioController.cadastrarUser);

// Rota de confirmação de login
app.post("/login/entrar", UsuarioController.confirm);

//rota de cadastrar livros
app.post("/cadastrarlivros", LivrosController.cadastrar);

//rota de registros onde vai da pra ver todos os livros cadastrados
app.get("/registros", LivrosController.listarTudo);

//pegar o livro por id para editar
app.get("/editarlivros/:id", LivrosController.buscar);

//rota de editar o livro
app.post("/editar", LivrosController.atualizar);

//remover livros na aba de registros
app.get("/remover/:id", LivrosController.deletar);
app.listen(8080);
