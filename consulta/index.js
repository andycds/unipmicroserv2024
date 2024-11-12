const express = require('express')
const app = express()
app.use(express.json())

const baseConsulta = {}

const funcoes = {
    LembreteCriado: (lembrete) => {
        baseConsulta[lembrete.contador] = lembrete;
    },
    ObservacaoCriada: (observacao) => {
        const observacoes = baseConsulta[observacao.lembreteId]["observacoes"] || []
        observacoes.push(observacao)
        baseConsulta[observacao.lembreteId]["observacoes"] = observacoes
    }
}

app.get("/lembretes", (req, res) => {
    res.send(baseConsulta)
})

app.post("/eventos", (req, res) => {
    funcoes[req.body.tipo](req.body.dados)
    res.send({ msg: "ok" })
})

app.listen(6001, () => console.log("Consultas. Porta 6001."))