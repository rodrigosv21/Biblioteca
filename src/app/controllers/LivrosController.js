import conexao from "../database/conexao.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; 

  if (!token) {
    return res.status(401).send("Acesso negado. Faça login primeiro.");
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    res.status(403).send("Token inválido ou expirado.");
  }
};

class LivroController {
  async cadastrar(req, res) {
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
        res.redirect("/registros");
      });
    } catch (erro) {
      console.error("Erro inesperado:", erro);
      res.status(500).send("Erro inesperado. Tente novamente mais tarde.");
    }
  }

  async listarTudo(req, res) {
    const sql = "SELECT * FROM livros";

    conexao.query(sql, (erro, retorno) => {
      if (erro) {
        console.error("Erro ao buscar livros:", erro);
        return res.status(500).send("Erro ao buscar livros.");
      }


      console.log("Livros retornados:", retorno);
      res.render("EditarLivros", { livros: retorno });
    });
  }

  async buscar(req, res) {
    const sql = "SELECT * FROM livros WHERE id = ?";
  
    conexao.query(sql, [req.params.id], (erro, retorno) => {
      if (erro) {
        console.error("Erro ao buscar o livro:", erro);
        return res.status(500).send("Erro ao buscar o livro.");
      }
  
      if (retorno.length === 0) {
        return res.status(404).send("Livro não encontrado.");
      }
  
      const livro = retorno[0]; // Retorna o primeiro livro encontrado
  
      res.render("EditarLivros", { livros: livro });
    });
  }
  

  async atualizar(req, res) {
    const { titulo, autor, generos, npaginas, id } = req.body;

    if (!titulo || !autor || !generos || isNaN(npaginas)) {
      return res.redirect("/ErroAoEditar");
    }

    const sql = `UPDATE livros SET titulo=?, autor=?, generos=?, npaginas=? WHERE id=?`;
    const values = [titulo, autor, generos, npaginas, id];

    conexao.query(sql, values, (erro) => {
      if (erro) {
        console.error("Erro ao atualizar livro:", erro);
        return res.status(500).send("Ocorreu um erro ao atualizar o livro.");
      }

      res.redirect("Registros");
    });
  }

  async deletar(req, res) {
    try {
      const sql = `DELETE FROM livros WHERE id = ?`;

      conexao.query(sql, [req.params.id], (erro) => {
        if (erro) {
          console.error("Erro ao deletar o livro:", erro);
          return res.status(500).send("Erro ao tentar deletar o livro.");
        }

        res.redirect("/registros");
      });
    } catch (erro) {
      console.error("Erro no catch ao tentar deletar:", erro);
      res.redirect("/FalhaRemover");
    }
  }
}

export default new LivroController();
