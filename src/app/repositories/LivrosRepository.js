class LivrosRepository {
  create() {
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
  }
  findAll() {}
  finById() {}
  update() {}
  delete() {}
}
