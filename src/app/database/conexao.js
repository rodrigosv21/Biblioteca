import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const conexao = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conexao.connect(function (erro) {
  if (erro) throw erro;
  console.log("Banco de dados funcionando");
});

export default conexao;
