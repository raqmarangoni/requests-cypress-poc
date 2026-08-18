const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const solicitacoes = [];
let proximoId = 1;

app.use(express.json());

const frontendLocal = path.join(__dirname, '..', 'public');
if (fs.existsSync(frontendLocal)) {
  app.use(express.static(frontendLocal));
}

app.get('/api/solicitacoes', (req, res) => {
  res.status(200).json(solicitacoes);
});

app.get('/api/solicitacoes/:id', (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = solicitacoes.find((item) => item.id === id);

  if (!solicitacao) {
    return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
  }

  return res.status(200).json(solicitacao);
});

app.post('/api/solicitacoes', (req, res) => {
  const { descricao, centroCusto, valor, nomeUsuario, roleUsuario } = req.body;

  if (!descricao || !descricao.trim()) {
    return res.status(400).json({ mensagem: 'A descrição é obrigatória.' });
  }

  if (!centroCusto || !centroCusto.trim()) {
    return res.status(400).json({ mensagem: 'O centro de custo é obrigatório.' });
  }

  const valorNumerico = Number(valor);
  if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
    return res.status(400).json({ mensagem: 'O valor deve ser numérico e maior que zero.' });
  }

  if (!nomeUsuario || !nomeUsuario.trim()) {
    return res.status(400).json({ mensagem: 'O nome do usuário é obrigatório.' });
  }

  if (roleUsuario !== 'Solicitante') {
    return res.status(403).json({
      mensagem: 'Somente usuários com a role Solicitante podem cadastrar solicitações.'
    });
  }

  const duplicada = solicitacoes.some(
    (item) =>
      item.descricao === descricao.trim() &&
      item.centroCusto === centroCusto.trim() &&
      item.valor === valorNumerico
  );

  if (duplicada) {
    return res.status(409).json({ mensagem: 'Já existe uma solicitação com os mesmos dados.' });
  }

  const solicitacao = {
    id: proximoId++,
    descricao: descricao.trim(),
    centroCusto: centroCusto.trim(),
    valor: valorNumerico,
    nomeUsuario: nomeUsuario.trim(),
    roleUsuario,
    criadoEm: new Date().toISOString()
  };

  solicitacoes.push(solicitacao);

  return res.status(201).json({
    mensagem: 'Solicitação cadastrada com sucesso.',
    solicitacao
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ mensagem: 'Endpoint não encontrado.' });
});

app.listen(PORT, () => {
  console.log(`API disponível na porta ${PORT}`);
});
