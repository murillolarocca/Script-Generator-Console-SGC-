require("dotenv").config();
const path = require("path");
const express = require("express");
const { askSGC } = require("./aiClient");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// messages: histórico completo no formato da API Anthropic (stateless no servidor).
// Primeira chamada: [{role:"user", content: "pedido do usuário"}]
// Chamadas seguintes: histórico anterior + tool_result com as respostas do usuário.
app.post("/api/gerar", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ erro: "messages é obrigatório." });
    }
    const { assistantMessage, toolUse } = await askSGC(messages);
    res.json({
      messages: [...messages, assistantMessage],
      resultado: toolUse.input,
      toolUseId: toolUse.id,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SGC rodando em http://localhost:${PORT}`);
});
