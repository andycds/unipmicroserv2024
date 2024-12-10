const express = require('express');
const app = express();
app.use(express.json());
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cors = require('cors')
app.use(cors())

const observacoesPorLembreteId = {};

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes = observacoesPorLembreteId[observacao.lembreteId];
        const obsParaAtualizar = observacoes.find(o => o.id === observacao.id);
        obsParaAtualizar.status = observacao.status;
        axios.post('http://localhost:10000/eventos', {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                lembreteId: observacao.lembreteId,
                status: observacao.status
            }
        });
    }
}

app.get('/lembretes/:id/observacoes', (req, res) => {
    res.send(observacoesPorLembreteId[req.params.id] || []);
});

app.post('/lembretes/:id/observacoes', async (req, res) => {
    // Gerar um novo identificador para a observação a ser inserida
    const idObs = uuidv4();
    // Extrair do corpo da requisição o texto da observação
    const { texto } = req.body;
    // Verificar se o id de lembrete existente na URL já existe na base e está associado a uma coleção. Em caso positivo, prosseguir utilizando a coleção existente. Caso contrário, criar uma nova coleção
    const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || []
    // Adicionar a nova observação à coleção de observações recém obtida ou criada
    observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' });
    // Fazer com que o identificador do lembrete existente na URL esteja associado a essa nova coleção alterada, na base de observações por id de lembrete
    observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
    // Enviar evento de criação de observação para o barramento de eventos
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs, texto, lembreteId: req.params.id, status: 'aguardando'
        }
    })

    // Devolver uma resposta ao usuário envolvendo o código de status HTPP e algum objeto de interesse, possivelmente a observação inserida ou, ainda, a coleção inteira de observações
    res.status(201).send(observacoesDoLembrete);
});

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados)
    } catch (err) {
        console.log("Ignorando: " + req.body.tipo)
    }
    res.send({ msg: "ok" });
});

app.listen(5000, () => console.log("Lembretes. Porta 5000."));