const express = require("express");
const { engine } = require("express-handlebars");
const mysql = require("mysql2");
const app = express();
app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"));
app.use("css", express.static("./css"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.set("views", "./views");

app.use(express.json()); //manipulação via json
app.use(express.urlencoded({ extended: false }));

const conexao = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login",
});

conexao.connect(function (erro) {
  if (erro) throw erro;
  console.log("Sucesso!!!");
});

app.get("/", (req, res) => {
  res.render("formulario");
});

app.post("/cadastrar", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;

  const sql = `INSERT INTO usuario(nome, email, senha) VALUES ('${nome}', '${email}', ${senha})`;
  conexao.query(sql, (erro, retorno) => {
    if (erro) {
      console.error(erro);
    } else {
      console.log("dados inseridos com sucesso");
    }
  });
  res.redirect("/");
});

app.listen(8080);
