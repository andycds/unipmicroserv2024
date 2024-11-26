const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

const eventos = [];

app.post('/eventos', async (req, res) => {
    const evento = req.body;
    eventos.push(evento);
    //envia o evento para o microsserviço de lembretes
    try { await axios.post('http://localhost:4000/eventos', evento); } catch (e) { }
    //envia o evento para o microsserviço de observações
    try { await axios.post('http://localhost:5000/eventos', evento); } catch (e) { }
    //envia o evento para o microsserviço de consulta
    try { await axios.post('http://localhost:6001/eventos', evento); } catch (e) { }
    //envia o evento para o microsserviço de classificação
    try { await axios.post('http://localhost:7000/eventos', evento); } catch (e) { }
    res.send({ msg: "ok" });
});

app.get('/eventos', (req, res) => {
    res.send(eventos);
});

app.listen(10000, () => console.log("Barramento de eventos. Porta 10000."));