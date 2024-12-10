import express from "express";
import mysql2 from "mysql2";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const app = express();
dotenv.config();

// Usando import.meta.url para obter o caminho do diretório
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações e middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "views"))); // Pasta de imagens
app.use("/node_modules", express.static("node_modules")); // Dependências de node_modules
app.use("/css", express.static(path.join(__dirname, "css"))); // Pasta de CSS

// Configurar o motor de templates Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

//conexão com o banco de dados mysql e teste de conexão
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
app.get("/ajuda", (req, res) => {
  res.render("help");
});

app.get("/registros", (req, res) => {
  res.render("registros");
});

// Rota de cadastrar usuário
app.post("/login", async (req, res) => {
  const { name, gmail, password } = req.body;

  if (!name || !gmail || !password)
    return res.status(400).send("Preencha todos os campos.");

  const buscar = "SELECT * FROM usuario WHERE gmail = ?";
  conexao.query(buscar, [gmail], async (erro, resultados) => {
    if (resultados.length > 0)
      return res.status(422).send("Email já cadastrado.");

    const salt = await bcrypt.genSalt(12);
    const senha = await bcrypt.hash(password, salt);
    const sqlInsert =
      "INSERT INTO usuario (name, gmail, password) VALUES (?, ?, ?)";
    conexao.query(sqlInsert, [name, gmail, senha], (erro) => {
      if (erro) return res.status(500).send("Erro ao cadastrar usuário.");
      res.redirect("entrar");
    });
  });
});

// Rota de confirmação de login
app.post("/login/entrar", async (req, res) => {
  const { gmail, password } = req.body;

  const sqlSelect = "SELECT * FROM usuario WHERE gmail = ?";
  conexao.query(sqlSelect, [gmail], async (erro, resultados) => {
    if (resultados.length === 0)
      return res.status(404).send("Usuário não encontrado.");

    const senhaValida = await bcrypt.compare(password, resultados[0].password);
    if (!senhaValida) return res.status(401).send("Senha incorreta.");

    const token = jwt.sign(
      { id: resultados[0].id, gmail: resultados[0].gmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .cookie("authToken", token, { httpOnly: true, maxAge: 3600000 })
      .redirect("livros");
  });
});

//rota de cadastrar livros
app.post("/cadastrarlivros", (req, res) => {
  try {
    const { titulo, autor, generos, npaginas } = req.body;

    if (!titulo || !autor || !generos || !npaginas) {
      return res
        .status(400)
        .send("Dados inválidos. Verifique os campos enviados.");
    }

    const sql =
      "INSERT INTO livros (titulo, autor, generos, npaginas) VALUES (?, ?, ?, ?)";

    conexao.query(sql, [titulo, autor, generos, npaginas], (erro) => {
      if (erro) {
        console.error("Erro ao cadastrar o livro:", erro);
        return res.status(500).send("Erro ao salvar no banco de dados.");
      }

      console.log("Livro cadastrado com sucesso!");
      res.redirect("registros");
    });
  } catch (erro) {
    console.error("Erro inesperado:", erro);
    res.status(500).send("Erro inesperado. Tente novamente mais tarde.");
  }
});

//rota de registros onde vai da pra ver todos os livros cadastrados
app.get("/registros", (req, res) => {
  const sql = "SELECT * FROM livros";

  conexao.query(sql, function (erro, retorno) {
    res.render("registros", { livros: retorno });
  });
});

//pegar o livro por id para editar
app.get("/editarlivros/:id", (req, res) => {
  let sql = `SELECT * FROM livros WHERE id = ${req.params.id}`;

  conexao.query(sql, (erro, retorno) => {
    if (erro) throw erro;

    res.render("./editarlivros", { livros: retorno[0] });
  });
});

//rota de editar o livro
app.post("/editar", (req, res) => {
  const { titulo, autor, generos, npaginas, id } = req.body;

  if (!titulo || !autor || !generos || isNaN(npaginas)) {
    res.redirect("/ErroAoEditar");
  } else {
    const sql = `UPDATE livros SET titulo=?, autor=?, generos=?, npaginas=? WHERE id=?`;
    const values = [titulo, autor, generos, npaginas, id];

    conexao.query(sql, values, (erro, retorno) => {
      if (erro) {
        console.error("Erro ao atualizar livro:", erro);

        res.status(500).send("Ocorreu um erro ao atualizar o livro.");
      } else {
        res.redirect("/registros");
      }
    });
  }
});

//remover livros na aba de registros
app.get("/remover/:id", (req, res) => {
  try {
    const sql = `DELETE FROM livros WHERE id = ${req.params.id}`;

    conexao.query(sql, function (erro, retorno) {
      if (erro) throw erro;

      res.redirect("registros");
    });
  } catch (erro) {
    res.redirect("/FalhaRemover");
  }
});
app.listen(8080);
