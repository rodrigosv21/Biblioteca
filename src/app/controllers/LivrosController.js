import conexao from "../database/conexao.js";

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
        res.redirect("registros");
      });
    } catch (erro) {
      console.error("Erro inesperado:", erro);
      res.status(500).send("Erro inesperado. Tente novamente mais tarde.");
    }
  }
  async listarTudo(req, res) {
    const sql = "SELECT * FROM livros";

    conexao.query(sql, function (erro, retorno) {
      if (erro) {
        console.error("Erro ao buscar livros:", erro);
        return res.status(500).send("Erro ao buscar livros.");
      }

      console.log("Livros retornados:", retorno);
      res.render("registros", { livros: retorno });
    });
  }

  async buscar(req, res) {
    let sql = `SELECT * FROM livros WHERE id = ${req.params.id}`;

    conexao.query(sql, (erro, retorno) => {
      if (erro) throw erro;

      res.render("./editarlivros", { livros: retorno[0] });
    });
  }

  async atualizar(req, res) {
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
  }

  async deletar(req, res) {
    try {
      const sql = `DELETE FROM livros WHERE id = ${req.params.id}`;

      conexao.query(sql, function (erro, retorno) {
        if (erro) throw erro;

        res.redirect("registros");
      });
    } catch (erro) {
      res.redirect("/FalhaRemover");
    }
  }
}

export default new LivroController();
