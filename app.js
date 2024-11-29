import express from "express";
import mysql2 from "mysql2";
import { engine } from "express-handlebars";
const app = express();

app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"));
app.use("/css", express.static("./css"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(express.json()); //manipulação via jsonJ
app.use(express.urlencoded({ extended: false }));

//conexão com o banco de dados mysql
const conexao = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login",
});

conexao.connect(function (erro) {
  if (erro) throw erro;
  console.log("Banco de dados funcionando");
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

app.post("/entrar", (req, res) => {});

//rotas de cadastrar
app.post("/login", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;

  if (!nome || !email || !senha) {
    return res.status(400).send("preencher todos os dados.");
  }

  const sql = `INSERT INTO usuario(nome, email, senha) VALUES ('${nome}', '${email}', ${senha})`;
  conexao.query(sql, (erro, retorno) => {
    if (erro) {
      console.error(erro);
    } else {
      console.log("dados inseridos com sucesso");
    }
  });
  res.redirect("/entrar");
});

//cadastrar livros
app.post("/cadastrarlivros", (req, res) => {
  const titulo = req.body.titulo;
  const autor = req.body.autor;
  const generos = req.body.generos;
  const npaginas = req.body.npaginas;

  if (!titulo || !autor || !generos || !npaginas) {
    return res.status(400).send("preencher todos os dados.");
  }

  const sql = `INSERT INTO livros(titulo, autor, generos, npaginas) VALUES ('${titulo}', '${autor}', '${generos}', ${npaginas})`;
  conexao.query(sql, (erro, retorno) => {
    if (erro) {
      console.error(erro);
    } else {
      console.log("livro cadastrado");
    }
  });
  res.redirect("/");
});

app.listen(8080);
