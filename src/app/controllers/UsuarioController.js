import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conexao from "../database/conexao.js";

class UsuarioControler {
  async cadastrarUser(req, res) {
    const erros = [];

    const { name, gmail, password } = req.body;

    if (!name || !gmail || !password) {
      erros.push({ texto: "preencha todos campos" });
    }

    if (erros.length > 0) {
      res.render("login", { erros: erros });
    } else {
      const buscar = "SELECT * FROM usuario WHERE gmail = ?";
      conexao.query(buscar, [gmail], async (erro, resultados) => {
        if (resultados.length > 0)
          return res.status(422).send("Email já cadastrado.");

        const salt = await bcrypt.genSalt(12);
        const senha = await bcrypt.hash(password, salt);
        const sqlInsert =
          "INSERT INTO usuario (name, gmail, password) VALUES (?, ?, ?)";
        req.flash("success_msg", "cadastrado com sucesso");

        conexao.query(sqlInsert, [name, gmail, senha], (erro) => {
          if (erro) req.flash("error_msg", "erro");
          res.redirect("entrar");
        });
      });
    }
  }

  async confirm(req, res) {
    const { gmail, password } = req.body;

    const sqlSelect = "SELECT * FROM usuario WHERE gmail = ?";
    conexao.query(sqlSelect, [gmail], async (erro, resultados) => {
      if (resultados.length === 0)
        return res.status(404).send("Usuário não encontrado.");

      const senhaValida = await bcrypt.compare(
        password,
        resultados[0].password
      );
      if (!senhaValida) return res.status(401).send("Senha incorreta.");

      const token = jwt.sign(
        { id: resultados[0].id, gmail: resultados[0].gmail },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res
        .cookie("authToken", token, { httpOnly: true, maxAge: 3600000 })
        .redirect("/livros");
    });
  }
}

export default new UsuarioControler();
