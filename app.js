const express = require("express");

const { engine } = require ('express-handlebars')

const mysql = require("mysql2")

const app = express();

app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"))

app.use("css", express.static('./css'))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "login"
});

conexao.connect(function(erro){
    if (erro) throw erro;
    console.log("Sucesso!!!")
})


app.get("/", (req, res) =>{
    res.render("formulario");
})

app.listen(8080);