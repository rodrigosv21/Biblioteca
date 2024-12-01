import express from "express";
import mysql2 from "mysql2";
import { engine } from "express-handlebars";
const app = express();

app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"));
app.use("/css", express.static("./css"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(express.json());
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
  const data = {
    imagem1: "images/images.logo.jpg",
  };
  res.render("inicio", data);
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

app.get("/registros", (req, res) => {
  const sql = "SELECT * FROM livros";

  conexao.query(sql, function (erro, retorno) {
    res.render("registros", { livros: retorno });
  });
});

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
  res.redirect("/cadastrarlivros");
});

app.get("/remover/:id", (req, res) => {
  const sql = `DELETE FROM livros WHERE id = ${req.params.id}`;

  conexao.query(sql, function (erro, retorno) {
    if (erro) throw erro;

    res.redirect("/listarlivros");
  });
});

app.get("/editarlivros/:id", (req, res) => {
  let sql = `SELECT * FROM livros WHERE id = ${req.params.id}`;

  conexao.query(sql, (erro, retorno) => {
    if (erro) throw erro;

    res.render("./editarlivros", { livros: retorno[0] });
  });
});
app.post("/editar", (req, res) => {
  const titulo = req.body.titulo;
  const autor = req.body.autor;
  const generos = req.body.generos;
  const npaginas = req.body.npaginas;
  const id = req.body.id;

  const sql = `UPDATE livros SET titulo=?, autor=?, generos=?, npaginas=? WHERE id=?`;
  const values = [titulo, autor, generos, npaginas, id];

  console.log("Query:", sql);
  console.log("Valores:", values);

  conexao.query(sql, values, (err, results) => {
    if (err) {
      console.error("Erro ao atualizar livro:", err);
      // Enviar uma resposta apropriada ao usuário, como um status code 500
      res.status(500).send("Ocorreu um erro ao atualizar o livro.");
    } else {
      res.redirect("/registros");
    }
  });
});
app.listen(8080);
