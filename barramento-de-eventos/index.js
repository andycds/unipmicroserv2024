const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

app.post('/eventos', (req, res) => {
    const evento = req.body;
    //envia o evento para o microsserviço de lembretes
    axios.post('http://localhost:4000/eventos', evento);
    //envia o evento para o microsserviço de observações
    axios.post('http://localhost:5000/eventos', evento);
    //envia o evento para o microsserviço de consulta
    axios.post('http://localhost:6001/eventos', evento);
    //envia o evento para o microsserviço de classificação
    axios.post('http://localhost:7000/eventos', evento);
    res.send({ msg: "ok" });
});

app.listen(10000, () => console.log("Barramento de eventos. Porta 10000."));