import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import LivrosController, {
  authMiddleware,
} from "./src/app/controllers/LivrosController.js";
import UsuarioController from "./src/app/controllers/UsuarioController.js";
import conexao from "./src/app/database/conexao.js";

const app = express();
app.use(cookieParser());

// Usando import.meta.url para obter o caminho do diretório
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações e middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "main")));
app.use("/node_modules", express.static("node_modules"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

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
app.get("/help", (req, res) => {
  res.render("Help", { title: "ajuda" });
});
app.get("/", (req, res) => {
  res.render("Login", { title: "cadastrar usuario" });
});
app.get("/entrar", (req, res) => {
  res.render("Entrar", { title: "logar" });
});
app.get("/cadastrarLivros", authMiddleware, (req, res) => {
  res.render("CadLivros", { title: "cadastrar livros" });
});
app.get("/editarLivro", authMiddleware, (req, res) => {
  res.render("EditarLivros", { title: "editar livro" });
});
app.get("/registros", authMiddleware, (req, res) => {
  const buscarLivros = "SELECT * FROM livros"; 
  conexao.query(buscarLivros, (erro, livros) => {
    if (erro) {
      console.error("Erro ao buscar livros:", erro);
      return res.status(500).send("Erro ao buscar livros.");
    }

    res.render("Registros", { livros });
  });
});

// Rota de cadastrar usuário
app.post("/login", UsuarioController.cadastrarUser);

// Rota de confirmação de login
app.post("/login/entrar", UsuarioController.confirm);

//rota de cadastrar livros
app.post("/cadastrarlivros", authMiddleware, LivrosController.cadastrar);

//rota de registros onde vai da pra ver todos os livros cadastrados
app.get("/registros", authMiddleware, LivrosController.listarTudo);

//pegar o livro por id para editar
app.get("/editarlivros/:id", authMiddleware, LivrosController.buscar);

//rota de editar o livro
app.post("/editar", authMiddleware, LivrosController.atualizar);

//remover livros na aba de registros
app.get("/remover/:id", authMiddleware, LivrosController.deletar);
app.listen(8080);

console.log("servidor rodando na porta 8080")

export default app;
