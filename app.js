//importações
import express from "express";
import mysql2 from "mysql2";
import { engine } from "express-handlebars";
const app = express();

//configurações
app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"));
app.use("/css", express.static("./css"));
app.engine(
  "handlebars",
  engine({
    helpers: {
      // Função auxiliar para verificar igualdade
      condicionalIgualdade: function (parametro1, parametro2, options) {
        return parametro1 === parametro2
          ? options.fn(this)
          : options.inverse(this);
      },
    },
  })
);
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

//rota de registros onde vai da pra ver todos os livros cadastrados
app.get("/registros", (req, res) => {
  const sql = "SELECT * FROM livros";

  conexao.query(sql, function (erro, retorno) {
    res.render("registros", { livros: retorno });
  });
});

//rotas da situação
app.get("/:situacao", (req, res) => {
  const sql = `INSERT INTO usuario(nome, email, senha) VALUES ('${nome}', '${email}', ${senha})`;
  conexao.query(sql, function (erro, retorno) {
    res.render("login", { usuarios: retorno, situacao: req.params.situacao });
  });
});

app.get("/:livro", (req, res) => {
  conexao.query(sql, function (erro, retorno) {
    res.render("livros", { livros: retorno, livro: req.params.livro });
  });
});

//rota de cadastrar usuario
app.post("/login", (req, res) => {
  try {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if (nome == "" || email == "" || isNaN(senha)) {
      res.redirect("/falhaNoCadastro");
    } else {
      const sql = `INSERT INTO usuario(nome, email, senha) VALUES ('${nome}', '${email}', ${senha})`;
      conexao.query(sql, (erro, retorno) => {
        if (erro) {
          console.error(erro);
        } else {
          console.log("Cadastrado com Sucesso!!");
        }
      });
      res.redirect("/entrar");
    }
  } catch (erro) {
    res.redirect("/falhaNoCadastro");
  }
});

//rota de cadastrar livros
app.post("/cadastrarlivros", (req, res) => {
  try {
    const titulo = req.body.titulo;
    const autor = req.body.autor;
    const generos = req.body.generos;
    const npaginas = req.body.npaginas;

    if (titulo == "" || autor == "" || generos == "" || isNaN(npaginas)) {
      res.redirect("/ErroNoCadastrarlivros");
    } else {
      const sql = `INSERT INTO livros(titulo, autor, generos, npaginas) VALUES ('${titulo}', '${autor}', '${generos}', ${npaginas})`;
      conexao.query(sql, (erro, retorno) => {
        if (erro) {
          console.error(erro);
        } else {
          console.log("livro cadastrado");
        }
      });
      res.redirect("/cadastrarlivros");
    }
  } catch (erro) {
    res.redirect("/Erro");
  }
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
  const titulo = req.body.titulo;
  const autor = req.body.autor;
  const generos = req.body.generos;
  const npaginas = req.body.npaginas;
  const id = req.body.id;

  if (titulo == "" || autor == "" || generos == "" || isNaN(npaginas)) {
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

      res.redirect("/listarlivros");
    });
  } catch (erro) {
    res.redirect("/FalhaAoRemover");
  }
});
app.listen(8080);
