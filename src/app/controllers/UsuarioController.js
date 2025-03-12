import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conexao from "../database/conexao.js";
import { promisify } from "util";
import validator from "validator";

class UsuarioControler {
  async cadastrarUser(req, res) {
    const erros = [];
    const { name, gmail, password } = req.body;

    if (!name || !gmail || !password) {
      erros.push({ texto: "Preencha todos os campos." });
    }

    if (!validator.isEmail(gmail)) {
      erros.push({ texto: "E-mail inválido." });
    }

    if (password.length < 6) {
      erros.push({ texto: "A senha deve ter pelo menos 6 caracteres." });
    }

    if (erros.length > 0) {
      return res.render("Login", { erros }); // Evita continuar executando o restante do código
    }

    const buscar = "SELECT * FROM usuario WHERE gmail = ?";
    conexao.query(buscar, [gmail], async (erro, resultados) => {
      if (erro) {
        console.error("Erro ao buscar e-mail:", erro);
        return res.status(500).send("Erro no servidor.");
      }

      if (resultados.length > 0) {
        return res.status(422).send("E-mail já cadastrado.");
      }

      const salt = await bcrypt.genSalt(12);
      const senha = await bcrypt.hash(password, salt);

      const sqlInsert =
        "INSERT INTO usuario (name, gmail, password) VALUES (?, ?, ?)";
      conexao.query(sqlInsert, [name, gmail, password], (erro) => {
        if (erro) {
          console.error("Erro ao inserir usuário:", erro);
          return res.status(500).send("Erro ao cadastrar usuário.");
        }

        return res.redirect("Entrar"); // Redireciona para a página de login
      });
    });
  }

  async confirm(req, res) {
    try {
      const { gmail, password } = req.body;

      if (!gmail || !password) {
        res.send("obrigatorios preeencher todos os campos");
      }

      // Converte conexao.query para Promise
      const query = promisify(conexao.query).bind(conexao);

      // Consulta o usuário no banco
      const resultados = await query("SELECT * FROM usuario WHERE gmail = ?", [
        gmail,
      ]);

      if (resultados.length === 0) {
        return res.status(401).send("Credenciais inválidas."); // Mensagem genérica
      }

      // Verifica a senha
      const senhaValida = await bcrypt.compare(
        password,
        resultados[0].password
      );
      if (!senhaValida) {
        return res.status(401).send("Credenciais inválidas."); // Mesma mensagem para erro de senha
      }

      // Gera o token JWT
      const token = jwt.sign(
        { id: resultados[0].id, gmail: resultados[0].gmail },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Define o cookie e envia a resposta
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });
      return res.redirect("/cadastrarLivros");
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).send("Erro no servidor.");
    }
  }
}

export default new UsuarioControler();
