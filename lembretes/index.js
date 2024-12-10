require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mysql = require('mysql2')
const { v4: uuidv4 } = require('uuid');
const app = express()
app.use(express.json())
app.use(cors())

const { DB_HOST, DB_USER, DB_DATABASE, DB_PASSWORD, DB_PORT } = process.env

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

app.get('/lembretes', (req, res) => {
    pool.query("select * from tb_lembrete", (error, results, fields) => {
        res.send(results)
    })
})

app.post('/lembretes', async (req, res) => {
    const id = uuidv4(); // contador++
    const { texto } = req.body

    const sql = "insert into tb_lembrete (id, texto) values (?, ?)"
    pool.query(sql,
        [id, texto],
        (err, results, fields) => {
            console.log(results)
        })

    // lembretes[contador] = {
    //     contador, texto
    // }
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteCriado",
        dados: {
            id,
            texto,
        }
    })
    res.status(201).send({
        id,
        texto,
    })
})

app.delete('/lembretes/:id/', async (req, res) => {
    const id = req.params.id

    const sql = "delete from tb_lembrete where id = ?"
    pool.query(sql,
        [id],
        (err, results, fields) => {
            console.log(results)
        })
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteApagado",
        dados: {
            id,
        }
    })
    res.send({ msg: "deleted" })
});

app.patch('/lembretes/:id/', async (req, res) => {
    const id = req.params.id
    const { texto } = req.body
    const sql = "update tb_lembrete set texto = ? where id = ?"
    pool.query(sql,
        [texto, id],
        (err, results, fields) => {
            console.log(results)
        })
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteAtualizado",
        dados: {
            id,
            texto
        }
    })
    res.send({ id, texto })
});


app.post("/eventos", (req, res) => {
    console.log(req.body);
    res.send({ msg: "ok" });
});

app.listen(4000, () => {
    console.log('Lembretes. Porta 4000.')
})